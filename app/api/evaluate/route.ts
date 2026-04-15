import Anthropic from "@anthropic-ai/sdk";
import { EvalInputSchema, EvalOutputSchema } from "../../../lib/evaluator/schema";
import { runHeuristics } from "../../../lib/evaluator/heuristics";
import { retrieveContext } from "../../../lib/evaluator/retrieval";
import { assemblePrompt } from "../../../lib/evaluator/prompt";

export async function POST(request: Request) {
  // ── Rule 10: env var check ────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set." },
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
    context = retrieveContext(`${input.company_description} ${input.problem_description} ${input.competitors}`);
  } catch {
    return Response.json(
      { error: "Failed to load knowledge base." },
      { status: 500 }
    );
  }

  // ── Prompt assembly ───────────────────────────────────────────────────────
  const { system, user } = assemblePrompt(input, context);

  // ── Model call ────────────────────────────────────────────────────────────
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let rawContent: string;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      return Response.json({ error: "Unexpected response type from model." }, { status: 500 });
    }
    rawContent = block.text;
  } catch {
    return Response.json({ error: "Model call failed." }, { status: 502 });
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
  const combinedText = `${input.company_description} ${input.problem_description}`;
  const hasConcreteNumbers = /\d/.test(combinedText);
  const isPreLaunch = input.stage === "idea";
  if (!hasConcreteNumbers && !isPreLaunch && scores.traction_and_evidence.score > 3) {
    scores.traction_and_evidence = { ...scores.traction_and_evidence, score: 3 };
  }

  // Rule: product description unclear — if company_description is under 15 words, cap solution_clarity at 3
  const wordCount = input.company_description.trim().split(/\s+/).length;
  if (wordCount < 15 && scores.solution_clarity.score > 3) {
    scores.solution_clarity = { ...scores.solution_clarity, score: 3 };
  }

  // Rule: if founder claims no competitors, ensure a major concern is present
  const noCompetitorClaim = /no competitor|no competition|no one else|first in the world|only (one|product|solution)/i
    .test(input.competitors);
  const concerns = [...output.major_concerns];
  if (noCompetitorClaim && !concerns.some((c) => /competitor|market|competition/i.test(c))) {
    concerns.push("Founder claims no competitors exist — this is rarely true and suggests limited market research.");
  }

  output.dimension_scores = scores;
  output.major_concerns = concerns.slice(0, 5);

  // ── Return response ───────────────────────────────────────────────────────
  return Response.json(output);
}
