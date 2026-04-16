# Benchmark Runner Spec

**Branch:** feature/frontend-evaluator-flow
**Created:** 2026-04-16
**Status:** Done

---

## What this covers

A local Node.js script that fires all 3 locked test cases at the running dev server
and prints a pass/fail report. Used to validate the evaluator pipeline after any
change to the prompt, knowledge base, schema, or hard rules.

**File:** `scripts/benchmark.mjs`
**Command:** `npm run benchmark`

---

## Step-by-step: what was done

1. **Updated `docs/yc-validator-spec.md`** — replaced old `startup_description`
   4-field input contract with the locked 7-field contract.

2. **Updated `docs/benchmark-test-cases.md`** — rewrote all 3 test case inputs
   from the old 4-field format to the new 7-field format with realistic payloads.

3. **Created `scripts/benchmark.mjs`** — Node ESM script that:
   - Fires all 3 test cases at `POST http://localhost:3000/api/evaluate`
   - Prints dimension scores and confidence for each case
   - Runs shared checks on every case (see below)
   - Runs case-specific checks (see below)
   - Prints a final pass/fail summary

4. **Added `benchmark` script to `package.json`** → `node scripts/benchmark.mjs`

---

## How to run

```bash
# Terminal 1 — start the dev server
npm run dev

# Terminal 2 — run the benchmark
npm run benchmark
```

---

## Shared checks (run on every case)

| Check | What it verifies |
|---|---|
| All 5 dimensions present, scored 1–10 | Schema integrity |
| `next_3_moves` has exactly 3 items | Hard contract rule |
| `hard_truth` is present and non-empty | Required output field |
| No verdict/accepted/rejected/pass/fail language | No verdict language rule |

## Case-specific checks

### Case 1 — Strong Idea
| Check | Expected |
|---|---|
| `founder_fit` ≥ 7 | Strong founder-market fit |
| `traction_and_evidence` ≥ 5 | Revenue stage |

### Case 2 — Weak Idea
| Check | Expected |
|---|---|
| `founder_fit` ≤ 3 | Hard rule: no technical founder |
| Competitor concern in `major_concerns` | Hard rule: "no competitors" claim |

### Case 3 — Tarpit
| Check | Expected |
|---|---|
| Tarpit/marketplace concern in `major_concerns` | Tarpit detection fired |
| `traction_and_evidence` ≤ 5 | No numbers given |

---

## When to re-run

- After any change to `lib/evaluator/prompt.ts`
- After any change to `Knowledge/yc/distilled/`
- After any change to hard rule logic in `app/api/evaluate/route.ts`
- After any change to `lib/evaluator/schema.ts`
- Before merging any branch that touches the evaluator pipeline
