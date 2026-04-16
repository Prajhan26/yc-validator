import type { EvalInput } from "./schema";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AssembledPrompt {
  system: string;
  user: string;
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystem(context: string): string {
  return `You are a rigorous startup idea evaluator trained on YC-aligned thinking. You are not a YC partner and do not speak for YC. You provide structured, evidence-based diagnostic feedback.

Use the following YC knowledge as your evaluation framework:

<yc_knowledge>
${context}
</yc_knowledge>

You must respond with a single valid JSON object matching this exact schema:

{
  "overall_assessment": "string — 2 to 4 sentence summary of the idea's current state. No verdict language.",
  "dimension_scores": {
    "problem_quality":       { "score": <1-10 integer>, "reason": "string" },
    "founder_fit":           { "score": <1-10 integer>, "reason": "string" },
    "solution_clarity":      { "score": <1-10 integer>, "reason": "string" },
    "market_potential":      { "score": <1-10 integer>, "reason": "string" },
    "traction_and_evidence": { "score": <1-10 integer>, "reason": "string" }
  },
  "confidence_by_dimension": {
    "problem_quality":       "low" | "medium" | "high",
    "founder_fit":           "low" | "medium" | "high",
    "solution_clarity":      "low" | "medium" | "high",
    "market_potential":      "low" | "medium" | "high",
    "traction_and_evidence": "low" | "medium" | "high"
  },
  "major_concerns":     ["string"] (0 to 5 items),
  "strong_signals":     ["string"] (0 to 5 items),
  "critical_questions": ["string"] (0 to 5 items),
  "missing_evidence":   ["string"] (0 to 5 items),
  "next_3_moves":       ["string", "string", "string"] (exactly 3 items),
  "hard_truth":         "string — one direct sentence about the most critical risk or flaw"
}

HARD RULES you must follow when scoring:
- Do not use verdict, accepted, rejected, pass, or fail language anywhere.
- If traction is claimed but no concrete numbers are given, traction_and_evidence score must be 3 or below, unless the founder explicitly states they are pre-launch.
- If the founder claims there are no competitors, you must add a major concern about market understanding.
- If the product description is unclear or incomprehensible, solution_clarity score must be 3 or below.
- If the founding team lacks domain expertise in the area, founder_fit score must be 3 or below.
- next_3_moves must contain exactly 3 items — no more, no fewer.
- Return JSON only. No prose before or after the JSON object.`;
}

// ── User prompt ───────────────────────────────────────────────────────────────

function buildUser(input: EvalInput): string {
  const lines: string[] = [
    `What the company does: ${input.company_description}`,
    `Problem being solved and who has it: ${input.problem_description}`,
    `Why this founder: ${input.founder_context}`,
    `Stage: ${input.stage}`,
    `Competitors and insight: ${input.competitors}`,
    `Domain expertise: ${input.domain_expertise ? "yes" : "no"}`,
  ];

  // Progress follow-up — conditional on stage
  if (input.progress_detail) {
    lines.push(`Progress context: ${input.progress_detail}`);
  } else if (input.is_full_time !== undefined) {
    lines.push(`Full-time: ${input.is_full_time ? "yes" : "no"}`);
  }

  if (input.buzzwords_detected && input.buzzwords_detected.length > 0) {
    lines.push(`Buzzwords detected: ${input.buzzwords_detected.join(", ")}`);
  }

  if (input.tarpit_match) {
    lines.push(`Potential tarpit pattern: ${input.tarpit_match}`);
  }

  return lines.join("\n");
}

// ── Public API ────────────────────────────────────────────────────────────────

export function assemblePrompt(input: EvalInput, context: string): AssembledPrompt {
  return {
    system: buildSystem(context),
    user:   buildUser(input),
  };
}
