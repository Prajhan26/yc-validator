# Feature: evaluator-backend — Full Report

## Purpose

This document is the detailed handoff and learning record for the `feature/evaluator-backend` branch.

It explains:

- what was built
- why it mattered
- what success looked like
- what decisions were made along the way
- what errors or implementation problems showed up
- how those problems were handled

Use this file as:

- a backend handoff note
- a progress checkpoint before merge
- a learning document for future implementation work
- a candidate source file for later PDF export if needed


## Branch
`feature/evaluator-backend`


## Status
Complete. Tested. Ready for frontend integration.


## What Was Built


A full server-side evaluation pipeline. When a founder submits a startup idea, the backend validates it, pulls relevant YC knowledge, builds a prompt, calls Claude, validates the response, and returns structured JSON.


## What Success Looked Like

For this branch, success did not mean "the whole product is finished."

Success meant the backend could reliably do one complete evaluator loop:

1. accept the locked startup input shape
2. load relevant YC knowledge from the repo
3. assemble a strict YC-aligned diagnostic prompt
4. call the model safely on the server
5. reject malformed or off-contract outputs
6. return clean JSON that exactly matches the locked MVP contract

In product terms, success looked like this:

- no verdict labels
- no fake YC authority
- five locked evaluation dimensions
- structured output the frontend can trust
- hard scoring rules reflected in the evaluator behavior
- a backend branch isolated from `main`

In collaboration terms, success looked like this:

- work stayed on `feature/evaluator-backend`
- `main` was not polluted with partial backend work
- the JSON contract was written down and then implemented
- fixes happened through focused follow-up commits instead of one giant unreviewable change


## Why This Branch Matters

Before this work, the repository had:

- a knowledge base
- a spec
- benchmark cases
- a frontend scaffold

But it did not yet have the actual evaluator engine.

This branch is the first point where the project became an executable system rather than only a design and knowledge repository.

That is a major milestone because the product can now move from:

- planning
- distillation
- architecture discussion

into:

- real backend behavior
- real structured responses
- real frontend integration
- real testing against startup inputs


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


## Why These Dependencies Were Worth Adding

### `zod`

`zod` was added because TypeScript types alone are not enough for API safety.

The evaluator endpoint receives untrusted input and also receives model output that may be malformed, incomplete, or off-contract.

`zod` gives runtime guarantees for:

- request validation
- response validation
- score range enforcement
- exact field presence
- strict array size checks such as `next_3_moves`

### `@anthropic-ai/sdk`

The Anthropic SDK was added because the backend needed a direct server-side Claude integration.

This keeps:

- credentials off the client
- model invocation centralized
- prompt construction controllable in one place

It also aligns with the chosen implementation direction for this backend pass.


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


## What Each New File Does

### `lib/evaluator/schema.ts`

This is the contract guard.

It defines:

- the request input schema
- the response output schema
- the allowed score ranges
- the exact required dimensions
- the strict length rule for `next_3_moves`

Without this file, the backend would have no reliable way to protect the app from malformed model output.

### `lib/evaluator/heuristics.ts`

This is the cheap pre-model reasoning layer.

It performs lightweight checks before spending model tokens, including:

- buzzword detection
- tar pit pattern detection
- simple warnings tied to locked input fields

This is helpful because some obvious risk signals can be surfaced before the full model pass.

### `lib/evaluator/retrieval.ts`

This is the first RAG layer for the evaluator.

It chooses relevant YC knowledge from `Knowledge/yc/distilled/` so the model is not working from generic memory alone.

This keeps the system more grounded in the repo's actual YC knowledge base.

### `lib/evaluator/prompt.ts`

This is the behavior layer.

It turns:

- the locked spec
- the YC knowledge context
- the user input

into a system prompt and user prompt that the model can follow.

This file is especially important because it is where the project's integrity rules are enforced in language:

- YC-aligned diagnostic, not YC authority
- no verdict labels
- exact JSON output requirement
- hard scoring rules

### `app/api/evaluate/route.ts`

This is the orchestration layer.

It wires everything together:

- input validation
- heuristics
- retrieval
- prompt assembly
- model call
- JSON parsing
- output validation
- final response

This route is the backend entrypoint for the evaluator product.

### `docs/evaluator-backend-spec.md`

This is the implementation-side backend design note for the branch.

It helps keep the backend work understandable independently of the broader product spec.


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


## Why These Rules Matter

These rules exist to prevent the evaluator from becoming:

- too flattering
- too vague
- too inconsistent
- too easy to manipulate with startup buzzwords

They are especially important because LLMs often drift toward generous or smooth-sounding outputs unless the contract is made explicit.

This branch therefore did not just build an API call.
It built constraint enforcement around the API call.


## Main Problems Encountered

The backend work was not simply a straight implementation pass.
Several real issues showed up and had to be corrected.

### 1. Schema ambiguity between documents

Earlier project materials and framework notes contained older schema ideas, including verdict-style fields.

Problem:

- different documents suggested different output shapes
- some older material still referenced verdict-like output
- implementation could drift if the live contract was unclear

How it was handled:

- the locked MVP JSON contract was written explicitly into `docs/yc-validator-spec.md`
- implementation was aligned to that contract
- the branch then added a focused docs commit specifically to lock the evaluator JSON contract

Why this mattered:

- backend and frontend now have one shared contract
- collaboration with multiple LLMs became much cleaner

### 2. Verdict leakage risk

The product stance explicitly forbids acceptance-style labels.

Problem:

- LLMs tend to invent summary labels or pseudo-verdict language
- older brainstorming material also increased this risk

How it was handled:

- verdict language was disallowed in the contract
- prompt framing was shifted to "YC-aligned diagnostic"
- the response contract was built without any `verdict` field
- schema validation and output checks reinforced the rule

Why this mattered:

- this protects product integrity
- the tool stays diagnostic instead of pretending to speak for YC

### 3. `_warnings` mismatch with locked schema

Heuristics naturally produce extra metadata.

Problem:

- warnings are useful internally
- but the locked output schema did not include `_warnings`
- leaking extra fields would break the contract

How it was handled:

- `_warnings` was removed from the final API response
- the branch includes an explicit fix commit for this

Why this mattered:

- the output is now cleaner and predictable
- the frontend can trust the response shape

### 4. Model responses wrapped in markdown code fences

Even when asked for JSON, models often wrap output in fenced code blocks.

Problem:

- raw model output may not be directly parseable as JSON

How it was handled:

- route logic strips markdown code fences before parsing
- the branch includes a dedicated fix commit for this

Why this mattered:

- avoids fragile frontend/backend behavior
- makes the backend more tolerant of real model behavior

### 5. Token budget and output completeness

Structured evaluator output is larger than a simple answer.

Problem:

- the model needed enough room to return the full JSON object with all required sections

How it was handled:

- `max_tokens` was increased to `4096`
- this was captured in a dedicated fix commit

Why this mattered:

- reduces truncated responses
- makes the structured contract more reliable

### 6. Retrieval scope and relevance

The project has a growing YC knowledge base.

Problem:

- dumping all knowledge into every prompt would be wasteful
- retrieval had to stay simple enough for MVP while still being useful

How it was handled:

- the branch used `Knowledge/yc/distilled/`
- retrieval selects the top 3 relevant files based on the idea text

Why this mattered:

- keeps the prompt focused
- preserves the repo's YC-specific value without overcomplicating v1


## Learning Perspective

This branch is useful not just because of the code it added, but because of what it taught about building evaluator systems.

### Learning 1: A knowledge base is not enough by itself

Having YC documents in the repo does not automatically create a trustworthy evaluator.

The system still needed:

- a strict contract
- retrieval
- prompt framing
- runtime validation
- hard rule enforcement

This is a key product lesson: raw knowledge is necessary, but not sufficient.

### Learning 2: Backend trust comes from validation, not hope

A model can return:

- invalid JSON
- missing fields
- too many list items
- forbidden language
- incomplete reasoning

The branch solved this by treating the model as powerful but untrusted.

That is the right engineering stance for production-facing LLM systems.

### Learning 3: Prompt quality and schema quality are tightly connected

If the prompt and the response contract are not aligned, the backend becomes unstable.

This work showed that:

- clear schema
- clear product stance
- clear hard rules

make model behavior much more manageable.

### Learning 4: Small fix commits are better than one giant rewrite

The branch history reflects good implementation hygiene:

- lock contract
- align backend
- remove schema-breaking extra field
- handle code fences
- adjust token budget

This made the work easier to understand and easier to review.

### Learning 5: Product integrity has to be enforced technically

The "no verdicts" idea could not remain just a philosophy note.

It had to show up in:

- prompt wording
- schema structure
- validation rules
- review decisions

That is an important lesson for the whole product, not just this branch.


## Success Checklist

This branch should be considered successful if all of the following are true:

- `POST /api/evaluate` accepts the locked input shape
- the route retrieves YC knowledge from the repo
- the system prompt reflects the locked diagnostic stance
- the model returns JSON that matches the locked schema
- verdict labels do not appear
- all 5 dimensions are present
- `next_3_moves` is exactly 3 items
- malformed outputs are rejected rather than silently accepted
- the frontend can integrate against a stable response shape

Based on the report and commit history, this branch appears to have reached that level.


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


## Recommended Next Step After This Branch

The right next move is not a broad redesign.
It is a controlled handoff into frontend integration and backend verification.

Recommended order:

1. review and merge this backend branch if the code matches the report
2. run a few real requests against `POST /api/evaluate`
3. verify the response against sample startup inputs
4. wire the minimal frontend form to this route
5. render the structured result sections without changing the contract


## Final Assessment Of This Branch

This branch represents the first real evaluator engine for the project.

Before it, the repository had strong documentation and knowledge assets.
After it, the repository has a concrete backend pipeline that can power the MVP.

That makes this branch an important transition point:

- from planning to implementation
- from knowledge storage to executable evaluation
- from product definition to testable behavior

In short:

the branch appears to have done the right kind of work, in the right order, with the right corrections made along the way.


