# Vercel Deployment Spec

**Branch:** feature/frontend-evaluator-flow
**Created:** 2026-04-16
**Status:** Ready to execute once Prajhan merges to main

---

## Pre-conditions

- [ ] Prajhan has merged `feature/frontend-evaluator-flow` → `main`
- [ ] You have a Vercel account (free tier is fine)
- [ ] You have the `ANTHROPIC_API_KEY` value from `.env.local`

---

## Step-by-step: deploy to Vercel

### Step 1 — Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2 — Log in to Vercel

```bash
vercel login
```

Select "Continue with GitHub" and authorize Vercel to access the `Prajhan26/yc-validator` repo.

### Step 3 — Deploy from the project root

```bash
cd c:/Users/Asus/Documents/test/yc-validator/yc-validator
vercel
```

Vercel will ask a few questions — answer like this:

| Question | Answer |
|---|---|
| Set up and deploy? | Y |
| Which scope? | Your Vercel account |
| Link to existing project? | N (first deploy) |
| Project name | yc-validator |
| Directory | ./ |
| Override settings? | N |

It will detect Next.js automatically. No `vercel.json` needed.

### Step 4 — Set the API key as an environment variable

```bash
vercel env add ANTHROPIC_API_KEY
```

When prompted:
- Value: paste the key from `.env.local`
- Environments: select **Production**, **Preview**, and **Development**

### Step 5 — Redeploy with the env var active

```bash
vercel --prod
```

This deploys to production. You will get a URL like:
`https://yc-validator.vercel.app`

### Step 6 — Verify

Open the URL, fill out the 7-question form, submit, and confirm:
- Results page renders with all 9 sections
- No 500 or 502 errors
- Hard truth is present

---

## If the deploy fails

| Error | Fix |
|---|---|
| `ANTHROPIC_API_KEY is not set` | Re-run `vercel env add ANTHROPIC_API_KEY` and redeploy |
| Build error — TypeScript | Run `npx tsc --noEmit` locally and fix errors first |
| `Failed to load knowledge base` | Check that `Knowledge/yc/distilled/` files are committed (not gitignored) |
| 502 from model | Check the API key is valid and has credits |

---

## After deployment

- Share the Vercel URL with Prajhan for his final review
- Run the benchmark against production: edit `BASE_URL` in `scripts/benchmark.mjs` to the Vercel URL and run `npm run benchmark`
- Keep `.env.local` local — never commit it (already in `.gitignore`)
