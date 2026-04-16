# Frontend Integration Handoff

## Status

This file is now a historical handoff for the earlier frontend pass.

The current implementation source of truth is:

- [docs/frontend-ui-implementation-spec.md](/Users/prajhan/Ideavalidation/docs/frontend-ui-implementation-spec.md:1)

Use this older file only for context on how the frontend phase started.

## Purpose

This document is the implementation handoff for the next phase of YC Validator after the evaluator backend has been merged.

This earlier phase was focused on:

- connecting the frontend to the merged evaluator backend
- making the founder flow usable in the browser
- keeping the locked MVP contract intact
- separating technical implementation work from UI/UX product review

This document is for the engineering side of the next step.

The UI/UX product wording, trust review, and founder-facing experience review remain with Prajhan.


## Phase Goal

The goal of this phase is simple:

**A founder should be able to open the app, fill in the startup form, submit it, and receive the full structured YC-style diagnostic on screen.**

That is the next major milestone for the project.


## Source Of Truth

Use these files as the implementation contract:

- [docs/yc-validator-spec.md](/Users/prajhan/Ideavalidation/docs/yc-validator-spec.md:1)
- [docs/yc-validator-worklog.md](/Users/prajhan/Ideavalidation/docs/yc-validator-worklog.md:1)
- [docs/benchmark-test-cases.md](/Users/prajhan/Ideavalidation/docs/benchmark-test-cases.md:1)

Relevant current app files:

- [app/page.tsx](/Users/prajhan/Ideavalidation/app/page.tsx:1)
- [app/layout.tsx](/Users/prajhan/Ideavalidation/app/layout.tsx:1)
- [app/globals.css](/Users/prajhan/Ideavalidation/app/globals.css:1)

Relevant backend files already merged:

- [lib/evaluator/schema.ts](/Users/prajhan/Ideavalidation/lib/evaluator/schema.ts:1)
- [lib/evaluator/heuristics.ts](/Users/prajhan/Ideavalidation/lib/evaluator/heuristics.ts:1)
- [lib/evaluator/retrieval.ts](/Users/prajhan/Ideavalidation/lib/evaluator/retrieval.ts:1)
- [lib/evaluator/prompt.ts](/Users/prajhan/Ideavalidation/lib/evaluator/prompt.ts:1)
- [app/api/evaluate/route.ts](/Users/prajhan/Ideavalidation/app/api/evaluate/route.ts:1)


## Scope For This Phase

### In scope

- founder input form
- client-side submission flow
- loading state
- error state
- rendering locked evaluator output
- one clean end-to-end browser test

### Not in scope

- auth
- database
- export features
- persistent history
- dashboards
- major visual redesign
- new scoring dimensions
- contract changes


## Note On Contract Drift

This document still reflects the earlier one-field intake shape.

That contract has been replaced by the structured application flow in:

- [docs/frontend-ui-implementation-spec.md](/Users/prajhan/Ideavalidation/docs/frontend-ui-implementation-spec.md:1)
- [docs/yc-validator-spec.md](/Users/prajhan/Ideavalidation/docs/yc-validator-spec.md:1)

Do not implement against the old `startup_description` flow from this document.


## Recommended Implementation Order

### Step 1: Pull latest main and create a fresh branch

Use:

```bash
git checkout main
git pull origin main
git checkout -b feature/frontend-evaluator-flow
```

Do not work directly on `main`.


### Step 2: Replace the starter homepage

Current file:

- [app/page.tsx](/Users/prajhan/Ideavalidation/app/page.tsx:1)

It still contains starter template content.

Replace it with the MVP founder flow.

Start with one page only.

No routing complexity is needed yet.


### Step 3: Build the input form

This step is now superseded by the structured application flow in the newer UI spec.

The form should contain exactly these fields:

- `startup_description`
- `stage`
- `is_technical`
- `is_full_time`

Recommended UI structure:

- headline
- short intro line
- startup description textarea
- stage selector
- technical founder yes/no control
- full-time yes/no control
- submit button

Keep the layout simple and fast to understand.


### Prajhan Review Needed

Before locking the final labels and wording for the form, ask Prajhan to review:

- page title
- intro copy
- field labels
- submit button text

This is a product/trust review checkpoint, not a backend checkpoint.


### Step 4: Add client-side state management

Track at least:

- form values
- submitting state
- error message
- returned evaluation result

Keep this local to the page unless the implementation clearly benefits from extracting components.


### Step 5: Connect the form to the evaluator API

Send a POST request to:

- `/api/evaluate`

Request body must match the locked backend contract.

Do not send extra fields.

Do not rename any fields.

On submit:

1. validate minimum client-side completeness
2. set loading state
3. call backend
4. handle success or failure
5. render result state


### Step 6: Add loading and error states

At minimum:

- button loading state while request is running
- clear error message if the API fails
- fallback if the response shape is missing expected data

Keep the error text calm and readable.


### Prajhan Review Needed

Before finalizing loading and error messaging, ask Prajhan to review:

- loading text
- empty state text
- error wording

This is a product clarity checkpoint.


### Step 7: Render the output sections

The results UI must render the locked response contract and no more.

Recommended section order:

1. `overall_assessment`
2. `dimension_scores`
3. `major_concerns`
4. `strong_signals`
5. `critical_questions`
6. `missing_evidence`
7. `next_3_moves`
8. `hard_truth`

For `dimension_scores`, show:

- dimension name
- score
- reason
- confidence

Keep the presentation readable.

Avoid dashboard bloat.


### Prajhan Review Needed

Before finalizing the displayed section names and result ordering, ask Prajhan to review:

- section headings
- whether the tone feels too harsh or too soft
- whether the page feels trustworthy and understandable

This is one of the most important review checkpoints in the whole phase.


### Step 8: Keep schema rendering strict

The UI should assume the backend returns the locked fields only.

Do not invent UI around fields that are not in the contract.

Do not reintroduce:

- verdicts
- acceptance probability
- hidden debug data
- `_warnings` in final rendered output


### Step 9: Run one real browser test

Use one sample input from:

- [docs/benchmark-test-cases.md](/Users/prajhan/Ideavalidation/docs/benchmark-test-cases.md:1)

Confirm:

- the form loads
- submit works
- backend responds
- results render
- no field crashes
- no schema mismatch


### Step 10: Push branch and report status

After the first full pass:

1. commit in small focused commits
2. push the branch
3. send back a short status note including:

- files changed
- what works
- what still feels rough
- one screenshot or one browser result if helpful


## Required Technical Standards

### 1. Keep the contract fixed

Do not change:

- input field names
- output field names
- scoring dimensions
- no-verdict policy

If a contract change becomes necessary, update the spec first.


### 2. Keep the UI minimal

This is MVP integration work.

Do not overbuild:

- tabs
- multipage flows
- reports
- dashboards
- onboarding systems


### 3. Keep commits focused

Recommended commit style:

- `[feat] add founder input form`
- `[feat] connect evaluator api submission flow`
- `[feat] render evaluator results view`
- `[fix] handle evaluator loading and error states`


### 4. Preserve product integrity

The frontend must not accidentally reintroduce:

- verdict labels
- fake YC branding
- overclaiming language
- misleading summary text


## Suggested Technical Structure

This does not need to be overengineered.

Reasonable first implementation options:

- keep everything in [app/page.tsx](/Users/prajhan/Ideavalidation/app/page.tsx:1) if still manageable
- or split out small components if the file becomes too large

Possible components if needed:

- `FounderForm`
- `EvaluationResults`
- `DimensionCard`
- `SectionList`

Only extract components if it improves clarity.


## Definition Of Done

This phase is done when all of these are true:

- the starter homepage is replaced
- the founder can enter startup details
- the frontend submits to `/api/evaluate`
- the backend response is rendered cleanly
- the UI handles loading and errors
- no verdict language appears anywhere in the frontend
- one end-to-end browser test succeeds
- Prajhan has reviewed the copy and result presentation


## What Prajhan Owns In Parallel

Prajhan should work in parallel on:

- page title and intro copy
- form wording and labels
- result section headings
- trust and tone review
- overall product clarity
- deciding whether the result page feels honest and useful

Prajhan does **not** need to implement the frontend code for this phase unless explicitly helpful.


## What To Escalate Immediately

Stop and ask for review if any of these happen:

- the locked contract seems insufficient for rendering
- the UI feels like it needs extra fields not in the spec
- the backend returns something that conflicts with the schema
- the result page feels confusing, misleading, or too harsh
- there is pressure to add verdict-like language


## Final Note

The goal of this phase is not to create a polished final product.

The goal is to create the first usable founder experience powered by the merged evaluator backend.

A clean, working, honest flow is more important than visual sophistication at this stage.
