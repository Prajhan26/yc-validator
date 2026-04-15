"use client";

import { useState } from "react";
import type { EvalOutput } from "../lib/evaluator/schema";

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = "idea" | "mvp" | "users" | "revenue";

interface FormState {
  company_description: string;
  problem_description: string;
  founder_context:     string;
  stage:               Stage;
  competitors:         string;
  is_technical:        boolean;
  is_full_time:        boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<Stage, string> = {
  idea:    "Idea — no product yet",
  mvp:     "MVP — product built, few or no users",
  users:   "Users — people are using it",
  revenue: "Revenue — paying customers",
};

const DIMENSION_LABELS: Record<string, string> = {
  problem_quality:       "Problem Quality",
  founder_fit:           "Founder Fit",
  solution_clarity:      "Solution Clarity",
  market_potential:      "Market Potential",
  traction_and_evidence: "Traction & Evidence",
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [form, setForm] = useState<FormState>({
    company_description: "",
    problem_description: "",
    founder_context:     "",
    stage:               "idea",
    competitors:         "",
    is_technical:        false,
    is_full_time:        true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<EvalOutput | null>(null);

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (form.company_description.trim().length < 20) {
      setError("Please describe what your company does in at least 20 characters.");
      return;
    }
    if (form.problem_description.trim().length < 20) {
      setError("Please describe the problem you are solving in at least 20 characters.");
      return;
    }
    if (form.founder_context.trim().length < 10) {
      setError("Please tell us why you are the right founder.");
      return;
    }
    if (form.competitors.trim().length < 5) {
      setError("Please describe your competitors.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data as EvalOutput);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white text-zinc-900 px-4 py-16 font-sans">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Is your startup idea YC-ready?
          </h1>
          <p className="text-zinc-500 text-base">
            Get honest, structured feedback on your startup idea.
          </p>
        </div>

        {/* Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Q1 — What does your company do */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                What does your company do?
              </label>
              <textarea
                className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                rows={3}
                placeholder="Describe what you are building and who it is for."
                value={form.company_description}
                onChange={(e) => setForm({ ...form, company_description: e.target.value })}
              />
            </div>

            {/* Q2 — What problem are you solving */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                What problem are you solving, and who has it?
              </label>
              <textarea
                className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                rows={3}
                placeholder="Describe the specific pain point and the people who experience it."
                value={form.problem_description}
                onChange={(e) => setForm({ ...form, problem_description: e.target.value })}
              />
            </div>

            {/* Q3 — Why are you the right founder */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                Why are you the right founder to build this?
              </label>
              <textarea
                className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                rows={3}
                placeholder="Your background, domain expertise, or personal connection to this problem."
                value={form.founder_context}
                onChange={(e) => setForm({ ...form, founder_context: e.target.value })}
              />
            </div>

            {/* Q4 — How far along are you */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                How far along are you?
              </label>
              <select
                className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
              >
                {(Object.entries(STAGE_LABELS) as [Stage, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Q5 — Competitors */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                Who are your competitors, and what do you understand that they don't?
              </label>
              <textarea
                className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                rows={3}
                placeholder="Name your competitors and explain your specific insight or advantage over them."
                value={form.competitors}
                onChange={(e) => setForm({ ...form, competitors: e.target.value })}
              />
            </div>

            {/* Q6 — Technical founder */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">
                Can someone on the founding team build the product?
              </label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setForm({ ...form, is_technical: val })}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      form.is_technical === val
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>

            {/* Q7 — Full time */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">
                Are you working on this full-time?
              </label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setForm({ ...form, is_full_time: val })}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      form.is_full_time === val
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Evaluating..." : "Evaluate my idea"}
            </button>

            {/* Loading hint */}
            {submitting && (
              <p className="text-center text-xs text-zinc-400">
                This usually takes 15–20 seconds. Please don't close the page.
              </p>
            )}

          </form>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-8">

            {/* Overall assessment */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Overall Assessment</h2>
              <p className="text-zinc-700 text-sm leading-7">{result.overall_assessment}</p>
            </section>

            {/* Dimension scores */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Dimension Scores</h2>
              <div className="flex flex-col gap-4">
                {(Object.entries(result.dimension_scores) as [string, { score: number; reason: string }][]).map(
                  ([key, val]) => (
                    <div key={key} className="rounded-lg border border-zinc-100 px-4 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-800">
                          {DIMENSION_LABELS[key] ?? key}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">
                            {result.confidence_by_dimension[key as keyof typeof result.confidence_by_dimension]} confidence
                          </span>
                          <span className="text-sm font-semibold text-zinc-900">
                            {val.score}/10
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 leading-5">{val.reason}</p>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Major concerns */}
            {result.major_concerns.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Major Concerns</h2>
                <ul className="flex flex-col gap-2">
                  {result.major_concerns.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-700 leading-6 pl-3 border-l-2 border-red-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Strong signals */}
            {result.strong_signals.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Strong Signals</h2>
                <ul className="flex flex-col gap-2">
                  {result.strong_signals.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-700 leading-6 pl-3 border-l-2 border-green-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Critical questions */}
            {result.critical_questions.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Critical Questions</h2>
                <ul className="flex flex-col gap-2">
                  {result.critical_questions.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-700 leading-6 pl-3 border-l-2 border-zinc-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Missing evidence */}
            {result.missing_evidence.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Missing Evidence</h2>
                <ul className="flex flex-col gap-2">
                  {result.missing_evidence.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-700 leading-6 pl-3 border-l-2 border-yellow-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Next 3 moves */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Next 3 Moves</h2>
              <ol className="flex flex-col gap-3">
                {result.next_3_moves.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-700 leading-6">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </section>

            {/* Hard truth */}
            <section className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                Hard Truth
              </h2>
              <p className="text-sm text-zinc-800 leading-6">{result.hard_truth}</p>
            </section>

            {/* Evaluate again */}
            <button
              onClick={() => { setResult(null); setError(null); }}
              className="w-full rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-400 transition-colors"
            >
              Evaluate another idea
            </button>

          </div>
        )}

      </div>
    </main>
  );
}
