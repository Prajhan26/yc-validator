# Frontend Evaluator Spec

## Owner

This work is owned by the collaborator working on `feature/frontend-evaluator-flow`.
It maps to Phase 3: Product MVP (frontend side) from `docs/yc-validator-spec.md`.

## Scope

### In scope
- Founder input form
- Client-side submission flow
- Loading and error states
- Rendering locked evaluator output
- End-to-end browser test

### Not in scope
- Auth
- Database
- Export features
- Persistent history
- Dashboards
- Contract changes
- New scoring dimensions

## Files Owned by This Branch

```
app/
  page.tsx        — full founder form + results view (replaces starter template)
  layout.tsx      — updated title and description

docs/
  frontend-evaluator-spec.md    — this file
  benchmark-test-cases.md       — standard test inputs for validation
```

## Files Not Touched

- `lib/evaluator/` — backend untouched
- `app/api/evaluate/route.ts` — backend untouched
- `app/globals.css` — untouched
- `docs/yc-validator-spec.md` — untouched

## Input Contract (sent to POST /api/evaluate)

```ts
{
  startup_description: string   // required, 20–2000 chars
  stage: "idea" | "mvp" | "users" | "revenue"
  is_technical: boolean
  is_full_time: boolean
}
```

## Output Sections Rendered

Rendered in this order:

1. `overall_assessment`
2. `dimension_scores` — name, score, reason, confidence per dimension
3. `major_concerns`
4. `strong_signals`
5. `critical_questions`
6. `missing_evidence`
7. `next_3_moves`
8. `hard_truth`

## State Management

All state is local to `app/page.tsx`:

- `form` — current field values
- `submitting` — controls loading state on submit button
- `error` — displays readable error message
- `result` — holds validated EvalOutput on success

## Non-Interference Rules

- Do not modify any file under `lib/evaluator/`
- Do not modify `app/api/evaluate/route.ts`
- Do not modify `docs/yc-validator-spec.md`
- Do not add new npm dependencies without approval
- No verdict language anywhere in the UI

## Pending Prajhan Review

These are product decisions that require Prajhan's sign-off before merge:

- Page title and intro copy
- Field labels and submit button text
- Loading and error message wording
- Result section headings and tone

## Commits on This Branch

```
8e9fb2d  [docs] add benchmark test cases
fc65234  [feat] update page title and description
ae97906  [feat] add founder input form and evaluator results view
```
