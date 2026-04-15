import fs from "fs";
import path from "path";

// ── File map ──────────────────────────────────────────────────────────────────
// Each entry maps a distilled file to the keywords that make it relevant.
// Keyword match count determines which files get selected.

const DISTILLED_DIR = path.join(process.cwd(), "Knowledge", "yc", "distilled");

const FILE_KEYWORDS: Record<string, string[]> = {
  "founder-evaluation.md":      ["founder", "team", "cofounder", "co-founder", "technical", "experience", "expertise", "solo", "hire"],
  "problem-idea-evaluation.md": ["problem", "idea", "solution", "pain", "need", "market fit", "why now", "insight"],
  "market-timing.md":           ["market", "timing", "size", "trend", "wave", "adoption", "growth", "industry"],
  "traction-validation.md":     ["traction", "users", "revenue", "growth", "validation", "customers", "retention", "mrr"],
  "red-flags.md":               ["pivot", "vague", "buzzword", "AI", "blockchain", "platform", "marketplace", "social", "tarpit"],
  "green-flags.md":             ["insight", "unique", "monopoly", "unfair advantage", "obsessed", "domain", "10x"],
};

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreFile(idea: string, keywords: string[]): number {
  const lower = idea.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
}

// ── Public API ────────────────────────────────────────────────────────────────

// Returns the top 3 most relevant distilled files concatenated as one string.
// Always includes red-flags.md — it is relevant to every evaluation.
// Total output is capped at 2000 words to stay within prompt budget.

export function retrieveContext(idea: string): string {
  const scored = Object.entries(FILE_KEYWORDS)
    .map(([file, keywords]) => ({ file, score: scoreFile(idea, keywords) }))
    .sort((a, b) => b.score - a.score);

  // Always include red-flags, then take top 2 from the ranked list (excluding red-flags if already in top)
  const alwaysInclude = "red-flags.md";
  const top = scored
    .filter((entry) => entry.file !== alwaysInclude)
    .slice(0, 2)
    .map((entry) => entry.file);

  const selected = [alwaysInclude, ...top];

  const sections = selected.map((file) => {
    const filePath = path.join(DISTILLED_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    return content;
  });

  const combined = sections.join("\n\n---\n\n");

  // Cap at ~2000 words
  const words = combined.split(/\s+/);
  if (words.length <= 2000) return combined;
  return words.slice(0, 2000).join(" ");
}
