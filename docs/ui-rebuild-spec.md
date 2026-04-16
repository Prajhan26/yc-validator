# UI Rebuild Spec — Three-Page Flow

**Branch:** feature/frontend-evaluator-flow
**Date:** 2026-04-16
**Status:** Implemented, benchmark passing 30/30

---

## What this covers

Complete rebuild of `app/page.tsx` from a single-page form to a three-view
state machine (landing → application → results), plus matching backend alignment
for the new intake contract.

---

## Backend alignment changes

### Problem
`lib/evaluator/schema.ts` still had `is_technical` (old field) and `is_full_time`
as required. The locked spec replaced these with `domain_expertise` and a
conditional progress follow-up.

### Changes made

| File | Change |
|---|---|
| `lib/evaluator/schema.ts` | `is_technical` → `domain_expertise` (boolean); `is_full_time` made optional; `progress_detail` added as optional string |
| `lib/evaluator/heuristics.ts` | `is_full_time` warning changed from `!input.is_full_time` to `=== false` (avoids false fire when undefined for users/revenue stage) |
| `lib/evaluator/prompt.ts` | `buildUser` updated: `domain_expertise` replaces `is_technical`; conditional progress line (sends `progress_detail` for users/revenue, `is_full_time` for idea/mvp); system prompt hard rule updated to match |
| `app/api/evaluate/route.ts` | Hard rule: `is_technical === false` → `domain_expertise === false` |

---

## Frontend changes

### Files changed
- `app/layout.tsx` — added Lora (serif) font variable
- `app/globals.css` — warm paper theme, CSS vars, scroll behavior, blink animation, print styles
- `app/page.tsx` — complete rewrite (see below)

### Three-view state machine

```
view: "landing" | "application" | "results"
```

State transitions:
- landing → application: CTA click
- application → landing: ‹ Back
- application → results: successful submit
- results → application: ‹ Back to Application / Evaluate Another Application

---

## Landing page

### Copy (locked)
1. Hero (typewriter): "The less confident you are, the more serious you have to act."
2. "We tell you how strong your YC application really is."
3. "Built on a YC-informed review framework shaped from extensive source material."
4. "Your application draft is never retained by us."
5. "YC-aligned and independently built."
6. Disclaimer: "This is an independent YC-aligned analysis tool..."
7. CTA: "Evaluate my application →"

### Behavior
- Typewriter effect on hero line (32ms/char)
- Trust lines fade in after typewriter completes
- CTA navigates to application view

---

## Application page

### Structure
- `‹ Back` (top left)
- `Your Application` h1
- `Write this the way you would want a YC reviewer to read it.` subtitle
- Left sticky nav: Company / Problem / Founder / Progress / Competitors / Expertise
  - Each item smooth-scrolls to its section via `scrollIntoView`
  - Hidden on mobile

### Six sections

| Section | Question | Input |
|---|---|---|
| Company | Describe what your company does or is going to make. | textarea |
| Problem | What problem are you solving, and who has it? | textarea |
| Founder | Why are you the right founder to build this? | textarea |
| Progress | How far along are you? | 4-option toggle (Idea/MVP/Users/Revenue) + conditional follow-up |
| Competitors | Who are your competitors, and what do you understand that they don't? | textarea |
| Expertise | Does your founding team have domain expertise in this area? | Yes/No toggle |

### Progress conditional logic
- `idea` or `mvp` → "Are you working on this full-time?" (Yes/No toggle) → sends `is_full_time`
- `users` or `revenue` → "How long has each of you been working on this?..." (textarea) → sends `progress_detail`

### CTA: "Submit for Review"

---

## Results page

### Structure
- `‹ Back to Application` (top)
- `Application Notes` h1 + `Review Copy` label (right-aligned)
- Horizontal rule
- 8 sections (see below)
- Bottom CTAs

### Section order (locked)
1. Overall Assessment
2. Dimension Score
3. Major Concerns
4. Strong Signals
5. Questions a Serious Reviewer Would Ask
6. What You Still Need to Prove
7. Next 3 Moves
8. Hard Truth

### Dimension Score block
- 10-segment horizontal bar per dimension
- Filled segments: gradient #C44B18 → #E8682A
- Unfilled: #E5E0D8
- Score label right-aligned
- Reviewer note below bar
- Confidence quietly below note
- No cards, no dashboard feel

### Hard Truth
- Left orange border (2px, #D4561E)
- Body text in Lora serif
- No filled box, no badge

### Bottom CTAs (text links, underlined)
- Desktop: Evaluate Another Application (left) / Download Review Copy (right)
- Mobile: stacked, Download first
- Download Review Copy → `window.print()`

---

## Benchmark result

All 30 checks pass (3 cases × 10 checks each).

| Case | Result |
|---|---|
| Strong Idea (revenue, domain expertise) | 10/10 ✓ |
| Weak Idea (no domain expertise, idea stage) | 10/10 ✓ — hard rules fired |
| Tarpit (marketplace pattern) | 10/10 ✓ — tarpit concern present |
