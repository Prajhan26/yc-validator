# Feature: evaluator-backend — Full Report

## Branch
`feature/evaluator-backend`

## Status
Complete. Tested. Ready for frontend integration.

## What Was Built

A full server-side evaluation pipeline. When a founder submits a startup idea, the backend validates it, pulls relevant YC knowledge, builds a prompt, calls Claude, validates the response, and returns structured JSON.

---

## Files Added

All new files are isolated. Nothing on `main` was touched.

```
lib/evaluator/
  schema.ts         — Zod validation for request input and model output
  heuristics.ts     — Fast pre-model checks (buzzwords, tarpit patterns, warnings)
  retrieval.ts      — Selects top 3 relevant YC knowledge files based on idea keywords
  prompt.ts         — Builds system + user prompt for Claude

app/api/evaluate/
  route.ts          — POST /api/evaluate — wires the full pipeline together

docs/
  evaluator-backend-spec.md       — Documents backend ownership and design
  feature-evaluator-backend-report.md  — This file
```

`docs/yc-validator-spec.md` was updated to include the locked MVP JSON contract.

---

## Dependencies Added

| Package | Purpose |
|---|---|
| `zod` | Runtime validation of request input and model output |
| `@anthropic-ai/sdk` | Claude API calls |

---

## How a Request Flows

```
POST /api/evaluate
  ↓
1. Validate input with Zod
  ↓
2. Run heuristics — detect buzzwords, tarpit patterns
  ↓
3. Retrieve top 3 relevant YC knowledge files from Knowledge/yc/distilled/
  ↓
4. Assemble system + user prompt
  ↓
5. Call Claude (claude-sonnet-4-6, max_tokens: 4096)
  ↓
6. Strip markdown code fences if present
  ↓
7. Validate output against locked schema with Zod
  ↓
8. Return clean JSON
```

---

## Locked Input Contract

```json
{
  "startup_description": "string (20–2000 chars, required)",
  "stage": "idea | mvp | users | revenue",
  "is_technical": "boolean",
  "is_full_time": "boolean",
  "buzzwords_detected": "string[] (optional)",
  "tarpit_match": "string | null (optional)"
}
```

## Locked Output Contract

```json
{
  "overall_assessment": "string",
  "dimension_scores": {
    "problem_quality":       { "score": "1–10", "reason": "string" },
    "founder_fit":           { "score": "1–10", "reason": "string" },
    "solution_clarity":      { "score": "1–10", "reason": "string" },
    "market_potential":      { "score": "1–10", "reason": "string" },
    "traction_and_evidence": { "score": "1–10", "reason": "string" }
  },
  "confidence_by_dimension": {
    "problem_quality":       "low | medium | high",
    "founder_fit":           "low | medium | high",
    "solution_clarity":      "low | medium | high",
    "market_potential":      "low | medium | high",
    "traction_and_evidence": "low | medium | high"
  },
  "major_concerns":     ["string"] (0–5 items),
  "strong_signals":     ["string"] (0–5 items),
  "critical_questions": ["string"] (0–5 items),
  "missing_evidence":   ["string"] (0–5 items),
  "next_3_moves":       ["string", "string", "string"] (exactly 3),
  "hard_truth":         "string"
}
```

---

## Contract Rules

- No verdict field. No accepted/rejected/pass/fail language.
- All 5 dimensions required.
- Every score is an integer from 1 to 10.
- `next_3_moves` must contain exactly 3 items.
- `hard_truth` must always be present.

## Hard Scoring Rules (enforced in prompt)

- Traction claimed but no concrete numbers → `traction_and_evidence` capped at 3
- Founder claims no competitors → `major_concerns` must flag market understanding
- Product description unclear → `solution_clarity` capped at 3
- Technical product, no technical founder → `founder_fit` capped at 3

---

## Commits on This Branch

```
0340b07  [feat] add retrieval module, backend spec doc, and npm dependencies
b9afe37  [fix] strip model code fences and increase max_tokens to 4096
e1a0a74  [fix] remove _warnings from api response to match locked schema
3e3a1f2  [feat] align evaluator backend with locked schema
cd51482  [docs] lock evaluator json contract
```

---

## What Main Looks Like

```
341bcc5  [docs] organize YC knowledge base and project tracking
7602dcc  Initial commit from Create Next App
```

Main was not touched. All work is isolated to this branch.

---

## What You Need to Run This

1. Create `.env.local` at the project root:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
2. Run `npm install`
3. Run `npm run dev`
4. Hit `POST /api/evaluate` with the locked input shape

---

## What Is Left (Frontend)

- Input form: `startup_description`, `stage`, `is_technical`, `is_full_time`
- Call `POST /api/evaluate`
- Render the structured results page
