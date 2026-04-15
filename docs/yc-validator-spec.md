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

## Open Questions

- Final evaluation schema: 5 dimensions or 10 dimensions for MVP?
- Exact retrieval approach for the YC knowledge base.
- Exact model choice at implementation time.
- Whether to store client-side iteration history in MVP or defer it.

## Source Of Truth Files

- `YC-VALIDATOR-KNOWLEDGE-DISTILLATION-FRAMEWORK.md`
- `docs/yc-validator-spec.md`
- `docs/yc-validator-worklog.md`
