/**
 * Benchmark runner — validates the evaluator against 3 locked test cases.
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. In a second terminal: node scripts/benchmark.mjs
 *
 * Pass criteria (printed at the end):
 *   - Response is valid JSON with all required fields
 *   - All 5 dimensions present with scores 1–10
 *   - next_3_moves has exactly 3 items
 *   - hard_truth is present and non-empty
 *   - No verdict/accepted/rejected/pass/fail language anywhere
 *   - Hard rule fires on Case 2: founder_fit ≤ 3 (no technical founder)
 *   - Tarpit concern appears in Case 3 major_concerns
 */

const BASE_URL = "http://localhost:3000";

// ── Test cases ────────────────────────────────────────────────────────────────

const CASES = [
  {
    label: "Case 1 — Strong Idea (B2B dev tool, revenue, technical founders)",
    input: {
      company_description:
        "We built a B2B dev tool that automatically detects and fixes memory leaks in production Node.js apps. We have 12 paying customers at $400 MRR and grew 40% last month. Both founders are senior engineers who spent 5 years debugging performance issues at scale.",
      problem_description:
        "Memory leaks in production Node.js apps silently kill performance and are almost impossible to reproduce locally. Engineering teams lose days diagnosing them — we have seen teams spend 3–5 days on a single incident. The problem is chronic, expensive, and has no good automated solution.",
      founder_context:
        "Both founders spent 5 years as senior engineers dealing with this exact problem at scale. We have fixed hundreds of memory leaks in production and know every failure pattern.",
      stage: "revenue",
      competitors:
        "New Relic and Datadog do APM broadly but do not specialize in memory leak detection or automated fixes. We go deeper on one problem they treat as a footnote.",
      domain_expertise: true,
      progress_detail: "Both founders have been working on this full-time for 8 months. We quit our jobs the day we got our first paying customer.",
    },
    checks: [
      {
        label: "founder_fit ≥ 7 (strong founder-market fit)",
        fn: (r) => r.dimension_scores.founder_fit.score >= 7,
      },
      {
        label: "traction_and_evidence ≥ 5 (revenue stage)",
        fn: (r) => r.dimension_scores.traction_and_evidence.score >= 5,
      },
    ],
  },
  {
    label: "Case 2 — Weak Idea (consumer app, no technical founder, part-time)",
    input: {
      company_description:
        "An app that uses AI to suggest what to cook based on what is in your fridge. You take a photo and it gives you recipe ideas.",
      problem_description:
        "People do not know what to cook and waste food. They open the fridge and have no inspiration.",
      founder_context:
        "I love cooking and have always wanted to make this app. I think a lot of people have this problem.",
      stage: "idea",
      competitors: "There are no real competitors doing this with AI and photos.",
      domain_expertise: false,
      is_full_time: false,
    },
    checks: [
      {
        label: "HARD RULE: founder_fit ≤ 3 (no domain expertise)",
        fn: (r) => r.dimension_scores.founder_fit.score <= 3,
      },
      {
        label: "HARD RULE: competitor concern present (claimed no competitors)",
        fn: (r) =>
          r.major_concerns.some((c) =>
            /competitor|competition|market/i.test(c)
          ),
      },
    ],
  },
  {
    label: "Case 3 — Tarpit (Uber for dog walking, two-sided marketplace)",
    input: {
      company_description:
        "We are building an Uber for dog walking. Dog owners can book a nearby dog walker on demand through our app. We have a two-sided marketplace with walkers and owners.",
      problem_description:
        "Dog owners struggle to find reliable dog walkers on short notice. Existing platforms are slow and hard to trust.",
      founder_context:
        "I have a dog and have had trouble finding walkers. I think the market is huge and the experience is broken.",
      stage: "mvp",
      competitors:
        "Rover and Wag exist but they are not on-demand. We are faster and more local.",
      domain_expertise: true,
      is_full_time: true,
    },
    checks: [
      {
        label: "Tarpit/marketplace concern in major_concerns",
        fn: (r) =>
          r.major_concerns.some((c) =>
            /marketplace|tarpit|rover|wag|incumbent|two-sided/i.test(c)
          ),
      },
      {
        label: "traction_and_evidence ≤ 5 (no numbers given)",
        fn: (r) => r.dimension_scores.traction_and_evidence.score <= 5,
      },
    ],
  },
];

// ── Shared checks (run on every case) ────────────────────────────────────────

// Matches verdict language used as a judgment on the idea/founder, not natural English.
// "fails to serve", "pass/fail" in other contexts, "failing market" etc. are NOT verdicts.
const VERDICT_PATTERN = /\b(accepted into|not accepted|rejected|your idea (passes|fails)|idea is (strong enough|not strong enough)|verdict[:\s]|this (passes|fails))\b/i;
const REQUIRED_DIMENSIONS = [
  "problem_quality",
  "founder_fit",
  "solution_clarity",
  "market_potential",
  "traction_and_evidence",
];

function runSharedChecks(r) {
  const results = [];

  // All 5 dimensions present with scores 1–10
  for (const dim of REQUIRED_DIMENSIONS) {
    const score = r.dimension_scores?.[dim]?.score;
    results.push({
      label: `dimension ${dim} present and scored 1–10`,
      pass: typeof score === "number" && score >= 1 && score <= 10,
    });
  }

  // next_3_moves exactly 3 items
  results.push({
    label: "next_3_moves has exactly 3 items",
    pass: Array.isArray(r.next_3_moves) && r.next_3_moves.length === 3,
  });

  // hard_truth present
  results.push({
    label: "hard_truth is present and non-empty",
    pass: typeof r.hard_truth === "string" && r.hard_truth.trim().length > 0,
  });

  // No verdict language
  const fullText = JSON.stringify(r);
  results.push({
    label: "no verdict/accepted/rejected/pass/fail language",
    pass: !VERDICT_PATTERN.test(fullText),
  });

  return results;
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function runCase(c, index) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${c.label}`);
  console.log(`${"─".repeat(60)}`);

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c.input),
    });
  } catch (err) {
    console.log(`  ✗ NETWORK ERROR — is the dev server running? (${err.message})`);
    return { passed: 0, failed: 1, total: 1 };
  }

  if (!res.ok) {
    const body = await res.text();
    console.log(`  ✗ HTTP ${res.status} — ${body}`);
    return { passed: 0, failed: 1, total: 1 };
  }

  let r;
  try {
    r = await res.json();
  } catch {
    console.log(`  ✗ Response is not valid JSON`);
    return { passed: 0, failed: 1, total: 1 };
  }

  // Print scores
  console.log("\n  Scores:");
  for (const dim of REQUIRED_DIMENSIONS) {
    const score = r.dimension_scores?.[dim]?.score ?? "—";
    const conf  = r.confidence_by_dimension?.[dim] ?? "—";
    console.log(`    ${dim.padEnd(26)} ${String(score).padStart(2)}/10  (${conf} confidence)`);
  }

  // Run all checks
  const shared   = runSharedChecks(r);
  const specific = c.checks.map((ch) => ({ label: ch.label, pass: ch.fn(r) }));
  const all      = [...shared, ...specific];

  console.log("\n  Checks:");
  let passed = 0;
  let failed = 0;
  for (const chk of all) {
    if (chk.pass) {
      console.log(`    ✓ ${chk.label}`);
      passed++;
    } else {
      console.log(`    ✗ ${chk.label}`);
      failed++;
    }
  }

  return { passed, failed, total: all.length };
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log("\nYC Validator — Benchmark Runner");
console.log(`Target: ${BASE_URL}/api/evaluate`);
console.log(`Cases:  ${CASES.length}`);

let totalPassed = 0;
let totalFailed = 0;

for (let i = 0; i < CASES.length; i++) {
  const { passed, failed } = await runCase(CASES[i], i + 1);
  totalPassed += passed;
  totalFailed += failed;
}

console.log(`\n${"═".repeat(60)}`);
console.log(`  RESULT: ${totalPassed} passed, ${totalFailed} failed`);
if (totalFailed === 0) {
  console.log("  All checks passed. Pipeline is working correctly.");
} else {
  console.log("  Some checks failed. Review output above.");
}
console.log(`${"═".repeat(60)}\n`);
