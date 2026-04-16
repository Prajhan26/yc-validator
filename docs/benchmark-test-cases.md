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
  "company_description": "We built a B2B dev tool that automatically detects and fixes memory leaks in production Node.js apps. We have 12 paying customers at $400 MRR and grew 40% last month. Both founders are senior engineers who spent 5 years debugging performance issues at scale.",
  "problem_description": "Memory leaks in production Node.js apps silently kill performance and are almost impossible to reproduce locally. Engineering teams lose days diagnosing them — we have seen teams spend 3–5 days on a single incident. The problem is chronic, expensive, and has no good automated solution.",
  "founder_context": "Both founders spent 5 years as senior engineers dealing with this exact problem at scale. We have fixed hundreds of memory leaks in production and know every failure pattern.",
  "stage": "revenue",
  "competitors": "New Relic and Datadog do APM broadly but do not specialize in memory leak detection or automated fixes. We go deeper on one problem they treat as a footnote.",
  "is_technical": true,
  "is_full_time": true
}
```

**What to check:**
- `founder_fit` scores high — strong founder-market fit
- `traction_and_evidence` scores high — stage is revenue
- `solution_clarity` scores high — specific, narrow problem
- No verdict language

---

## Case 2 — Weak Idea

**Label:** Consumer app, no technical founder, part-time

**Input:**
```json
{
  "company_description": "An app that uses AI to suggest what to cook based on what is in your fridge. You take a photo and it gives you recipe ideas.",
  "problem_description": "People do not know what to cook and waste food. They open the fridge and have no inspiration.",
  "founder_context": "I love cooking and have always wanted to make this app. I think a lot of people have this problem.",
  "stage": "idea",
  "competitors": "There are no real competitors doing this with AI and photos.",
  "is_technical": false,
  "is_full_time": false
}
```

**What to check:**
- `founder_fit` capped at 3 — hard rule fires (no technical founder)
- `traction_and_evidence` low — idea stage, no validation
- Competitor concern added — "no competitors" claim triggers hard rule
- No verdict language

---

## Case 3 — Tarpit Idea

**Label:** Two-sided marketplace with no differentiation

**Input:**
```json
{
  "company_description": "We are building an Uber for dog walking. Dog owners can book a nearby dog walker on demand through our app. We have a two-sided marketplace with walkers and owners.",
  "problem_description": "Dog owners struggle to find reliable dog walkers on short notice. Existing platforms are slow and hard to trust.",
  "founder_context": "I have a dog and have had trouble finding walkers. I think the market is huge and the experience is broken.",
  "stage": "mvp",
  "competitors": "Rover and Wag exist but they are not on-demand. We are faster and more local.",
  "is_technical": true,
  "is_full_time": true
}
```

**What to check:**
- Tarpit pattern detected (`uber for`, `two-sided marketplace`) — flagged in `major_concerns`
- Rover and Wag surfaced as direct incumbents
- `traction_and_evidence` low — no numbers
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
