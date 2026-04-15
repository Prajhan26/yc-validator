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

function checkBuzzwords(description: string): string[] {
  const lower = description.toLowerCase();
  return BUZZWORDS.filter((word) => lower.includes(word.toLowerCase()));
}

function checkTarpitMatch(description: string): string | null {
  const lower = description.toLowerCase();
  const match = TARPIT_PATTERNS.find((pattern) =>
    lower.includes(pattern.toLowerCase())
  );
  return match ?? null;
}

function checkWarnings(input: EvalInput): string[] {
  const warnings: string[] = [];
  const wordCount = input.startup_description.trim().split(/\s+/).length;

  if (wordCount < 10) {
    warnings.push("Startup description is very short — evaluation quality will be low.");
  }

  if (!input.is_full_time) {
    warnings.push("Founder is not full-time — this will affect founder_fit scoring.");
  }

  return warnings;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function runHeuristics(input: EvalInput): HeuristicResult {
  return {
    buzzwords_detected: checkBuzzwords(input.startup_description),
    tarpit_match:       checkTarpitMatch(input.startup_description),
    warnings:           checkWarnings(input),
  };
}
