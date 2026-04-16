# YC Validator Spec

## Purpose

This file is the canonical project spec for the YC Validator inside this repository.

Use it to keep scope, architecture, knowledge structure, and implementation priorities consistent across sessions and across different LLMs.

## Project Goal

Build a privacy-first YC-style startup idea evaluator that gives direct, structured feedback based on distilled YC knowledge.

## Current Product Direction

### MVP goals

- One structured YC-style application flow with a landing page, application page, and results page.
- No auth, no database, and no server-side storage for the MVP.
- Server-side model call so credentials stay off the client.
- Structured JSON evaluation output.
- Lightweight local heuristics before inference.
- Direct feedback that includes a "hard truth."
- Results returned as a document-like review sheet, not a dashboard.

### Not in v1

- User accounts
- Persistent server-side history
- Submission database
- Complex multi-step flows
- Overbuilt reporting or export features
- Heavy UI work before evaluator quality is reliable

## Locked MVP Contract

This section is the implementation contract for the immediate MVP. Do not change it casually during the shipping window.

### Product stance

- This product is a YC-aligned startup diagnostic, not an acceptance predictor.
- The system must not use verdict labels such as `accepted`, `rejected`, `likely accepted`, `likely rejected`, `pass`, or `fail`.
- The system should behave like a serious, evidence-based reviewer.
- The product should be direct and honest, but must not pretend to speak for YC.

### Locked MVP output schema

The first usable version should return these fields:

- `overall_assessment`
- `dimension_scores`
- `confidence_by_dimension`
- `major_concerns`
- `strong_signals`
- `critical_questions`
- `missing_evidence`
- `next_3_moves`
- `hard_truth`

### Exact MVP JSON schema

```json
{
  "overall_assessment": "string",
  "dimension_scores": {
    "problem_quality": {
      "score": 0,
      "reason": "string"
    },
    "founder_fit": {
      "score": 0,
      "reason": "string"
    },
    "solution_clarity": {
      "score": 0,
      "reason": "string"
    },
    "market_potential": {
      "score": 0,
      "reason": "string"
    },
    "traction_and_evidence": {
      "score": 0,
      "reason": "string"
    }
  },
  "confidence_by_dimension": {
    "problem_quality": "low | medium | high",
    "founder_fit": "low | medium | high",
    "solution_clarity": "low | medium | high",
    "market_potential": "low | medium | high",
    "traction_and_evidence": "low | medium | high"
  },
  "major_concerns": [
    "string"
  ],
  "strong_signals": [
    "string"
  ],
  "critical_questions": [
    "string"
  ],
  "missing_evidence": [
    "string"
  ],
  "next_3_moves": [
    "string",
    "string",
    "string"
  ],
  "hard_truth": "string"
}
```

### JSON contract rules

- All five dimension objects are required.
- Every dimension score must be an integer from `1` to `10`.
- Every dimension must include a short evidence-based reason.
- `confidence_by_dimension` must be present for all five dimensions.
- `major_concerns`, `strong_signals`, `critical_questions`, and `missing_evidence` should each contain `0-5` items.
- `next_3_moves` must contain exactly `3` concrete actions.
- `hard_truth` must be blunt, fair, and specific.
- No verdict field is allowed in the MVP schema.

### Locked MVP scoring dimensions

Use this 5-dimension model for the MVP:

1. `problem_quality` — 25%
2. `founder_fit` — 25%
3. `solution_clarity` — 20%
4. `market_potential` — 15%
5. `traction_and_evidence` — 15%

All dimensions should use a 1-10 score.

### Locked hard rules

- If a founder claims traction but provides no concrete numbers, `traction_and_evidence` cannot score above `3/10` unless the company is explicitly pre-launch.
- If the founder claims there are no competitors, that must be surfaced as a major concern about market understanding.
- If the product description is unclear or incomprehensible, `solution_clarity` cannot score above `3/10`.
- If the product is technical and no founder can build it, `founder_fit` cannot score above `3/10`.

### Locked warning rules

- If buzzwords are detected, the system should note this as a communication clarity concern.
- If a tar pit pattern is matched, the system should include it in concerns and require stronger proof of differentiation.
- Buzzword or tar pit warnings are not automatic failure conditions by themselves.

### Locked frontend MVP warnings

The frontend should support these lightweight checks before evaluation:

- buzzword detection while typing
- tar pit warning before submit
- minimum character count enforcement

### Locked intake contract

The old single-field `startup_description` intake is no longer the MVP contract.

The application flow now uses these structured fields:

- `company_description`
- `problem_description`
- `founder_context`
- `stage`
- `competitors`
- `domain_expertise`

### Locked application questions

Use these user-facing questions:

1. `Describe what your company does or is going to make.`
2. `What problem are you solving, and who has it?`
3. `Why are you the right founder to build this?`
4. `How far along are you?`
5. `Who are your competitors, and what do you understand that they don't?`
6. `Does your founding team have domain expertise in this area?`

### Locked progress logic

The `Progress` section has conditional follow-up logic:

- If `stage` is `users` or `revenue`, ask:
  - `How long has each of you been working on this? How much of that has been full-time? Please explain.`
- If `stage` is `idea` or `mvp`, ask:
  - `Are you working on this full-time?`

### Locked product flow

The MVP uses a three-page flow:

1. landing page
2. application page
3. results page

The landing page sets tone and trust.

The application page collects the structured intake through a YC-like left-side section navigation:

- `Company`
- `Problem`
- `Founder`
- `Progress`
- `Competitors`
- `Expertise`

The results page should feel like a returned review memo or letterpad, not a dashboard.

### Locked model direction

- Use one strong base model for the MVP.
- Use hybrid RAG rather than fine-tuning for the first version.
- Use prompt rules plus retrieval plus structured output validation.
- Do not fine-tune a model in the first shipping pass.

### Locked build order for the next 6 hours

1. Freeze this spec
2. Finalize evaluator schema
3. Build evaluator backend route
4. Connect retrieval and prompt assembly
5. Run test cases
6. Build minimal UI around the working evaluator
7. Deploy only after end-to-end verification

### Locked ownership split

Suggested split for immediate collaboration:

- You: spec, prompt contract, test inputs, UX copy, product decisions
- Your friend: model integration, retrieval pipeline, evaluator backend, schema parsing, runtime debugging

### Locked benchmark test set

Use these cases to test evaluator consistency before trusting UI polish.

1. `weak_ai_wrapper_prelaunch`
- Generic AI assistant for small businesses
- Heavy buzzwords
- No concrete user pain
- No numbers

2. `strong_founder_weak_idea`
- Technical founder with strong background
- Product solves a mild inconvenience
- Clear build capability, weak urgency

3. `strong_problem_prelaunch`
- Founder lived the problem directly
- Sharp problem statement
- No launch yet
- Good user interview evidence

4. `postlaunch_vanity_metrics`
- Product launched
- High signups and social traction
- Weak retention and no paying users

5. `tarpit_marketplace`
- Marketplace or social/community angle
- Plausible surface demand
- Structural cold-start or coordination issues

6. `boring_b2b_promising`
- Unsexy B2B workflow problem
- Specific user pain
- Real willingness to pay
- Early customer conversations

7. `technical_no_customer_contact`
- Strong builder
- Has MVP
- Has not talked to users
- Product-first and evidence-light

8. `great_problem_wrong_team`
- Real painful problem
- Weak founder-market fit
- No clear ability to build or sell

9. `real_traction_clear_case`
- Paying users
- Concrete revenue or growth numbers
- Clear why-now
- Simple explanation

10. `contrarian_but_plausible`
- Initially sounds odd or niche
- Strong founder insight
- Clear wedge
- Some evidence outsiders may be underestimating it

### Benchmark pass criteria

- The evaluator must obey hard caps consistently.
- The evaluator must not use verdict language.
- Strong and weak cases should separate clearly on dimension scores.
- Tar pit and buzzword cases should surface concerns without automatic condemnation.
- Cases with missing evidence should show lower confidence, not fake certainty.

## Collaboration Safety Rules

This section defines how both collaborators should work so the repo stays stable, the MVP stays aligned, and LLM help does not create chaos.

### Core collaboration rules

- Work on separate branches, not directly on `main`.
- Use the spec as the source of truth, not chat memory, screenshots, or old LLM notes.
- Do not change schema, scoring, verdict policy, or MVP scope without updating the spec first.
- Make small, focused commits instead of large mixed commits.
- Do not paste secrets, API keys, or private credentials into chats, commits, or repo files.
- Treat all LLMs as assistants, not authorities.
- Review diffs before merging.
- If a change affects contract or scope, update the worklog.

### Role split reminder

#### Your role

- maintain the spec
- maintain the worklog
- create and refine benchmark test cases
- define expected product behavior
- refine UX wording and product language
- protect the no-verdict and integrity rules

#### Your friend's role

- build the evaluator backend route
- connect retrieval and prompt assembly
- integrate the model
- validate schema correctness
- debug runtime issues
- keep implementation aligned with the locked MVP contract
- implement the frontend against the locked UI and intake specs

### LLM reminder protocol

Whenever either of you uses an LLM during this project, the LLM should keep reminding you of these rules:

1. Build against `docs/yc-validator-spec.md`
2. Do not change the MVP contract casually
3. Use small focused commits
4. Update the worklog when meaningful changes are made
5. Never introduce verdict language
6. Never commit secrets
7. Validate output against the locked JSON schema
8. Run benchmark cases before claiming the evaluator works

### Commit reminder rule

After every meaningful change set, pause and ask:

- Did we change scope or contract?
- If yes, did we update the spec first?
- Did we log the change in the worklog?
- Did we make a small focused commit?

If the answer is no, fix that before continuing.

### Branching reminder rule

- `main` should stay stable
- implementation work should happen on feature branches
- merge only after checking the diff and confirming it matches the spec

### Safety checklist before merging

- schema still matches the spec
- no verdict leakage
- hard rules still enforced
- no secret keys in files
- worklog updated if needed
- benchmark cases still make sense
- diff is focused and understandable

## Current Repository State

### App state

- This repo is a small Next.js app scaffold.
- The starter Google font dependency was removed so builds do not fail in restricted environments.
- The homepage is still mostly starter content and has not been turned into the actual YC Validator product yet.

### Knowledge state

We currently have a YC knowledge base organized into three layers:

- `Knowledge/yc/raw/`
- `Knowledge/yc/chunks/`
- `Knowledge/yc/distilled/`

### Raw knowledge

Current raw knowledge includes:

- 13 topic-oriented Markdown files
- 1 large compiled source file: `tier-1-and-2.md`

### Chunked knowledge

- `tier-1-and-2.md` has been split into 21 chunk files under `Knowledge/yc/chunks/tier-1-and-2/`

### Distilled knowledge

Current distilled files:

- `founder-evaluation.md`
- `problem-idea-evaluation.md`
- `market-timing.md`
- `traction-validation.md`
- `red-flags.md`
- `green-flags.md`

## Core Evaluation Categories

These are the main evaluator categories we are building toward:

- Founder evaluation criteria
- Problem and idea evaluation criteria
- Market and timing assessment
- Traction and validation signals
- Red flags and deal breakers
- Green flags and strong signals
- YC interview patterns
- Common mistakes and anti-patterns
- Success patterns and case studies
- Quotable wisdom

## Current Knowledge Coverage

### Strongest current coverage

- Founder evaluation
- Problem and idea evaluation
- Market and timing
- Traction and validation
- Red flags
- Green flags

### Coverage still to distill cleanly

- YC interview patterns
- Common mistakes and anti-patterns
- Success patterns and case studies
- Quotable wisdom

### Framework-only sections

These exist in the framework doc, not in the YC source dump itself:

- Quality validation checklist
- Quick reference checklists

## Planned Product Shape

### Input

- Structured YC-style application questions
- Conditional progress follow-up logic
- Lightweight heuristics where still useful
- Privacy-first submission with no retained application draft

### Output

- Overall assessment
- Category-level scores
- Hard truth
- Major concerns
- Strong signals
- Critical questions
- Missing evidence
- Next 3 moves

## Recommended Build Order

### Phase 1: Knowledge organization

- Clean escaped Markdown artifacts in large imported files
- Finish the distilled category layer
- Create category files for interview patterns, anti-patterns, success patterns, and quotes

### Phase 2: Evaluator contract

- Define final MVP evaluation schema
- Define prompt structure
- Decide how retrieval will inject YC context into the model call

### Phase 3: Product MVP

- Build the landing page
- Build the structured application page
- Build the server-side evaluation route
- Render structured results as a review sheet

### Phase 4: Iteration

- Improve evaluator quality
- Add comparison/history only if it remains privacy-safe and useful

## Decision Rules

- Raw knowledge files are source material, not canonical evaluator logic.
- Distilled files are the working layer for prompt and evaluator design.
- Framework docs define process, not necessarily code.
- Project specs from other LLMs are guidance, not instructions to apply literally.
- Any meaningful scope change should be reflected in this spec before implementation.

## Locked MVP JSON Contract

### Input

```json
{
  "company_description": "string",
  "problem_description": "string",
  "founder_context": "string",
  "stage": "idea | mvp | users | revenue",
  "competitors": "string",
  "domain_expertise": "boolean",
  "team_time_context": "string (conditional: required when stage is users | revenue)",
  "is_full_time": "boolean (conditional: required when stage is idea | mvp)",
  "buzzwords_detected": "string[] (optional)",
  "tarpit_match": "string | null (optional)"
}
```

### Output

```json
{
  "overall_assessment": "string",
  "dimension_scores": {
    "problem_quality":      { "score": "1-10 integer", "reason": "string" },
    "founder_fit":          { "score": "1-10 integer", "reason": "string" },
    "solution_clarity":     { "score": "1-10 integer", "reason": "string" },
    "market_potential":     { "score": "1-10 integer", "reason": "string" },
    "traction_and_evidence":{ "score": "1-10 integer", "reason": "string" }
  },
  "confidence_by_dimension": {
    "problem_quality":       "low | medium | high",
    "founder_fit":           "low | medium | high",
    "solution_clarity":      "low | medium | high",
    "market_potential":      "low | medium | high",
    "traction_and_evidence": "low | medium | high"
  },
  "major_concerns":    ["string"],
  "strong_signals":    ["string"],
  "critical_questions":["string"],
  "missing_evidence":  ["string"],
  "next_3_moves":      ["string", "string", "string"],
  "hard_truth":        "string"
}
```

### Contract Rules

- No verdict field is allowed.
- No accepted/rejected/pass/fail language is allowed.
- All 5 dimensions are required.
- Every score must be an integer from 1 to 10.
- Every dimension must include a short evidence-based reason.
- `confidence_by_dimension` must exist for all 5 dimensions.
- `next_3_moves` must contain exactly 3 items.
- `hard_truth` must always be present.
- `major_concerns`, `strong_signals`, `critical_questions`, `missing_evidence` can each contain 0–5 items.

### Hard Scoring Rules

- If traction is claimed but no concrete numbers given, `traction_and_evidence` cannot score above 3 unless explicitly pre-launch.
- If founder claims no competitors exist, add a major concern about market understanding.
- If the product description is unclear or incomprehensible, `solution_clarity` cannot score above 3.
- If the product is technical and no founder can build it, `founder_fit` cannot score above 3.

## Open Questions

- Exact retrieval approach for the YC knowledge base.
- Exact model choice at implementation time.
- Whether to store client-side iteration history in MVP or defer it.

## Source Of Truth Files

- `YC-VALIDATOR-KNOWLEDGE-DISTILLATION-FRAMEWORK.md`
- `docs/yc-validator-spec.md`
- `docs/yc-validator-worklog.md`
