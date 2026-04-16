# Frontend UI Implementation Spec

## Purpose

This document is the current implementation handoff for the frontend branch after the intake contract and UI rhythm changed.

Use this file as the working build spec for:

- the landing page
- the application page
- the results page
- the updated intake questions
- the locked visual hierarchy and interaction flow

This spec is for implementation. Do not improvise beyond it without checking with Prajhan.


## Current Goal

Build a YC-like three-page flow:

1. landing page
2. application page
3. results page

The product should feel like a serious application and returned review sheet, not a dashboard and not a generic AI tool.


## Source Of Truth

Use these files together:

- [docs/yc-validator-spec.md](/Users/prajhan/Ideavalidation/docs/yc-validator-spec.md:1)
- [docs/frontend-integration-handoff.md](/Users/prajhan/Ideavalidation/docs/frontend-integration-handoff.md:1)
- [docs/Design tipps](/Users/prajhan/Ideavalidation/docs/Design%20tipps:1)

Relevant implementation files:

- [app/page.tsx](/Users/prajhan/Ideavalidation/app/page.tsx:1)
- [app/layout.tsx](/Users/prajhan/Ideavalidation/app/layout.tsx:1)
- [app/globals.css](/Users/prajhan/Ideavalidation/app/globals.css:1)


## Build Principles

- Keep the YC-like editorial feel.
- Warm paper background, black ink typography, restrained orange accents.
- No dashboard cards, no KPI tiles, no bright UI widgets, no purple gradients.
- No scroll-jacking or gimmick interactions.
- Every page should feel calm, serious, and intentional.
- Use spacing and hierarchy, not decoration, to create confidence.


## Page Flow

### Page 1: Landing

Purpose:

- set tone
- establish trust
- move the user into the application flow

### Page 2: Application

Purpose:

- collect the structured application
- feel like a YC-style application workspace

### Page 3: Results

Purpose:

- return the review as a document-like sheet
- feel like a reviewed application, not a product dashboard


## Landing Page Spec

### Hero order

1. `The less confident you are, the more serious you have to act.`
2. `We tell you how strong your YC application really is.`
3. `Built on a YC-informed review framework shaped from extensive source material.`
4. `Your application draft is never retained by us.`
5. `YC-aligned and independently built.`
6. Disclaimer:

`This is an independent YC-aligned analysis tool. It is not affiliated with or endorsed by Y Combinator, and it does not make admissions decisions.`

7. CTA:

`Evaluate my application`

### Landing behavior

- Hero line 1 should use the typewriter reveal.
- CTA should redirect to the application page.
- Do not place the full form inline on the landing page.


## Application Page Spec

### Top of page

- `‹ Back`
- `Your Application`
- `Write this the way you would want a YC reviewer to read it.`

### Left-side navigation

Lock the left nav to:

- `Company`
- `Problem`
- `Founder`
- `Progress`
- `Competitors`
- `Expertise`

### Main questions

#### Company

Question:

`Describe what your company does or is going to make.`

#### Problem

Question:

`What problem are you solving, and who has it?`

#### Founder

Question:

`Why are you the right founder to build this?`

#### Progress

Primary control:

`How far along are you?`

Options:

- `Idea`
- `MVP`
- `Users`
- `Revenue`

Follow-up logic:

- If `Users` or `Revenue` is selected, show:

`How long has each of you been working on this? How much of that has been full-time? Please explain.`

- If `Idea` or `MVP` is selected, show:

`Are you working on this full-time?`

Options:

- `Yes`
- `No`

#### Competitors

Question:

`Who are your competitors, and what do you understand that they don't?`

#### Expertise

Question:

`Does your founding team have domain expertise in this area?`

Options:

- `Yes`
- `No`

### Application page action

Bottom primary action:

`Submit for Review`


## Results Page Spec

### Top of page

- `‹ Back to Application`
- `Application Notes`
- small label: `Review Copy`

### Results section order

1. `Overall Assessment`
2. `Dimension Score`
3. `Major Concerns`
4. `Strong Signals`
5. `Questions a serious reviewer would ask`
6. `What you still need to prove`
7. `Next 3 moves`
8. `Hard truth`


## Dimension Score Block

This section must not look like a dashboard.

### One metric row pattern

Each row contains:

1. dimension name on the left
2. score on the right, e.g. `6/10`
3. segmented horizontal bar below
4. short reviewer note below the bar
5. confidence quietly below the note

### Bar styling

- 10 thin rectangular segments
- filled left to right up to the score
- unfilled segments stay paper/light outline
- use a softened YC-orange family
- use a quiet gradient only inside the filled segments
- no glow
- no neon orange
- no donut charts
- no cards

### Confidence placement

Confidence should appear quietly below the note in each row.


## Major Concerns

- no bullets
- no numbering
- each concern should appear as its own short paragraph block
- around 2 to 3 lines each
- restrained editorial treatment


## Strong Signals

- no bullets
- no numbering
- each signal should appear as its own short paragraph block
- same editorial treatment as Major Concerns


## Questions A Serious Reviewer Would Ask

- one direct question per line
- no bullets
- no numbering
- each question should stand alone
- keep the questions sharp and pressure-oriented


## What You Still Need To Prove

- one strong evidence-gap line per item
- no generic startup-advice wording
- each line should identify the missing proof burden clearly
- should sound authoritative and specific


## Next 3 Moves

- three stacked numbered moves
- each move gets a short action line
- optional one supporting sentence if needed
- no cards
- no roadmap visual
- structured, but still editorial


## Hard Truth

- label: `Hard Truth`
- sentence below in larger serif type
- subtle orange accent only through a thin line or outline
- no solid orange fill
- no badge styling
- no verdict-style box


## Bottom Of Results Page

Actions:

- `Download Review Copy`
- `Evaluate Another Application`

### CTA style

- underlined YC-style sans text links
- regular weight
- no black filled button
- no orange box
- no pill button
- no bold emphasis

### CTA hierarchy

- `Download Review Copy` is the primary action
- `Evaluate Another Application` is the secondary action

### Placement

Desktop:

- left: `Evaluate Another Application`
- right: `Download Review Copy`

Mobile:

- stacked
- `Download Review Copy` first
- `Evaluate Another Application` second


## What To Build Right Now

### Immediate implementation tasks

1. update the application page to the locked six-section intake structure
2. add the `Progress` conditional follow-up logic
3. update the left-side nav to the locked section names
4. update the landing page with the locked hero/trust/disclaimer order
5. update the results page to the locked document-style structure
6. rework the `Dimension Score` block to the locked metric-row pattern
7. update the bottom results CTAs to underlined text-link actions


## Prajhan Review Needed

Pause and send screenshots after these are implemented:

1. landing page
2. application page
3. results page

Also send:

- PR link
- benchmark output
- note on anything that still feels visually rough

Do not merge before Prajhan reviews the screenshots against this document.
