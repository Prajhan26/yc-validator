# Benchmark Test Cases

## Purpose

This file contains standard test inputs for validating the evaluator backend.

Use these cases to:
- confirm the pipeline returns clean schema-valid JSON
- verify hard rules fire correctly
- check that no verdict language appears in any response
- test the frontend renders all output sections without crashing

---

## Case 1 — Strong Idea

**Label:** B2B dev tool with traction and founder-market fit

**Input:**
```json
{
  "startup_description": "We built a B2B dev tool that automatically detects and fixes memory leaks in production Node.js apps. We have 12 paying customers at 400 MRR and grew 40% last month. Both founders are senior engineers who spent 5 years debugging performance issues at scale.",
  "stage": "revenue",
  "is_technical": true,
  "is_full_time": true
}
```

**What to check:**
- `founder_fit` scores high (strong founder-market fit)
- `traction_and_evidence` scores high (concrete numbers present)
- Hard truth flags pricing concern (low ARPU)
- No verdict language

---

## Case 2 — Weak Idea

**Label:** Consumer app, no technical founder, part-time

**Input:**
```json
{
  "startup_description": "An app that uses AI to suggest what to cook based on what is in your fridge. You take a photo and it gives you recipe ideas.",
  "stage": "idea",
  "is_technical": false,
  "is_full_time": false
}
```

**What to check:**
- `founder_fit` capped at 3 — hard rule fires (no technical founder)
- `traction_and_evidence` scores 1 — no validation
- Major concerns include no technical founder and existing competitors
- No verdict language

---

## Case 3 — Tarpit Idea

**Label:** Two-sided marketplace with no differentiation

**Input:**
```json
{
  "startup_description": "We are building an Uber for dog walking. Dog owners can book a nearby dog walker on demand through our app. We have a two-sided marketplace with walkers and owners.",
  "stage": "mvp",
  "is_technical": true,
  "is_full_time": true
}
```

**What to check:**
- Tarpit pattern detected and flagged in `major_concerns`
- Rover and Wag surfaced as incumbents
- `traction_and_evidence` low — no numbers given
- No verdict language

---

## Pass Criteria

A run passes if all of the following are true for every case:

- Response is valid JSON matching the locked schema
- All 5 dimensions present with scores 1–10
- `next_3_moves` contains exactly 3 items
- `hard_truth` is present and non-empty
- No verdict, accepted, rejected, pass, or fail language appears anywhere
- Hard rules fire on Case 2 (`founder_fit` capped at 3)
- Tarpit concern appears in Case 3 `major_concerns`
