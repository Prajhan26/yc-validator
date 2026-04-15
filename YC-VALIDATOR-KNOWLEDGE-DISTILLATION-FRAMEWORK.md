# YC VALIDATOR — KNOWLEDGE DISTILLATION FRAMEWORK

## Document Purpose

This is the master framework for transforming raw YC content (essays, talks, interviews, transcripts) into a structured knowledge base that powers the YC Validator AI. 

This document is **separate from your raw dump** — it's the PROCESS you'll use to distill that dump into usable AI training material.

---

## TABLE OF CONTENTS

1. [Overview: The Distillation Pipeline](#1-overview-the-distillation-pipeline)
2. [Source Material Categories](#2-source-material-categories)
3. [Extraction Framework](#3-extraction-framework)
4. [Category 1: Founder Evaluation Criteria](#4-category-1-founder-evaluation-criteria)
5. [Category 2: Problem/Idea Evaluation Criteria](#5-category-2-problemidea-evaluation-criteria)
6. [Category 3: Market & Timing Assessment](#6-category-3-market--timing-assessment)
7. [Category 4: Traction & Validation Signals](#7-category-4-traction--validation-signals)
8. [Category 5: Red Flags & Deal Breakers](#8-category-5-red-flags--deal-breakers)
9. [Category 6: Green Flags & Strong Signals](#9-category-6-green-flags--strong-signals)
10. [Category 7: YC Interview Patterns](#10-category-7-yc-interview-patterns)
11. [Category 8: Common Mistakes & Anti-Patterns](#11-category-8-common-mistakes--anti-patterns)
12. [Category 9: Success Patterns & Case Studies](#12-category-9-success-patterns--case-studies)
13. [Category 10: Quotable Wisdom](#13-category-10-quotable-wisdom)
14. [Scoring Rubric Development](#14-scoring-rubric-development)
15. [Few-Shot Example Creation](#15-few-shot-example-creation)
16. [System Prompt Assembly](#16-system-prompt-assembly)
17. [Quality Validation Checklist](#17-quality-validation-checklist)
18. [Iteration & Refinement Process](#18-iteration--refinement-process)
19. [MVP Product Decisions](#19-mvp-product-decisions)

---

## 1. OVERVIEW: THE DISTILLATION PIPELINE

### The Goal

Transform unstructured YC wisdom into structured evaluation criteria that an AI can consistently apply.

```
RAW INPUT                         STRUCTURED OUTPUT
─────────────────────────────────────────────────────────────
20,000 words of:                  → Evaluation Framework
├── PG essays                     → Scoring Rubrics (1-10 scales)
├── YC partner talks              → Red/Green Flag Lists
├── Interview transcripts         → Question Banks
├── Startup School content        → Few-Shot Examples
├── Application advice            → Quotable Citations
└── Success/failure stories       → Anti-Pattern Warnings
```

### The Pipeline

```
PHASE 1: CATEGORIZE
├── Read through all material
├── Tag each section with category
├── Identify overlapping themes
└── Note contradictions to resolve

PHASE 2: EXTRACT
├── Pull out specific criteria
├── Identify scoring signals
├── Capture exact quotes
└── Document examples

PHASE 3: STRUCTURE
├── Build rubrics for each dimension
├── Create red/green flag lists
├── Develop question banks
└── Write few-shot examples

PHASE 4: VALIDATE
├── Test against real submissions
├── Check for consistency
├── Refine edge cases
└── Iterate based on output quality

PHASE 5: ASSEMBLE
├── Combine into system prompt
├── Order for optimal AI comprehension
├── Add formatting for clarity
└── Final review
```

---

## 2. SOURCE MATERIAL CATEGORIES

### Primary Sources (Highest Authority)

```
PAUL GRAHAM ESSAYS
├── "How to Start a Startup"
├── "Do Things That Don't Scale"
├── "Startup = Growth"
├── "How to Get Startup Ideas"
├── "The 18 Mistakes That Kill Startups"
├── "Be Good"
├── "Frighteningly Ambitious Startup Ideas"
├── "Schlep Blindness"
├── "The Hardest Lessons for Startups to Learn"
├── "How Not to Die"
├── "Ramen Profitable"
├── "Maker's Schedule, Manager's Schedule"
├── "What Startups Are Really Like"
├── "The Anatomy of Determination"
├── "Relentlessly Resourceful"
├── "Founder Mode" (if available)
└── [Add any others from your dump]

YC OFFICIAL CONTENT
├── YC Application Questions (current)
├── YC Application Advice pages
├── YC FAQ
├── Official YC blog posts
└── YC Library resources
```

### Secondary Sources (YC Partner Perspectives)

```
MICHAEL SEIBEL
├── Video talks
├── Blog posts
├── Twitter/X threads
├── Podcast appearances
└── Key topics: CEO role, fundraising, metrics

DALTON CALDWELL
├── Office hours recordings
├── Application review talks
├── Key topics: B2B, enterprise, pivots

GUSTAF ALSTRÖMER
├── Growth talks
├── Metrics discussions
├── Key topics: growth, retention, PMF

KEVIN HALE
├── Design talks
├── Pricing discussions
├── Key topics: pricing, sales, design

AARON HARRIS
├── Research and posts
├── Key topics: market analysis, trends

JARED FRIEDMAN
├── Technical founder talks
├── Key topics: technical decisions, hiring
```

### Tertiary Sources (Startup School & Lectures)

```
"HOW TO START A STARTUP" LECTURE SERIES
├── Lecture 1: How to Start a Startup (Sam Altman, Dustin Moskovitz)
├── Lecture 2: Team and Execution (Sam Altman)
├── Lecture 3: Before the Startup (Paul Graham)
├── Lecture 4: Building Product, Talking to Users (Adora Cheung)
├── Lecture 5: Competition is for Losers (Peter Thiel)
├── Lecture 6: Growth (Alex Schultz)
├── Lecture 7: How to Build Products Users Love (Kevin Hale)
├── Lecture 8: Doing Things That Don't Scale (Walker Williams)
├── Lecture 9: How to Raise Money (Marc Andreessen, Ron Conway)
├── Lecture 10: Culture (Brian Chesky, Alfred Lin)
├── [Continue for all lectures...]

STARTUP SCHOOL CURRICULUM
├── Week 1: How to Evaluate Ideas
├── Week 2: How to Talk to Users
├── Week 3: How to Launch
├── Week 4: How to Prioritize
├── Week 5: How to Set KPIs
├── Week 6: How to Grow
├── Week 7: How to Work Together
├── Week 8: How to Raise Money
└── [Add any additional content]
```

### Cross-Reference Sources

```
YC COMPANY EXAMPLES
├── Successful pivots (Slack, YouTube, Instagram)
├── Tarpit ideas that failed
├── Unsexy ideas that worked
├── Solo founders that succeeded
├── Technical vs non-technical founders
└── International founders

COMMON PATTERNS
├── Batch statistics
├── Industry breakdown
├── Founder background patterns
├── Idea origin patterns
└── Pivot patterns
```

---

## 3. EXTRACTION FRAMEWORK

### How to Read and Extract

For each piece of source material, extract the following:

```
EXTRACTION TEMPLATE
─────────────────────────────────────────────────────────────

SOURCE: [Title/URL/Reference]
AUTHOR: [Who said/wrote this]
DATE: [When, if known]
AUTHORITY LEVEL: [Primary/Secondary/Tertiary]

─────────────────────────────────────────────────────────────

CORE CLAIMS (What they're asserting)
├── Claim 1: [Direct statement]
├── Claim 2: [Direct statement]
└── Claim 3: [Direct statement]

─────────────────────────────────────────────────────────────

EVALUATION CRITERIA (What makes something good/bad)
├── Good signal: [What indicates quality]
├── Bad signal: [What indicates problems]
└── Scale: [How to measure, if mentioned]

─────────────────────────────────────────────────────────────

QUOTABLE MOMENTS (Exact words worth preserving)
├── Quote 1: "[Exact quote]"
├── Quote 2: "[Exact quote]"
└── Quote 3: "[Exact quote]"

─────────────────────────────────────────────────────────────

EXAMPLES GIVEN (Specific companies/situations mentioned)
├── Example 1: [Company/situation] — [What it illustrates]
├── Example 2: [Company/situation] — [What it illustrates]
└── Example 3: [Company/situation] — [What it illustrates]

─────────────────────────────────────────────────────────────

CONTRADICTIONS/NUANCES (Where this conflicts with other sources)
├── Contradiction: [What conflicts]
├── Nuance: [Important qualification]
└── Context: [When this applies vs doesn't]

─────────────────────────────────────────────────────────────

CATEGORY TAGS
├── [ ] Founder evaluation
├── [ ] Problem/idea evaluation
├── [ ] Market assessment
├── [ ] Traction signals
├── [ ] Red flags
├── [ ] Green flags
├── [ ] Interview patterns
├── [ ] Common mistakes
├── [ ] Success patterns
└── [ ] General wisdom
```

---

## 4. CATEGORY 1: FOUNDER EVALUATION CRITERIA

### What YC Looks For In Founders

Extract and organize everything related to founder qualities.

```
DIMENSION: DETERMINATION & RESILIENCE
─────────────────────────────────────────────────────────────

Definition: [How YC defines this quality]

Signals of STRONG (9-10):
├── [Specific behavior/evidence]
├── [Specific behavior/evidence]
├── [Specific behavior/evidence]
└── [Specific behavior/evidence]

Signals of GOOD (7-8):
├── [Specific behavior/evidence]
├── [Specific behavior/evidence]
└── [Specific behavior/evidence]

Signals of WEAK (3-4):
├── [Specific behavior/evidence]
├── [Specific behavior/evidence]
└── [Specific behavior/evidence]

Signals of POOR (1-2):
├── [Specific behavior/evidence]
├── [Specific behavior/evidence]
└── [Specific behavior/evidence]

Key Quotes:
├── "[Quote about determination]" — [Source]
├── "[Quote about resilience]" — [Source]
└── "[Quote about never giving up]" — [Source]

Examples:
├── [Founder who exemplified this]
├── [Founder who lacked this]
└── [Situation that tested this]

Questions YC Asks to Assess This:
├── "[Actual question or type of question]"
├── "[Actual question or type of question]"
└── "[Actual question or type of question]"
```

### Founder Dimensions to Extract

```
DIMENSION LIST — Extract all of these:

1. DETERMINATION / RESILIENCE / GRIT
   └── The "cockroach" quality — will they survive?

2. DOMAIN EXPERTISE
   └── Do they deeply understand the space?

3. TECHNICAL CAPABILITY
   └── Can they build the product themselves?

4. SPEED OF EXECUTION
   └── Do they move fast? Ship quickly?

5. COMMUNICATION CLARITY
   └── Can they explain the idea simply?

6. COACHABILITY
   └── Do they listen and adapt?

7. INTELLIGENCE / LEARNING SPEED
   └── How fast do they process new information?

8. RELATIONSHIP / TEAM DYNAMICS
   └── For co-founders: how well do they work together?

9. AUTHENTICITY / MISSION
   └── Is this a calling or just an opportunity?

10. RESOURCEFULNESS
    └── Can they do a lot with a little?

11. SALES ABILITY
    └── Can they convince users, investors, hires?

12. SELF-AWARENESS
    └── Do they know their weaknesses?

13. ETHICAL FOUNDATION
    └── Can they be trusted?

14. PREVIOUS EXPERIENCE
    └── What have they done before?

15. WHY THIS, WHY NOW
    └── Why is this founder building this thing at this moment?
```

### Founder Red Flags (From Your Sources)

```
FOUNDER RED FLAGS — Extract all mentions of:

├── Founders who just met (no history together)
├── Founders who can't explain simply
├── Founders who blame others for failures
├── Founders who seem to be doing this for money/status
├── Founders who haven't started building
├── Founders who are waiting for funding to begin
├── Founders who seem to be playing startup
├── Founders who can't answer hard questions
├── Founders who get defensive
├── Founders who haven't talked to users
├── Founders with no connection to the problem
├── Founders who seem to be pitching, not building
├── Founders who have too many ideas
├── Founders who won't commit full-time
├── Solo founders with no relevant experience
├── Business-only founders for technical products
├── Founders who seem naive about competition
├── Founders who think the idea is everything
├── Founders who won't do things that don't scale
└── [Add any others from your sources]
```

### Founder Green Flags (From Your Sources)

```
FOUNDER GREEN FLAGS — Extract all mentions of:

├── Founders who experienced the problem personally
├── Founders who have already started building
├── Founders who have early users/traction
├── Founders with deep domain expertise
├── Founders who can explain clearly in one sentence
├── Founders who have done this before (even if failed)
├── Founders who are technical enough to build v1
├── Founders who have worked together before
├── Founders who seem obsessed with the problem
├── Founders who have quit their jobs to do this
├── Founders who have unique insight into the market
├── Founders who have talked to many potential users
├── Founders who can articulate why them, why now
├── Founders who are building something they want
├── Founders who are "relentlessly resourceful"
├── Founders who have already pivoted based on feedback
├── Founders who know their metrics cold
├── Founders who understand their competition deeply
├── Founders who can sell the vision
└── [Add any others from your sources]
```

---

## 5. CATEGORY 2: PROBLEM/IDEA EVALUATION CRITERIA

### What Makes a Good Startup Problem

```
DIMENSION: PROBLEM URGENCY / HAIR ON FIRE
─────────────────────────────────────────────────────────────

Definition: [How YC describes urgent problems]

The "Hair on Fire" Test:
├── What does this mean exactly?
├── Examples of hair-on-fire problems
├── Examples of "nice to have" problems
└── How to tell the difference

Signals of URGENT (9-10):
├── Users actively searching for solutions
├── Users willing to use broken/ugly solutions
├── Users willing to pay immediately
├── Users experiencing real pain/cost from problem
└── [Add from sources]

Signals of MODERATE (5-6):
├── Users acknowledge the problem
├── Users would use a solution if easy
├── Users not actively seeking solutions
└── [Add from sources]

Signals of WEAK (1-2):
├── Users don't recognize the problem
├── Users shrug when you describe it
├── Founder has to convince users they have this problem
└── [Add from sources]

Key Quotes:
├── "[Quote about problem urgency]" — [Source]
└── "[Quote about problem urgency]" — [Source]
```

### Problem Dimensions to Extract

```
DIMENSION LIST — Extract all of these:

1. URGENCY / PAIN LEVEL
   └── How badly do people need this solved?

2. FREQUENCY
   └── How often do people encounter this problem?

3. WILLINGNESS TO PAY
   └── Will people pay real money for a solution?

4. CURRENT ALTERNATIVES
   └── How do people solve this today?

5. SWITCHING COSTS
   └── How hard is it to switch from current solution?

6. CLARITY
   └── Is the problem well-defined and understandable?

7. ACCESSIBILITY
   └── Can you reach people with this problem?

8. GROWTH OF PROBLEM
   └── Is this problem growing or shrinking?

9. PROBLEM OWNERSHIP
   └── Who "owns" this problem in an organization?

10. MEASURABILITY
    └── Can you measure whether you've solved it?
```

### Idea Quality Dimensions

```
DIMENSION LIST — Extract all of these:

1. SOLUTION FIT
   └── Does the solution actually solve the problem?

2. SIMPLICITY
   └── Is the solution elegantly simple?

3. DIFFERENTIATION
   └── Why is this better than alternatives?

4. DEFENSIBILITY
   └── Can this be protected from competition?

5. TECHNICAL FEASIBILITY
   └── Can this actually be built?

6. BUSINESS MODEL CLARITY
   └── Is it obvious how this makes money?

7. DISTRIBUTION STRATEGY
   └── How will you reach customers?

8. SCALABILITY
   └── Can this grow without linear cost increases?

9. TIMING
   └── Why is now the right time for this?

10. UNFAIR ADVANTAGE
    └── What do you have that others don't?
```

### Types of Ideas to Extract

```
IDEA CATEGORIES — From YC content:

GOOD IDEA PATTERNS:
├── Something the founder wants/needs themselves
├── Something discovered through expertise
├── Something others have tried but gotten wrong
├── Something that's become possible recently
├── Something unsexy that's actually big
├── Something that starts narrow and expands
├── Something that makes something 10x better
└── [Add from sources]

BAD IDEA PATTERNS (TARPIT IDEAS):
├── Social networks for X
├── Apps for Y demographic
├── "Uber for Z" without network effects
├── Consumer products requiring behavior change
├── Ideas that require two-sided marketplace from day 1
├── Ideas dependent on partnerships
├── Ideas requiring massive scale to work
├── Ideas everyone has thought of
└── [Add from sources]

UNSEXY GOOD IDEAS:
├── B2B software for boring industries
├── Developer tools
├── Infrastructure
├── "Schlep" businesses others avoid
└── [Add from sources]
```

---

## 6. CATEGORY 3: MARKET & TIMING ASSESSMENT

### Market Size Framework

```
HOW YC THINKS ABOUT MARKETS
─────────────────────────────────────────────────────────────

TAM/SAM/SOM Perspective:
├── How YC uses (or doesn't use) these terms
├── What market size matters to them
├── Minimum market size expectations
└── [Extract from sources]

"Venture Scale" Definition:
├── What makes something venture-scale?
├── What's too small?
├── How to think about market size honestly
└── [Extract from sources]

Market Quality Signals:
├── Growing vs declining markets
├── Fragmented vs consolidated markets
├── New markets vs existing markets
└── [Extract from sources]
```

### Market Dimensions to Extract

```
DIMENSION LIST:

1. SIZE (CURRENT)
   └── How big is this market today?

2. GROWTH RATE
   └── How fast is this market growing?

3. FRAGMENTATION
   └── Is this winner-take-all or room for many?

4. COMPETITION INTENSITY
   └── How brutal is the competition?

5. REGULATORY ENVIRONMENT
   └── Are there barriers/tailwinds from regulation?

6. TECHNOLOGY TRENDS
   └── Is technology enabling or threatening this market?

7. CUSTOMER ACQUISITION COST TRENDS
   └── Is it getting easier or harder to reach customers?

8. INTERNATIONAL POTENTIAL
   └── Can this expand globally?

9. ADJACENT MARKETS
   └── What other markets can you expand into?

10. TIMING SIGNALS
    └── Why is NOW the right time?
```

### Timing Framework

```
"WHY NOW" ANALYSIS — Extract from sources:

Technology Timing:
├── What technology changes enable this?
├── Why wasn't this possible before?
├── What infrastructure now exists?
└── [Examples from YC content]

Market Timing:
├── What behavior changes enable this?
├── What market shifts are happening?
├── What regulations have changed?
└── [Examples from YC content]

"Too Early" Signals:
├── When is an idea too early?
├── Examples of too-early startups
├── How to know if you're too early
└── [From sources]

"Too Late" Signals:
├── When has the window closed?
├── Examples of too-late entries
├── How to know if market is saturated
└── [From sources]
```

---

## 7. CATEGORY 4: TRACTION & VALIDATION SIGNALS

### What Counts as Traction

```
TRACTION HIERARCHY (From YC content)
─────────────────────────────────────────────────────────────

STRONGEST TRACTION:
├── Revenue (especially growing MRR)
├── Paying customers (especially enterprise)
├── Profitable unit economics
└── [Specific quotes about what impresses YC]

STRONG TRACTION:
├── Active users (daily/weekly)
├── Retention metrics
├── User growth rate
├── Word-of-mouth growth
└── [From sources]

MODERATE TRACTION:
├── Waitlist signups
├── Letter of intent (LOI)
├── Pilot programs
├── Pre-orders
└── [From sources]

WEAK TRACTION:
├── Landing page signups
├── Social media followers
├── "Interest" from potential customers
├── Awards/press coverage
└── [From sources]

NOT TRACTION:
├── Friends/family using product
├── Hypothetical demand
├── Market research
├── Survey responses
└── [From sources]
```

### Validation Methods

```
USER VALIDATION — Extract from sources:

TALKING TO USERS:
├── How many users should you talk to?
├── What questions should you ask?
├── What signals matter?
├── How to interpret what users say vs do?
└── [Specific guidance from YC content]

MVP VALIDATION:
├── What's the minimum viable product?
├── How to test with minimal resources?
├── When is something too minimal?
└── [From sources]

PRE-LAUNCH VALIDATION:
├── How to validate before building?
├── Concierge MVP approach
├── Wizard of Oz testing
└── [From sources]
```

### Metrics That Matter

```
KEY METRICS — Extract YC's perspective on:

GROWTH METRICS:
├── Week-over-week growth expectations
├── What growth rate is "good"?
├── How to measure growth honestly
└── [From sources]

RETENTION METRICS:
├── What retention indicates PMF?
├── Cohort analysis expectations
├── Churn benchmarks
└── [From sources]

ENGAGEMENT METRICS:
├── What engagement signals value?
├── Daily/weekly/monthly active users
├── Time spent, actions taken
└── [From sources]

UNIT ECONOMICS:
├── CAC, LTV, payback period
├── When to worry about unit economics
├── When unit economics don't matter yet
└── [From sources]
```

---

## 8. CATEGORY 5: RED FLAGS & DEAL BREAKERS

### Automatic Rejection Patterns

```
INSTANT RED FLAGS — Extract all mentions:

FOUNDER RED FLAGS:
├── [List everything that makes YC immediately concerned]
├── [Quote: "When we see X, we worry..."]
├── [Quote: "This is almost always a bad sign..."]
└── [Continue from sources]

IDEA RED FLAGS:
├── [List everything about ideas that raises concerns]
├── [Quote about problematic idea patterns]
├── [Tarpit ideas mentioned]
└── [Continue from sources]

MARKET RED FLAGS:
├── [List market-related concerns]
├── [Quote about market problems]
└── [Continue from sources]

EXECUTION RED FLAGS:
├── [List execution concerns]
├── [Quote about execution problems]
└── [Continue from sources]
```

### Deal Breaker Categories

```
CATEGORY: FOUNDER ISSUES
─────────────────────────────────────────────────────────────
├── Issue: [Specific problem]
│   ├── Why it matters: [Explanation]
│   ├── Quote: "[Supporting quote]" — [Source]
│   └── Example: [If given]
├── Issue: [Next specific problem]
│   └── [Same structure]
└── [Continue...]

CATEGORY: IDEA ISSUES
─────────────────────────────────────────────────────────────
├── [Same structure]

CATEGORY: MARKET ISSUES
─────────────────────────────────────────────────────────────
├── [Same structure]

CATEGORY: TIMING ISSUES
─────────────────────────────────────────────────────────────
├── [Same structure]

CATEGORY: BUSINESS MODEL ISSUES
─────────────────────────────────────────────────────────────
├── [Same structure]
```

---

## 9. CATEGORY 6: GREEN FLAGS & STRONG SIGNALS

### What Makes YC Excited

```
FOUNDER GREEN FLAGS — Extract all mentions:

What makes YC say "yes":
├── [Specific positive signal]
├── [Quote: "When we see X, we get excited..."]
├── [Quote: "This almost always indicates..."]
└── [Continue from sources]

IDEA GREEN FLAGS:
├── [List everything about ideas that excites YC]
├── [Quote about exciting idea patterns]
└── [Continue from sources]

MARKET GREEN FLAGS:
├── [List market-related positives]
├── [Quote about market opportunities]
└── [Continue from sources]

TRACTION GREEN FLAGS:
├── [List traction signals they love]
├── [Quote about impressive traction]
└── [Continue from sources]
```

### Strong Signal Categories

```
CATEGORY: FOUNDER EXCELLENCE
─────────────────────────────────────────────────────────────
├── Signal: [Specific positive indicator]
│   ├── Why it matters: [Explanation]
│   ├── Quote: "[Supporting quote]" — [Source]
│   └── Example: [Company/founder if given]
└── [Continue...]

CATEGORY: IDEA EXCELLENCE
─────────────────────────────────────────────────────────────
├── [Same structure]

CATEGORY: MARKET OPPORTUNITY
─────────────────────────────────────────────────────────────
├── [Same structure]

CATEGORY: TRACTION QUALITY
─────────────────────────────────────────────────────────────
├── [Same structure]

CATEGORY: TIMING ADVANTAGE
─────────────────────────────────────────────────────────────
├── [Same structure]
```

---

## 10. CATEGORY 7: YC INTERVIEW PATTERNS

### Questions YC Asks

```
QUESTION BANK — Extract all actual/reported questions:

ABOUT THE IDEA:
├── "[Actual question]"
├── "[Actual question]"
├── What they're really testing: [Explanation]
└── [Continue from sources]

ABOUT THE FOUNDERS:
├── "[Actual question]"
├── "[Actual question]"
├── What they're really testing: [Explanation]
└── [Continue from sources]

ABOUT THE MARKET:
├── "[Actual question]"
├── "[Actual question]"
├── What they're really testing: [Explanation]
└── [Continue from sources]

ABOUT TRACTION:
├── "[Actual question]"
├── "[Actual question]"
├── What they're really testing: [Explanation]
└── [Continue from sources]

ABOUT COMPETITION:
├── "[Actual question]"
├── "[Actual question]"
├── What they're really testing: [Explanation]
└── [Continue from sources]

CURVEBALL QUESTIONS:
├── "[Surprising question they ask]"
├── Why they ask this: [Explanation]
└── [Continue from sources]
```

### What Good Answers Look Like

```
ANSWER PATTERNS — Extract guidance on:

GOOD ANSWER CHARACTERISTICS:
├── Concise and direct
├── Shows deep understanding
├── Includes specific numbers/examples
├── Demonstrates founder has done the work
└── [Add from sources]

BAD ANSWER CHARACTERISTICS:
├── Rambling or unfocused
├── Defensive when challenged
├── Vague or hypothetical
├── Shows founder hasn't validated
└── [Add from sources]

SPECIFIC ANSWER EXAMPLES:
├── Question: "[Question]"
│   ├── Good answer: "[Example]"
│   └── Bad answer: "[Example]"
└── [Continue for key questions]
```

---

## 11. CATEGORY 8: COMMON MISTAKES & ANTI-PATTERNS

### The 18 Mistakes (And Others)

```
FROM "THE 18 MISTAKES THAT KILL STARTUPS":
─────────────────────────────────────────────────────────────

Mistake 1: [Name]
├── Description: [What it is]
├── Why it kills startups: [Explanation]
├── How to avoid: [Guidance]
├── Quote: "[Relevant quote]"
└── Example: [If given]

Mistake 2: [Name]
├── [Same structure]
└── [Continue for all 18]

ADDITIONAL MISTAKES FROM OTHER SOURCES:
─────────────────────────────────────────────────────────────
├── [Mistake from other YC content]
├── [Mistake from other YC content]
└── [Continue...]
```

### Application Mistakes

```
YC APPLICATION MISTAKES — Extract all mentions:

COMMON APPLICATION ERRORS:
├── [Mistake in how people apply]
├── [What makes applications weak]
├── [What makes YC stop reading]
└── [Continue from sources]

INTERVIEW MISTAKES:
├── [What founders do wrong in interviews]
├── [What loses YC's interest]
├── [What makes YC say no]
└── [Continue from sources]
```

---

## 12. CATEGORY 9: SUCCESS PATTERNS & CASE STUDIES

### YC Company Examples

```
COMPANY CASE STUDIES — Extract mentions of:

SUCCESSFUL PIVOTS:
├── Company: [Name]
│   ├── Original idea: [What they started with]
│   ├── Pivot: [What they became]
│   ├── Why it worked: [Explanation]
│   └── Lesson: [What this teaches]
└── [Continue for each mentioned]

"UNSEXY" SUCCESSES:
├── Company: [Name]
│   ├── Why it seemed unsexy: [Explanation]
│   ├── Why it succeeded: [Explanation]
│   └── Lesson: [What this teaches]
└── [Continue...]

SOLO FOUNDER SUCCESSES:
├── [Examples given]

NON-TECHNICAL FOUNDER SUCCESSES:
├── [Examples given]

OVERNIGHT SUCCESSES (That weren't):
├── [Examples of companies that took time]

REJECTED THEN SUCCEEDED:
├── [Companies rejected by YC that later succeeded]
```

### Success Patterns

```
PATTERN: [Name of pattern]
─────────────────────────────────────────────────────────────
├── Description: [What this pattern is]
├── Why it works: [Explanation from sources]
├── Examples: [Companies that exemplify this]
├── Quote: "[Supporting quote]"
└── How to apply: [Guidance]

[Continue for each pattern identified in sources]
```

---

## 13. CATEGORY 10: QUOTABLE WISDOM

### Quote Organization

```
QUOTES BY TOPIC
─────────────────────────────────────────────────────────────

TOPIC: STARTUP IDEAS
├── "[Quote]" — [Author]
├── "[Quote]" — [Author]
└── [Continue...]

TOPIC: FOUNDERS
├── "[Quote]" — [Author]
└── [Continue...]

TOPIC: EXECUTION
├── "[Quote]" — [Author]
└── [Continue...]

TOPIC: GROWTH
├── "[Quote]" — [Author]
└── [Continue...]

TOPIC: FUNDRAISING
├── "[Quote]" — [Author]
└── [Continue...]

TOPIC: FAILURE
├── "[Quote]" — [Author]
└── [Continue...]

TOPIC: SUCCESS
├── "[Quote]" — [Author]
└── [Continue...]

[Add more topics as needed]
```

### Quotes by Author

```
PAUL GRAHAM QUOTES:
├── "[Quote]" — Context: [When/where]
└── [Continue...]

MICHAEL SEIBEL QUOTES:
├── "[Quote]" — Context: [When/where]
└── [Continue...]

DALTON CALDWELL QUOTES:
├── "[Quote]" — Context: [When/where]
└── [Continue...]

[Continue for each source author]
```

### Most Important Quotes (For System Prompt)

```
TOP 20 QUOTES TO INCLUDE IN SYSTEM PROMPT:

1. "[Quote]" — [Author]
   └── Use when: [Evaluation context]

2. "[Quote]" — [Author]
   └── Use when: [Evaluation context]

[Continue for top 20]
```

---

## 14. SCORING RUBRIC DEVELOPMENT

### Building Consistent Rubrics

For each evaluation dimension, create a detailed rubric:

```
DIMENSION: [NAME]
─────────────────────────────────────────────────────────────

DEFINITION:
[Clear definition of what this dimension measures]

WEIGHT: [X%]
[Why this weight — based on YC emphasis in sources]

─────────────────────────────────────────────────────────────

SCORE 10: EXCEPTIONAL (Top 1%)
─────────────────────────────────────────────────────────────
What this looks like:
├── [Specific observable criterion]
├── [Specific observable criterion]
├── [Specific observable criterion]
└── [Specific observable criterion]

Example from YC content:
├── [Company or situation that exemplifies this]

Quote supporting this level:
├── "[Quote]" — [Source]

─────────────────────────────────────────────────────────────

SCORE 8-9: STRONG (Top 10%)
─────────────────────────────────────────────────────────────
What this looks like:
├── [Specific observable criterion]
├── [Specific observable criterion]
└── [Specific observable criterion]

What's missing from a 10:
├── [What would make this exceptional]

─────────────────────────────────────────────────────────────

SCORE 6-7: GOOD (Above Average)
─────────────────────────────────────────────────────────────
What this looks like:
├── [Specific observable criterion]
├── [Specific observable criterion]
└── [Specific observable criterion]

What's missing from an 8:
├── [What would make this strong]

─────────────────────────────────────────────────────────────

SCORE 5: AVERAGE
─────────────────────────────────────────────────────────────
What this looks like:
├── [Specific observable criterion]
├── [Specific observable criterion]
└── [Specific observable criterion]

─────────────────────────────────────────────────────────────

SCORE 3-4: BELOW AVERAGE
─────────────────────────────────────────────────────────────
What this looks like:
├── [Specific observable criterion]
├── [Specific observable criterion]
└── [Specific observable criterion]

Concerns at this level:
├── [What's worrying about this]

─────────────────────────────────────────────────────────────

SCORE 1-2: POOR (Major Concerns)
─────────────────────────────────────────────────────────────
What this looks like:
├── [Specific observable criterion]
├── [Specific observable criterion]
└── [Specific observable criterion]

This is often a deal-breaker because:
├── [Why this level is problematic]

─────────────────────────────────────────────────────────────

EDGE CASES & NUANCES:
├── When to score higher despite X: [Guidance]
├── When to score lower despite Y: [Guidance]
├── How this interacts with other dimensions: [Explanation]
└── Common mistakes in scoring this: [Warnings]
```

### Complete Rubric Set to Build

```
BUILD DETAILED RUBRICS FOR:

1. PROBLEM QUALITY (Weight: 25%)
2. SOLUTION CLARITY (Weight: 20%)
3. FOUNDER FIT (Weight: 25%)
4. MARKET POTENTIAL (Weight: 15%)
5. TRACTION & EVIDENCE (Weight: 15%)

Each rubric should be 1-2 pages of detailed criteria.
```

---

## 15. FEW-SHOT EXAMPLE CREATION

### Example Evaluation Set

Create 5-10 complete example evaluations to include in the system prompt:

```
EXAMPLE EVALUATION #1
─────────────────────────────────────────────────────────────

INPUT:
Idea: [Example startup description]
Stage: [Stage]
Expertise: [Level]
User Conversations: [Status]
Additional: [If any]

─────────────────────────────────────────────────────────────

OUTPUT (What the AI should produce):

{
  "overall_score": [X],
  "verdict": "[VERDICT]",
  "verdict_summary": "[Summary]",
  
  "dimensions": {
    "problem_quality": {
      "score": [X],
      "summary": "[Explanation]"
    },
    "solution_clarity": {
      "score": [X],
      "summary": "[Explanation]"
    },
    "founder_fit": {
      "score": [X],
      "summary": "[Explanation]"
    },
    "market_potential": {
      "score": [X],
      "summary": "[Explanation]"
    },
    "traction": {
      "score": [X],
      "summary": "[Explanation]"
    }
  },
  
  "whats_working": [
    "[Strength 1]",
    "[Strength 2]",
    "[Strength 3]"
  ],
  
  "needs_work": [
    "[Weakness 1]",
    "[Weakness 2]",
    "[Weakness 3]"
  ],
  
  "yc_questions": [
    "[Question 1]",
    "[Question 2]",
    "[Question 3]",
    "[Question 4]"
  ],
  
  "hard_truth": "[Direct, honest feedback]",
  
  "next_steps": [
    "[Action 1]",
    "[Action 2]",
    "[Action 3]",
    "[Action 4]"
  ]
}

─────────────────────────────────────────────────────────────

WHY THIS SCORING:
[Explanation of why each score was given]

─────────────────────────────────────────────────────────────
```

### Example Types to Create

```
CREATE EXAMPLES FOR EACH SCENARIO:

1. STRONG IDEA (Score 85+)
   └── What a ready-to-apply idea looks like

2. PROMISING IDEA (Score 70-84)
   └── Good potential but needs work

3. EARLY STAGE IDEA (Score 50-69)
   └── Needs significant validation

4. WEAK IDEA (Score below 50)
   └── Fundamental problems

5. TECHNICAL FOUNDER, NON-TECHNICAL IDEA
   └── How to evaluate this mismatch

6. NON-TECHNICAL FOUNDER, TECHNICAL IDEA
   └── Common pattern, how to evaluate

7. TARPIT IDEA
   └── Common bad idea that sounds good

8. UNSEXY BUT GOOD IDEA
   └── Boring-sounding but actually promising

9. GREAT FOUNDER, WEAK IDEA
   └── How to give useful feedback

10. WEAK FOUNDER, GOOD IDEA
    └── How to be honest about founder fit
```

---

## 16. SYSTEM PROMPT ASSEMBLY

### Final System Prompt Structure

```
SYSTEM PROMPT OUTLINE
─────────────────────────────────────────────────────────────

SECTION 1: ROLE DEFINITION (200-300 words)
├── Who the AI is
├── Its purpose
├── Its principles
└── Its constraints

SECTION 2: YC KNOWLEDGE BASE (1000-1500 words)
├── Core YC principles
├── What YC looks for
├── Red flags and green flags
├── Key quotes to reference
└── Distilled wisdom from your 20K dump

SECTION 3: EVALUATION FRAMEWORK (500-700 words)
├── The 5 dimensions
├── Weighting
├── How to score
└── What each score level means

SECTION 4: OUTPUT FORMAT (200-300 words)
├── JSON structure
├── Tone guidelines
├── Quality requirements
└── What good feedback looks like

SECTION 5: FEW-SHOT EXAMPLES (1000-1500 words)
├── 3-5 complete example evaluations
├── Covering different scenarios
└── Showing expected quality

TOTAL: 3000-4500 tokens
```

### Assembly Checklist

```
BEFORE FINALIZING SYSTEM PROMPT:

[ ] All 5 dimensions have clear rubrics
[ ] Red flags are comprehensive
[ ] Green flags are comprehensive
[ ] Key quotes are included
[ ] Few-shot examples cover edge cases
[ ] Tone is consistent (straight shooter)
[ ] Output format is precisely defined
[ ] No contradictions in criteria
[ ] Tested against real submissions
[ ] Reviewed for bias or unfairness
```

---

## 17. QUALITY VALIDATION CHECKLIST

### Testing the Knowledge Base

```
VALIDATION TESTS TO RUN:

1. CONSISTENCY TEST
   └── Same idea submitted twice gets similar scores?

2. EDGE CASE TEST
   └── Unusual ideas handled appropriately?

3. CALIBRATION TEST
   └── Scores match what YC would actually think?

4. SPECIFICITY TEST
   └── Feedback is specific, not generic?

5. ACTIONABILITY TEST
   └── Recommendations are actually doable?

6. FAIRNESS TEST
   └── No bias against certain founder types?

7. QUOTE ACCURACY TEST
   └── Quotes attributed correctly?

8. RUBRIC COVERAGE TEST
   └── All scenarios covered by rubrics?

9. CONTRADICTION TEST
   └── No conflicting guidance in prompt?

10. TONE TEST
    └── Straight shooter but not cruel?
```

### Iteration Criteria

```
WHEN TO REVISE:

├── AI gives generic feedback → Add more specific examples
├── Scores seem inconsistent → Tighten rubric definitions
├── Missing important YC wisdom → Add to knowledge base
├── Feedback isn't actionable → Improve next_steps generation
├── Quotes feel forced → Reduce or better integrate quotes
├── Edge cases handled poorly → Add few-shot examples
└── Users say it doesn't feel like YC → Review against sources
```

---

## 18. ITERATION & REFINEMENT PROCESS

### Post-Launch Improvement

```
FEEDBACK COLLECTION:

1. Track which feedback users find most valuable
2. Note when users disagree with scores
3. Identify ideas that scored high but failed (if trackable)
4. Identify ideas that scored low but succeeded (if trackable)
5. Gather qualitative feedback on usefulness
```

### Knowledge Base Updates

```
WHEN TO UPDATE KNOWLEDGE BASE:

├── New YC partner talks released
├── New PG essays published
├── YC application process changes
├── New patterns emerge in YC batches
├── User feedback reveals gaps
└── AI output quality degrades
```

### Version Control

```
MAINTAIN VERSIONS:

├── v1.0: Initial knowledge base
├── v1.1: Post-launch fixes
├── v2.0: Major content update
└── [Continue versioning]

DOCUMENT CHANGES:
├── What was added
├── What was removed
├── Why changes were made
├── Impact on output quality
```

---

## 19. MVP PRODUCT DECISIONS

These implementation decisions come from the project specification and should guide the first usable version of the YC Validator. They are separate from the knowledge distillation workflow, but important for building the product around that knowledge.

### What To Build First

```
MVP IMPLEMENTATION PRIORITIES:

1. ONE FAST FORM
   └── Single startup description input with minimal friction

2. NO AUTH, NO DATABASE, NO SERVER-SIDE STORAGE
   └── Privacy-first MVP with no required signup

3. SERVER-SIDE API CALL FOR THE MODEL
   └── Keep model credentials off the client

4. STRUCTURED JSON OUTPUT
   └── Force a consistent response format for evaluation results

5. BUZZWORD DETECTION
   └── Lightweight client-side warning for vague language

6. TARPIT DETECTION
   └── Lightweight client-side warning for historically difficult startup categories

7. HARD TRUTH FEEDBACK
   └── Every evaluation should include one blunt, structural risk

8. SIMPLE RESULTS PAGE
   └── Show score breakdown and critical questions without unnecessary complexity
```

### What Not To Add In v1

```
DO NOT BUILD YET:

├── User accounts
├── Persistent submission history on the server
├── Database-backed submission storage
├── Multi-step wizard flows
├── Heavy product surface before evaluator quality is reliable
└── Nice-to-have features that distract from evaluator usefulness
```

### Why These Decisions Matter

```
MVP PRINCIPLES:

├── Speed: founders can complete the flow quickly
├── Privacy: startup ideas are not stored by default
├── Clarity: output is structured and easy to compare
├── Honesty: feedback should feel direct, not flattering
└── Focus: keep the interface small while the evaluator improves
```

---

## APPENDIX A: EXTRACTION WORKSHEET

Use this worksheet for each source document:

```
SOURCE DOCUMENT: _______________________________________

DATE PROCESSED: ________________________________________

PROCESSED BY: __________________________________________

─────────────────────────────────────────────────────────────

SECTION 1: FOUNDER CRITERIA EXTRACTED
├── 
├── 
└── 

SECTION 2: PROBLEM/IDEA CRITERIA EXTRACTED
├── 
├── 
└── 

SECTION 3: MARKET CRITERIA EXTRACTED
├── 
├── 
└── 

SECTION 4: TRACTION CRITERIA EXTRACTED
├── 
├── 
└── 

SECTION 5: RED FLAGS EXTRACTED
├── 
├── 
└── 

SECTION 6: GREEN FLAGS EXTRACTED
├── 
├── 
└── 

SECTION 7: QUOTES EXTRACTED
├── 
├── 
└── 

SECTION 8: EXAMPLES/CASE STUDIES EXTRACTED
├── 
├── 
└── 

SECTION 9: QUESTIONS TO ADD TO BANK
├── 
├── 
└── 

SECTION 10: NOTES/OBSERVATIONS
├── 
├── 
└── 
```

---

## APPENDIX B: KNOWLEDGE BASE TEMPLATE

Final organized structure for the distilled knowledge:

```
yc-knowledge-base/
├── 01-founder-criteria/
│   ├── determination.md
│   ├── domain-expertise.md
│   ├── technical-capability.md
│   ├── execution-speed.md
│   ├── communication.md
│   ├── coachability.md
│   ├── team-dynamics.md
│   └── red-flags.md
├── 02-problem-criteria/
│   ├── urgency.md
│   ├── frequency.md
│   ├── willingness-to-pay.md
│   ├── current-alternatives.md
│   ├── clarity.md
│   └── tarpit-ideas.md
├── 03-solution-criteria/
│   ├── problem-fit.md
│   ├── differentiation.md
│   ├── simplicity.md
│   ├── defensibility.md
│   └── business-model.md
├── 04-market-criteria/
│   ├── size.md
│   ├── growth.md
│   ├── timing.md
│   ├── competition.md
│   └── expansion.md
├── 05-traction-criteria/
│   ├── what-counts.md
│   ├── metrics.md
│   ├── validation-methods.md
│   └── growth-rates.md
├── 06-quotes/
│   ├── paul-graham.md
│   ├── michael-seibel.md
│   ├── dalton-caldwell.md
│   └── other-partners.md
├── 07-examples/
│   ├── successful-companies.md
│   ├── pivots.md
│   ├── failures.md
│   └── case-studies.md
├── 08-scoring-rubrics/
│   ├── problem-quality-rubric.md
│   ├── solution-clarity-rubric.md
│   ├── founder-fit-rubric.md
│   ├── market-potential-rubric.md
│   └── traction-rubric.md
├── 09-few-shot-examples/
│   ├── example-strong.md
│   ├── example-promising.md
│   ├── example-early.md
│   ├── example-weak.md
│   └── example-edge-cases.md
└── 10-system-prompt/
    └── final-system-prompt.md
```

---

## APPENDIX C: QUICK REFERENCE CHECKLISTS

### Daily Extraction Checklist

```
[ ] Read source material completely
[ ] Fill out extraction worksheet
[ ] Tag with categories
[ ] Extract exact quotes
[ ] Note examples given
[ ] Identify contradictions
[ ] Add to appropriate knowledge base file
[ ] Update quote library
[ ] Review for consistency with existing content
```

### Weekly Review Checklist

```
[ ] Review all extractions from the week
[ ] Resolve any contradictions found
[ ] Update scoring rubrics if needed
[ ] Add new few-shot examples if gaps found
[ ] Test system prompt against sample submissions
[ ] Document any changes made
```

### Pre-Launch Checklist

```
[ ] All sources processed
[ ] Knowledge base complete
[ ] Scoring rubrics finalized
[ ] Few-shot examples created
[ ] System prompt assembled
[ ] Validation tests passed
[ ] Edge cases covered
[ ] Tone reviewed
[ ] Ready for real submissions
```

---

## END OF FRAMEWORK DOCUMENT

This document is your operating manual for transforming raw YC content into a structured, production-grade knowledge base. Follow it systematically, and you'll build an AI evaluator that genuinely reflects YC's thinking.

Next step: Send your 20K dump in chunks, and we'll begin the extraction process together.
