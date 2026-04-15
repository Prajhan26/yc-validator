# YC Validator Spec

## Purpose

This file is the canonical project spec for the YC Validator inside this repository.

Use it to keep scope, architecture, knowledge structure, and implementation priorities consistent across sessions and across different LLMs.

## Project Goal

Build a privacy-first YC-style startup idea evaluator that gives direct, structured feedback based on distilled YC knowledge.

## Current Product Direction

### MVP goals

- One fast form for founders to describe their startup.
- No auth, no database, and no server-side storage for the MVP.
- Server-side model call so credentials stay off the client.
- Structured JSON evaluation output.
- Lightweight local heuristics before inference.
- Direct feedback that includes a "hard truth."
- Simple results page with score breakdown and critical questions.

### Not in v1

- User accounts
- Persistent server-side history
- Submission database
- Complex multi-step flows
- Overbuilt reporting or export features
- Heavy UI work before evaluator quality is reliable

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

- One startup description field
- Lightweight founder context controls
- Buzzword detection
- Tarpit detection

### Output

- Verdict
- Overall score
- Category-level scores
- Hard truth
- Red flags
- Strengths
- Critical questions
- Actionable next steps

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

- Build the fast input form
- Build server-side evaluation route
- Render structured results

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
  "startup_description": "string",
  "stage": "idea | mvp | users | revenue",
  "is_technical": "boolean",
  "is_full_time": "boolean",
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
