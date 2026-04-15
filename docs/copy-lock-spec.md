# Copy Lock Spec — Intake Form

**Branch:** feature/frontend-evaluator-flow
**Locked on:** 2026-04-16
**Status:** Locked. Do not change without explicit approval.

---

## What this covers

All user-facing text in the intake form: question labels, textarea placeholders,
dropdown options, CTA buttons, loading state, error message, and reset button.

**File:** `app/page.tsx`

---

## Step-by-step: what was done

1. **Received locked copy from Prajhan** — labels, placeholders, dropdown options,
   CTA, loading text, error text, and reset button all specified explicitly.

2. **Updated `STAGE_LABELS`** — removed descriptive suffixes ("Idea — no product yet"
   → "Idea", etc.) to match locked dropdown options: Idea / MVP / Users / Revenue.

3. **Updated Q1 placeholder**
   - Before: "Describe what you are building and who it is for."
   - After: "Describe what you are building in one or two clear sentences."

4. **Updated Q2 placeholder**
   - Before: "Describe the specific pain point and the people who experience it."
   - After: "Be specific about who has the problem, how often it shows up, and why it matters."

5. **Updated Q3 placeholder**
   - Before: "Your background, domain expertise, or personal connection to this problem."
   - After: "Explain your edge: experience, insight, technical ability, or why you understand this problem better than others."

6. **Q4 (stage) — no placeholder** — it is a dropdown, not a text area. No change needed.

7. **Updated Q5 placeholder**
   - Before: "Name your competitors and explain your specific insight or advantage over them."
   - After: "Name the real alternatives and explain what you see differently."

8. **Q6 / Q7 — no placeholder** — Yes/No toggle buttons, no text input. No change needed.

9. **Updated CTA button**
   - Before: "Evaluate my idea"
   - After: "Evaluate my application"

10. **Updated loading button state**
    - Before: "Evaluating..."
    - After: "Evaluating your application..."

11. **Updated error message** (both API error path and network catch path)
    - Before: "Something went wrong. Please try again."
    - After: "We couldn't complete your evaluation. Please try again."

12. **Updated reset button**
    - Before: "Evaluate another idea"
    - After: "Evaluate another application"

13. **Committed** with message `[copy] lock labels, placeholders, and CTAs per approved spec`

14. **Pushed** to `feature/frontend-evaluator-flow`

---

## Locked copy reference

### Labels (all 7 — unchanged, already correct before this pass)

| # | Label |
|---|---|
| 1 | What does your company do? |
| 2 | What problem are you solving, and who has it? |
| 3 | Why are you the right founder to build this? |
| 4 | How far along are you? |
| 5 | Who are your competitors, and what do you understand that they don't? |
| 6 | Can someone on the founding team build the product? |
| 7 | Are you working on this full-time? |

### Placeholders (text areas only)

| # | Placeholder |
|---|---|
| 1 | Describe what you are building in one or two clear sentences. |
| 2 | Be specific about who has the problem, how often it shows up, and why it matters. |
| 3 | Explain your edge: experience, insight, technical ability, or why you understand this problem better than others. |
| 4 | *(dropdown — no placeholder)* |
| 5 | Name the real alternatives and explain what you see differently. |
| 6 | *(Yes/No toggle — no placeholder)* |
| 7 | *(Yes/No toggle — no placeholder)* |

### Dropdown options

| Field | Options |
|---|---|
| Stage (Q4) | Idea / MVP / Users / Revenue |
| Technical founder (Q6) | Yes / No |
| Full-time (Q7) | Yes / No |

### Buttons and states

| Element | Text |
|---|---|
| CTA | Evaluate my application |
| Loading (button) | Evaluating your application... |
| Error | We couldn't complete your evaluation. Please try again. |
| Reset | Evaluate another application |
