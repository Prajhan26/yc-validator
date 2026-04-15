# Evaluator Backend Spec

## Owner

This work is owned by the collaborator working on `feature/evaluator-backend`.
It maps directly to **Phase 2: Evaluator Contract** and **Phase 3: Product MVP (server side only)** from `docs/yc-validator-spec.md`.

## Scope

This spec covers all backend evaluator logic. It does NOT touch:
- `app/page.tsx` (friend's UI)
- `app/layout.tsx`
- `app/globals.css`
- `Knowledge/` (shared knowledge base — read-only from this branch)
- `docs/yc-validator-spec.md` (shared project spec — do not edit without coordination)

## Files Owned by This Branch

```
lib/evaluator/
  schema.ts       — Zod/TypeScript types for request input and evaluation output
  heuristics.ts   — Fast local checks before calling the model (buzzword, tarpit, empty field detection)
  retrieval.ts    — Pulls relevant YC knowledge snippets from Knowledge/yc/distilled/ into the prompt
  prompt.ts       — Builds the final system + user prompt from retrieved context and startup description

app/api/evaluate/
  route.ts        — Next.js API route: POST /api/evaluate — validates input, runs heuristics, calls model, returns JSON
```

## Data Contract

### Input (POST /api/evaluate)

```ts
{
  idea: string           // startup description, required
  founderContext?: string // optional founder background
}
```

### Output

```ts
{
  verdict: "strong" | "promising" | "weak" | "fatal"
  overallScore: number   // 0–100
  categories: {
    founderFit: number
    problemClarity: number
    marketTiming: number
    tractionSignal: number
    redFlagCount: number
  }
  hardTruth: string
  redFlags: string[]
  strengths: string[]
  criticalQuestions: string[]
  nextSteps: string[]
}
```

## Heuristics (pre-model checks)

Run before the model call to catch obvious issues cheaply:

- Blank or too-short idea (< 20 chars) → reject with error
- Buzzword density check (AI, blockchain, disruption, Web3, etc.) → flag in output
- Tarpit pattern detection (consumer social, marketplace without supply, etc.) → flag in output

## Retrieval Strategy

- Read from `Knowledge/yc/distilled/` only (never raw or chunks)
- Select 2–3 most relevant distilled files based on keywords in the idea
- Inject as system context, capped to ~2000 tokens total

## Prompt Structure

```
[System]
You are a YC partner evaluating a startup idea. Be direct and specific.
Use the following YC knowledge as your evaluation framework:
<retrieved_knowledge>

[User]
Evaluate this startup idea:
<idea>
<founderContext> (if provided)

Return JSON matching the evaluation schema exactly.
```

## Model

- Default: claude-sonnet-4-6 (or as configured at call time)
- Credentials injected via environment variable `ANTHROPIC_API_KEY`
- Response format: JSON only, no prose wrapper

## Build Order

1. `schema.ts` — define all types first so other files can import them
2. `heuristics.ts` — pure logic, no dependencies, easy to test
3. `retrieval.ts` — reads Knowledge files, returns string context
4. `prompt.ts` — composes system + user prompt strings
5. `route.ts` — wires everything together, handles errors

## Non-Interference Rules

- All new files go under `lib/evaluator/` or `app/api/evaluate/`
- Do not modify any file that existed on `main` before this branch
- Do not modify `docs/yc-validator-spec.md` — add a worklog entry instead
- Do not add npm dependencies without checking with the repo owner first
- Keep this branch focused: no UI changes, no knowledge base edits

## Worklog

### 2026-04-15

- Branch `feature/evaluator-backend` created
- Files scaffolded: `schema.ts`, `heuristics.ts`, `retrieval.ts`, `prompt.ts`, `route.ts`
- Moved all files to proper directory structure (`lib/evaluator/`, `app/api/evaluate/`)
- This spec file created
