# YC Validator Benchmark Test Cases

## Purpose

This file contains the first 10 benchmark inputs for testing the YC Validator backend.

Use these cases to check:

- schema correctness
- scoring consistency
- hard rule enforcement
- no-verdict policy compliance
- usefulness of output

## Test Case 1: weak_ai_wrapper_prelaunch

### Startup description

We are building an AI-powered platform that leverages cutting-edge large language models to transform how small businesses operate. Our ecosystem helps teams streamline communication, automate workflows, and unlock productivity across their organization. We want to be the all-in-one operating system for small business growth.

### Founder context

- Stage: Just an idea
- Technical founder: Yes
- Full-time: Yes

### Expected pressure points

- heavy buzzwords
- weak problem clarity
- no real traction evidence
- likely generic AI wrapper concern

## Test Case 2: strong_founder_weak_idea

### Startup description

I am a strong full-stack engineer from a top infrastructure company, and I want to build an app that helps remote workers generate prettier Zoom backgrounds automatically based on their mood and calendar. I can build it quickly, but I have not yet spoken to users. I think many remote workers would find it fun and useful.

### Founder context

- Stage: Just an idea
- Technical founder: Yes
- Full-time: Yes

### Expected pressure points

- founder fit stronger than idea quality
- weak problem urgency
- limited evidence of demand

## Test Case 3: strong_problem_prelaunch

### Startup description

I spent three years managing prior authorization paperwork at a specialty clinic. Every week our staff lost hours calling insurers, faxing forms, and manually tracking approvals in spreadsheets. We are building software that automatically reads insurer requirements, generates the correct submission packet, and tracks approval status in one dashboard. We have interviewed 22 clinic administrators and billing leads, and 17 said this is one of their most painful operational bottlenecks. We have not launched yet.

### Founder context

- Stage: Building MVP
- Technical founder: Yes
- Full-time: Yes

### Expected pressure points

- strong problem quality
- strong founder-market fit
- traction should stay moderate because pre-launch
- confidence should reflect real user research

## Test Case 4: postlaunch_vanity_metrics

### Startup description

We launched a mobile app that helps college students find events nearby. We have 18,000 downloads, 12,000 Instagram followers, and several student ambassadors posting about it. However, only around 400 users open the app weekly, and we do not yet have paying users or retention data by cohort. We believe this could become the social layer for college life if we keep growing awareness.

### Founder context

- Stage: Have users
- Technical founder: No
- Full-time: Part-time

### Expected pressure points

- vanity metrics concern
- weak traction quality despite top-line numbers
- likely tar pit or social coordination concern

## Test Case 5: tarpit_marketplace

### Startup description

We are building a marketplace for local freelancers and small businesses to connect instantly for short-term gigs. Businesses can post jobs, freelancers can swipe through opportunities, and both sides can build trusted long-term relationships on our platform. We think the market is huge because local work happens everywhere, and no one has fully solved this yet.

### Founder context

- Stage: Just an idea
- Technical founder: No
- Full-time: Yes

### Expected pressure points

- marketplace cold-start risk
- generic marketplace framing
- possible no-competitor misunderstanding
- tar pit warning

## Test Case 6: boring_b2b_promising

### Startup description

We help independent HVAC contractors generate compliance-ready maintenance reports automatically after each service visit. Today most technicians handwrite notes, office staff re-enter them later, and owners lose jobs because they cannot prove compliance during audits. We have spoken to 14 contractors in two states, 9 said they would pay monthly if it saves one admin headcount, and 3 have agreed to pilot a rough MVP. One founder previously ran operations at a regional HVAC company.

### Founder context

- Stage: Building MVP
- Technical founder: Yes
- Full-time: Yes

### Expected pressure points

- strong boring B2B pattern
- strong founder-market fit
- pre-traction but credible willingness to pay

## Test Case 7: technical_no_customer_contact

### Startup description

I built a powerful internal developer tool that automatically rewrites test suites when code changes. The architecture is elegant and the core engine works well on my sample repos. I have not yet shown it to external engineering teams because I want the product to be more complete first. I think once it is polished enough, adoption will be obvious.

### Founder context

- Stage: Building MVP
- Technical founder: Yes
- Full-time: Yes

### Expected pressure points

- strong builder signal
- weak validation discipline
- risk of product-first without user evidence

## Test Case 8: great_problem_wrong_team

### Startup description

We want to build software that helps hospitals optimize nurse staffing in real time to reduce burnout and overtime costs. The problem is clearly huge, but neither of us has worked in healthcare, sold to hospitals, or built workforce management software before. One founder is a marketer and the other is a general operations manager. We have read a lot about the space and believe it is ripe for disruption.

### Founder context

- Stage: Just an idea
- Technical founder: No
- Full-time: Yes

### Expected pressure points

- good problem area
- weak founder-market fit
- weak build capability for a technical product

## Test Case 9: real_traction_clear_case

### Startup description

We build procurement software for mid-size food distributors that automates price reconciliation across suppliers. Before us, teams matched invoices manually in spreadsheets and often discovered margin losses weeks later. We launched 5 months ago. We now have 11 paying customers, $14k MRR, and revenue has grown about 11 percent week over week over the past 8 weeks. Gross churn is zero so far, and 6 customers expanded usage after the first month. One founder previously ran finance operations at a distributor and the other built internal tools at Flexport.

### Founder context

- Stage: Have revenue
- Technical founder: Yes
- Full-time: Yes

### Expected pressure points

- strong traction
- strong founder-market fit
- clear enterprise pain point
- likely high confidence output

## Test Case 10: contrarian_but_plausible

### Startup description

We are building software for independent funeral homes to manage family communication, paperwork tracking, and memorial product sales in one workflow. Today most homes juggle email, paper forms, and generic CRMs that do not fit how decisions happen during a loss. One founder grew up in a family-run funeral business and handled operations for four years. We have interviewed 19 owners, built a rough prototype, and 4 homes are testing it for free. Most outsiders think this is too niche and too uncomfortable, but owners tell us the workflow pain is constant.

### Founder context

- Stage: Have users
- Technical founder: Yes
- Full-time: Yes

### Expected pressure points

- contrarian but credible
- strong lived experience
- unsexy market may actually be a strength
- should not be penalized just because outsiders find it small or strange

## How To Use These Cases

For each test case:

1. send the startup description and founder context to the backend
2. capture the JSON output
3. check whether the schema is valid
4. check whether the hard rules were obeyed
5. note whether the feedback is specific, fair, and honest

## What Good Output Should Show

- weak cases should not receive inflated traction or market scores
- strong cases should not be flattened into generic caution
- pre-launch cases can still score well on problem or founder strength without fake traction
- buzzword-heavy or tar pit cases should trigger concerns
- the system should stay diagnostic and never slip into verdict language
