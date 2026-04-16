import type { EvalInput } from "./schema";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HeuristicResult {
  buzzwords_detected: string[];
  tarpit_match: string | null;
  warnings: string[];
}

// ── Keyword lists ─────────────────────────────────────────────────────────────

const BUZZWORDS = [
  "AI", "blockchain", "Web3", "crypto", "NFT", "metaverse",
  "disruptive", "disruption", "revolutionary", "game-changer",
  "paradigm shift", "next-gen", "cutting-edge", "innovative solution",
  "synergy", "ecosystem", "democratize", "leverage",
];

const TARPIT_PATTERNS = [
  "consumer social", "social network", "social media", "social app",
  "dating app", "gig economy", "on-demand", "uber for",
  "airbnb for", "marketplace", "two-sided marketplace",
  "aggregator", "platform for everyone", "super app",
];

// ── Checks ────────────────────────────────────────────────────────────────────

function checkBuzzwords(text: string): string[] {
  const lower = text.toLowerCase();
  return BUZZWORDS.filter((word) => lower.includes(word.toLowerCase()));
}

function checkTarpitMatch(text: string): string | null {
  const lower = text.toLowerCase();
  const match = TARPIT_PATTERNS.find((pattern) =>
    lower.includes(pattern.toLowerCase())
  );
  return match ?? null;
}

function checkWarnings(input: EvalInput): string[] {
  const warnings: string[] = [];

  const wordCount = input.company_description.trim().split(/\s+/).length;
  if (wordCount < 10) {
    warnings.push("Company description is very short — evaluation quality will be low.");
  }

  // Only warn when is_full_time is explicitly false (not undefined — users/revenue stage omits it)
  if (input.is_full_time === false) {
    warnings.push("Founder is not full-time — this will affect founder_fit scoring.");
  }

  return warnings;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function runHeuristics(input: EvalInput): HeuristicResult {
  // Run checks across company description, problem, and competitor fields combined
  const combinedText = `${input.company_description} ${input.problem_description} ${input.competitors}`;
  return {
    buzzwords_detected: checkBuzzwords(combinedText),
    tarpit_match:       checkTarpitMatch(combinedText),
    warnings:           checkWarnings(input),
  };
}
