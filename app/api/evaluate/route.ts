export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { ApiError, GoogleGenAI } from "@google/genai";
import { EvalInputSchema, EvalOutputSchema } from "../../../lib/evaluator/schema";
import { runHeuristics } from "../../../lib/evaluator/heuristics";
import { retrieveContext } from "../../../lib/evaluator/retrieval";
import { assemblePrompt } from "../../../lib/evaluator/prompt";
import { insertSubmission } from "../../../lib/db";

// ── Gemini structured-output schema ─────────────────────────────────────────
// Forces the model to return JSON matching the locked EvalOutput schema.
const DIMENSION_KEYS = [
  "problem_quality",
  "founder_fit",
  "solution_clarity",
  "market_potential",
  "traction_and_evidence",
] as const;

const dimensionScoreSchema = {
  type: "OBJECT",
  properties: {
    score: { type: "INTEGER" },
    reason: { type: "STRING" },
  },
  required: ["score", "reason"],
} as const;

const confidenceSchema = {
  type: "STRING",
  enum: ["low", "medium", "high"],
} as const;

const responseSchema = {
  type: "OBJECT",
  properties: {
    overall_assessment: { type: "STRING" },
    dimension_scores: {
      type: "OBJECT",
      properties: Object.fromEntries(
        DIMENSION_KEYS.map((key) => [key, dimensionScoreSchema]),
      ),
      required: [...DIMENSION_KEYS],
    },
    confidence_by_dimension: {
      type: "OBJECT",
      properties: Object.fromEntries(
        DIMENSION_KEYS.map((key) => [key, confidenceSchema]),
      ),
      required: [...DIMENSION_KEYS],
    },
    major_concerns: { type: "ARRAY", items: { type: "STRING" } },
    strong_signals: { type: "ARRAY", items: { type: "STRING" } },
    critical_questions: { type: "ARRAY", items: { type: "STRING" } },
    missing_evidence: { type: "ARRAY", items: { type: "STRING" } },
    next_3_moves: { type: "ARRAY", items: { type: "STRING" } },
    hard_truth: { type: "STRING" },
  },
  required: [
    "overall_assessment",
    "dimension_scores",
    "confidence_by_dimension",
    "major_concerns",
    "strong_signals",
    "critical_questions",
    "missing_evidence",
    "next_3_moves",
    "hard_truth",
  ],
} as const;

// Stable Gemini Flash models, in priority order. Keep the fallback narrow so an expected
// quota response reaches the UI immediately instead of triggering a long model sweep.
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

const MAX_MODEL_ATTEMPTS = 2;
const GEMINI_REQUEST_TIMEOUT_MS = 12_000;
const RETRYABLE_MODEL_STATUSES = new Set([408, 500, 502, 503, 504]);
const MODEL_NOT_FOUND_STATUS = 404;

class GeminiQuotaError extends Error {}
class GeminiRequestTimeoutError extends Error {}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function generateReview(ai: GoogleGenAI, system: string, user: string) {
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_MODEL_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);
      try {
        return await ai.models.generateContent({
          model: modelName,
          contents: user,
          config: {
            systemInstruction: system,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
            responseSchema,
            abortSignal: controller.signal,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        lastError = error;
        const status = error instanceof ApiError ? error.status : undefined;

        if (error instanceof Error && error.name === "AbortError") {
          throw new GeminiRequestTimeoutError("Gemini did not respond in time.");
        }
        if (status === 429 || /quota|rate limit|resource_exhausted/i.test(errorMessage)) {
          throw new GeminiQuotaError("Gemini quota is exhausted or rate limited.");
        }

        // If this model is not available or deprecated on this key, break to try next model candidate
        if (status === MODEL_NOT_FOUND_STATUS) {
          console.warn(
            `Model ${modelName} not found or unsupported on this key. Trying next available model.`,
          );
          break; // Move to next model in GEMINI_MODELS
        }

        const canRetry =
          attempt < MAX_MODEL_ATTEMPTS &&
          (status === undefined || RETRYABLE_MODEL_STATUSES.has(status));

        if (!canRetry) break;

        const delay = 750 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
        await sleep(delay);
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  // ── Env var check ─────────────────────────────────────────────────────────
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "GEMINI_API_KEY is not set." },
      { status: 500 }
    );
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  // ── Validate input ────────────────────────────────────────────────────────
  const parsed = EvalInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // ── Run heuristics and merge results into input ───────────────────────────
  const heuristics = runHeuristics(parsed.data);

  const input = {
    ...parsed.data,
    buzzwords_detected: parsed.data.buzzwords_detected ?? heuristics.buzzwords_detected,
    tarpit_match:       parsed.data.tarpit_match       ?? heuristics.tarpit_match,
  };

  // ── Retrieval ─────────────────────────────────────────────────────────────
  let context: string;
  try {
    context = retrieveContext(input.startup_description);
  } catch {
    return Response.json(
      { error: "Failed to load knowledge base." },
      { status: 500 }
    );
  }

  // ── Prompt assembly ───────────────────────────────────────────────────────
  const { system, user } = assemblePrompt(input, context);

  // ── Model call (Google GenAI / Gemini) ────────────────────────────────────
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let rawContent: string;
  try {
    const response = await generateReview(ai, system, user);

    const text = response.text;
    if (!text) {
      return Response.json({ error: "Unexpected response type from model." }, { status: 500 });
    }
    rawContent = text;
  } catch (error) {
    const upstreamStatus = error instanceof ApiError ? error.status : undefined;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("Gemini review request failed.", { upstreamStatus, error: errorMessage });

    let userFacingError = "The AI reviewer could not generate a review right now.";
    let statusCode = 502;

    if (error instanceof GeminiQuotaError || upstreamStatus === 429 || /quota|rate limit|resource_exhausted/i.test(errorMessage)) {
      userFacingError = "Gemini is rate limited or its daily quota is exhausted. Please try again later.";
      statusCode = 429;
    } else if (error instanceof GeminiRequestTimeoutError) {
      userFacingError = "The AI reviewer is taking too long to respond. Please try again.";
      statusCode = 504;
    } else if (upstreamStatus === 400 || upstreamStatus === 401 || upstreamStatus === 403 || /API key|invalid/i.test(errorMessage)) {
      userFacingError = "Invalid or expired Gemini API key. Please check your GEMINI_API_KEY setting.";
      statusCode = 400;
    } else if (upstreamStatus === 404) {
      userFacingError = "The requested Gemini AI model is not available for your API key.";
      statusCode = 404;
    } else if (upstreamStatus !== undefined && RETRYABLE_MODEL_STATUSES.has(upstreamStatus)) {
      userFacingError = "The AI reviewer is temporarily busy. Please try again in a moment.";
      statusCode = 503;
    }

    return Response.json(
      { error: userFacingError, details: errorMessage },
      {
        status: statusCode,
        headers: statusCode === 503 || statusCode === 429 ? { "Retry-After": "10" } : undefined,
      },
    );
  }

  // ── Parse model JSON ──────────────────────────────────────────────────────
  // Strip markdown code fences if the model wraps the JSON (e.g. ```json ... ```)
  const fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const stripped = fenceMatch ? fenceMatch[1].trim() : rawContent.trim();

  let parsed_output: unknown;
  try {
    parsed_output = JSON.parse(stripped);
  } catch {
    return Response.json(
      { error: "Model returned invalid JSON." },
      { status: 502 }
    );
  }

  // ── Validate output against locked schema ─────────────────────────────────
  const validated = EvalOutputSchema.safeParse(parsed_output);
  if (!validated.success) {
    return Response.json(
      { error: "Model output did not match locked schema.", details: validated.error.flatten() },
      { status: 502 }
    );
  }

  // ── Hard rule enforcement ─────────────────────────────────────────────────
  // Post-parse correction pass — enforces locked hard rules regardless of what
  // the model returned. Schema-valid output can still violate these rules.
  const output = { ...validated.data };
  const scores = { ...output.dimension_scores };

  // Rule: technical product with no technical founder → founder_fit capped at 3
  if (input.is_technical === false && scores.founder_fit.score > 3) {
    scores.founder_fit = { ...scores.founder_fit, score: 3 };
  }

  // Rule: traction claimed but no concrete numbers and not pre-launch → traction_and_evidence capped at 3
  const hasConcreteNumbers = /\d/.test(input.startup_description);
  const isPreLaunch = input.stage === "idea";
  if (!hasConcreteNumbers && !isPreLaunch && scores.traction_and_evidence.score > 3) {
    scores.traction_and_evidence = { ...scores.traction_and_evidence, score: 3 };
  }

  // Rule: product description unclear (solution_clarity already scored low by model) —
  // if solution_clarity is 3 or below in model output, respect it; no override needed.
  // If startup_description is under 15 words, cap solution_clarity at 3.
  const wordCount = input.startup_description.trim().split(/\s+/).length;
  if (wordCount < 15 && scores.solution_clarity.score > 3) {
    scores.solution_clarity = { ...scores.solution_clarity, score: 3 };
  }

  // Rule: if founder claims no competitors, ensure a major concern is present
  const noCompetitorClaim = /no competitor|no competition|no one else|first in the world|only (one|product|solution)/i
    .test(input.startup_description);
  const concerns = [...output.major_concerns];
  if (noCompetitorClaim && !concerns.some((c) => /competitor|market|competition/i.test(c))) {
    concerns.push("Founder claims no competitors exist — this is rarely true and suggests limited market research.");
  }

  output.dimension_scores = scores;
  output.major_concerns = concerns.slice(0, 5);

  // ── Store submission in SQLite ────────────────────────────────────────────
  try {
    insertSubmission({
      startup_description: input.startup_description,
      stage: input.stage,
      is_technical: input.is_technical,
      is_full_time: input.is_full_time,
      ai_feedback: JSON.stringify(output),
    });
  } catch {
    // Storage failure should not break the user-facing review flow.
    console.error("Failed to store submission in SQLite.");
  }

  // ── Return response ───────────────────────────────────────────────────────
  return Response.json(output);
}
