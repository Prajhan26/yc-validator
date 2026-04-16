"use client";

import { useState, useEffect, useRef } from "react";
import type { EvalOutput } from "../lib/evaluator/schema";

// ── Types ──────────────────────────────────────────────────────────────────────

type Stage = "idea" | "mvp" | "users" | "revenue";
type View  = "landing" | "application" | "results";

interface FormState {
  company_description: string;
  problem_description: string;
  founder_context:     string;
  stage:               Stage | null;
  competitors:         string;
  domain_expertise:    boolean | null;
  // Progress follow-up — conditional on stage
  is_full_time:        boolean | null;  // idea/mvp only
  progress_detail:     string;          // users/revenue only
}

// ── Constants ──────────────────────────────────────────────────────────────────

const HERO_LINE = "The less confident you are, the more serious you have to act.";

const NAV_SECTIONS = ["Company", "Problem", "Founder", "Progress", "Competitors", "Expertise"] as const;

const DIMENSION_LABELS: Record<string, string> = {
  problem_quality:       "Problem Quality",
  founder_fit:           "Founder Fit",
  solution_clarity:      "Solution Clarity",
  market_potential:      "Market Potential",
  traction_and_evidence: "Traction & Evidence",
};

const DIMENSION_ORDER = [
  "problem_quality",
  "founder_fit",
  "solution_clarity",
  "market_potential",
  "traction_and_evidence",
] as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex gap-[3px] mt-2 mb-1">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`h-[5px] flex-1 rounded-[2px] ${i < score ? "" : "bg-[#E5E0D8]"}`}
          style={
            i < score
              ? { background: "linear-gradient(90deg, #C44B18, #E8682A)" }
              : undefined
          }
        />
      ))}
    </div>
  );
}

function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-2 mt-3">
      {([true, false] as const).map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`px-5 py-1.5 text-sm rounded border transition-colors ${
            value === v
              ? "border-[#1A1918] bg-[#1A1918] text-[#FAF8F4]"
              : "border-[#E2DDD6] text-[#6B6560] hover:border-[#1A1918]"
          }`}
        >
          {v ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView]           = useState<View>("landing");
  const [typedHero, setTypedHero] = useState("");
  const [heroComplete, setHeroComplete] = useState(false);

  const [form, setForm] = useState<FormState>({
    company_description: "",
    problem_description: "",
    founder_context:     "",
    stage:               null,
    competitors:         "",
    domain_expertise:    null,
    is_full_time:        null,
    progress_detail:     "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<EvalOutput | null>(null);

  // Refs for left-nav scroll
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Typewriter ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (view !== "landing") return;
    setTypedHero("");
    setHeroComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTypedHero(HERO_LINE.slice(0, i));
      if (i >= HERO_LINE.length) {
        clearInterval(timer);
        setTimeout(() => setHeroComplete(true), 150);
      }
    }, 32);
    return () => clearInterval(timer);
  }, [view]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (form.company_description.trim().length < 20) {
      setError("Please describe what your company does in at least 20 characters.");
      return;
    }
    if (form.problem_description.trim().length < 20) {
      setError("Please describe the problem in at least 20 characters.");
      return;
    }
    if (form.founder_context.trim().length < 10) {
      setError("Please explain why you are the right founder.");
      return;
    }
    if (form.competitors.trim().length < 5) {
      setError("Please describe your competitors.");
      return;
    }
    if (form.stage === null) {
      setError("Please select how far along you are.");
      return;
    }
    const isLateStage = form.stage === "users" || form.stage === "revenue";
    if (isLateStage && form.progress_detail.trim().length < 10) {
      setError("Please describe your progress and time commitment.");
      return;
    }
    if (!isLateStage && form.is_full_time === null) {
      setError("Please select whether you are working full-time.");
      return;
    }
    if (form.domain_expertise === null) {
      setError("Please select whether your team has domain expertise.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    // Build payload — send only the fields relevant to the stage
    // stage and domain_expertise are guaranteed non-null past validation above
    const payload: Record<string, unknown> = {
      company_description: form.company_description,
      problem_description: form.problem_description,
      founder_context:     form.founder_context,
      stage:               form.stage as Stage,
      competitors:         form.competitors,
      domain_expertise:    form.domain_expertise as boolean,
    };
    if (isLateStage) {
      payload.progress_detail = form.progress_detail;
    } else {
      payload.is_full_time = form.is_full_time as boolean;
    }

    try {
      const res = await fetch("/api/evaluate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "We couldn't complete your evaluation. Please try again.");
        return;
      }

      setResult(data as EvalOutput);
      setView("results");
    } catch {
      setError("We couldn't complete your evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToSection(name: string) {
    sectionRefs.current[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Landing ────────────────────────────────────────────────────────────────

  if (view === "landing") {
    return (
      <main className="min-h-screen bg-[#FAF8F4] text-[#1A1918] px-6 py-20 font-sans">
        <div className="mx-auto max-w-xl">

          {/* Wordmark */}
          <p className="text-xs font-medium tracking-widest text-[#6B6560] uppercase mb-16">
            YC Validator
          </p>

          {/* Hero */}
          <h1 className="text-2xl font-semibold leading-snug tracking-tight mb-10 min-h-[4rem]">
            {typedHero}
            {!heroComplete && (
              <span className="cursor-blink ml-[1px] text-[#D4561E]">|</span>
            )}
          </h1>

          {/* Trust lines */}
          <div
            className={`flex flex-col gap-4 transition-opacity duration-700 ${
              heroComplete ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-base text-[#1A1918] leading-relaxed">
              We tell you how strong your YC application really is.
            </p>
            <p className="text-sm text-[#6B6560] leading-relaxed">
              Built on a YC-informed review framework shaped from extensive source material.
            </p>
            <p className="text-sm text-[#6B6560] leading-relaxed">
              Your application draft is never retained by us.
            </p>
            <p className="text-sm text-[#6B6560] leading-relaxed">
              YC-aligned and independently built.
            </p>

            {/* Disclaimer */}
            <p className="text-xs text-[#9B948D] leading-relaxed mt-2 border-t border-[#E2DDD6] pt-4">
              This is an independent YC-aligned analysis tool. It is not affiliated with or
              endorsed by Y Combinator, and it does not make admissions decisions.
            </p>

            {/* CTA */}
            <button
              onClick={() => setView("application")}
              className="mt-4 self-start text-sm font-medium text-[#1A1918] border border-[#1A1918] px-6 py-2.5 hover:bg-[#1A1918] hover:text-[#FAF8F4] transition-colors"
            >
              Evaluate my application →
            </button>
          </div>

        </div>
      </main>
    );
  }

  // ── Application ────────────────────────────────────────────────────────────

  if (view === "application") {
    const isLateStage  = form.stage === "users" || form.stage === "revenue";
    const stageSelected = form.stage !== null;

    return (
      <main className="min-h-screen bg-[#FAF8F4] text-[#1A1918] px-6 py-12 font-sans">
        <div className="mx-auto max-w-3xl">

          {/* Back */}
          <button
            onClick={() => setView("landing")}
            className="no-print text-sm text-[#6B6560] hover:text-[#1A1918] transition-colors mb-8 flex items-center gap-1"
          >
            ‹ Back
          </button>

          <div className="flex gap-16">

            {/* Left nav — sticky */}
            <nav className="no-print hidden md:flex flex-col gap-1 w-28 flex-shrink-0 sticky top-12 self-start pt-14">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => scrollToSection(s)}
                  className="text-xs text-left text-[#9B948D] hover:text-[#D4561E] transition-colors py-1"
                >
                  {s}
                </button>
              ))}
            </nav>

            {/* Form */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight mb-1">
                Your Application
              </h1>
              <p className="text-sm text-[#6B6560] mb-10">
                Write this the way you would want a YC reviewer to read it.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-10">

                {/* Company */}
                <div
                  ref={(el) => { sectionRefs.current["Company"] = el; }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-xs font-medium tracking-widest text-[#9B948D] uppercase">
                    Company
                  </p>
                  <label className="text-sm font-medium text-[#1A1918]">
                    Describe what your company does or is going to make.
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-transparent border border-[#E2DDD6] px-4 py-3 text-sm text-[#1A1918] placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#1A1918] resize-none"
                    placeholder="Describe what you are building in one or two clear sentences."
                    value={form.company_description}
                    onChange={(e) => setForm({ ...form, company_description: e.target.value })}
                  />
                </div>

                {/* Problem */}
                <div
                  ref={(el) => { sectionRefs.current["Problem"] = el; }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-xs font-medium tracking-widest text-[#9B948D] uppercase">
                    Problem
                  </p>
                  <label className="text-sm font-medium text-[#1A1918]">
                    What problem are you solving, and who has it?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-transparent border border-[#E2DDD6] px-4 py-3 text-sm text-[#1A1918] placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#1A1918] resize-none"
                    placeholder="Be specific about who has the problem, how often it shows up, and why it matters."
                    value={form.problem_description}
                    onChange={(e) => setForm({ ...form, problem_description: e.target.value })}
                  />
                </div>

                {/* Founder */}
                <div
                  ref={(el) => { sectionRefs.current["Founder"] = el; }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-xs font-medium tracking-widest text-[#9B948D] uppercase">
                    Founder
                  </p>
                  <label className="text-sm font-medium text-[#1A1918]">
                    Why are you the right founder to build this?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-transparent border border-[#E2DDD6] px-4 py-3 text-sm text-[#1A1918] placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#1A1918] resize-none"
                    placeholder="Explain your edge: experience, insight, technical ability, or why you understand this problem better than others."
                    value={form.founder_context}
                    onChange={(e) => setForm({ ...form, founder_context: e.target.value })}
                  />
                </div>

                {/* Progress */}
                <div
                  ref={(el) => { sectionRefs.current["Progress"] = el; }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-xs font-medium tracking-widest text-[#9B948D] uppercase">
                    Progress
                  </p>
                  <label className="text-sm font-medium text-[#1A1918]">
                    How far along are you?
                  </label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {(["idea", "mvp", "users", "revenue"] as Stage[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, stage: s })}
                        className={`px-4 py-1.5 text-sm capitalize border transition-colors ${
                          form.stage === s
                            ? "border-[#1A1918] bg-[#1A1918] text-[#FAF8F4]"
                            : "border-[#E2DDD6] text-[#6B6560] hover:border-[#1A1918]"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Conditional follow-up — only shown once a stage is selected */}
                  {stageSelected && <div className="mt-4">
                    {isLateStage ? (
                      <>
                        <label className="text-sm font-medium text-[#1A1918]">
                          How long has each of you been working on this? How much of that has been full-time? Please explain.
                        </label>
                        <textarea
                          rows={3}
                          className="mt-2 w-full bg-transparent border border-[#E2DDD6] px-4 py-3 text-sm text-[#1A1918] placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#1A1918] resize-none"
                          placeholder="State what exists today: prototype, product, users, revenue, or anything already in motion."
                          value={form.progress_detail}
                          onChange={(e) => setForm({ ...form, progress_detail: e.target.value })}
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-sm font-medium text-[#1A1918]">
                          Are you working on this full-time?
                        </label>
                        <YesNo
                          value={form.is_full_time}
                          onChange={(v) => setForm({ ...form, is_full_time: v })}
                        />
                      </>
                    )}
                  </div>}
                </div>

                {/* Competitors */}
                <div
                  ref={(el) => { sectionRefs.current["Competitors"] = el; }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-xs font-medium tracking-widest text-[#9B948D] uppercase">
                    Competitors
                  </p>
                  <label className="text-sm font-medium text-[#1A1918]">
                    Who are your competitors, and what do you understand that they don&apos;t?
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-transparent border border-[#E2DDD6] px-4 py-3 text-sm text-[#1A1918] placeholder:text-[#B5AFA8] focus:outline-none focus:border-[#1A1918] resize-none"
                    placeholder="Name the real alternatives and explain what you see differently."
                    value={form.competitors}
                    onChange={(e) => setForm({ ...form, competitors: e.target.value })}
                  />
                </div>

                {/* Expertise */}
                <div
                  ref={(el) => { sectionRefs.current["Expertise"] = el; }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-xs font-medium tracking-widest text-[#9B948D] uppercase">
                    Expertise
                  </p>
                  <label className="text-sm font-medium text-[#1A1918]">
                    Does your founding team have domain expertise in this area?
                  </label>
                  <YesNo
                    value={form.domain_expertise}
                    onChange={(v) => setForm({ ...form, domain_expertise: v })}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-700">{error}</p>
                )}

                {/* Submit */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="self-start text-sm font-medium text-[#FAF8F4] bg-[#1A1918] border border-[#1A1918] px-8 py-2.5 hover:bg-[#3A3734] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Evaluating your application..." : "Submit for Review"}
                  </button>
                  {submitting && (
                    <p className="text-xs text-[#9B948D]">
                      This usually takes 15–20 seconds. Please don&apos;t close the page.
                    </p>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────

  if (view === "results" && result) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] text-[#1A1918] px-6 py-12 font-sans">
        <div className="mx-auto max-w-2xl">

          {/* Back */}
          <button
            onClick={() => setView("application")}
            className="no-print text-sm text-[#6B6560] hover:text-[#1A1918] transition-colors mb-8 flex items-center gap-1"
          >
            ‹ Back to Application
          </button>

          {/* Header */}
          <div className="flex items-baseline justify-between mb-1">
            <h1 className="text-2xl font-semibold tracking-tight">Application Notes</h1>
            <span className="text-xs text-[#9B948D] tracking-widest uppercase">Review Copy</span>
          </div>
          <div className="border-t border-[#E2DDD6] mb-10" />

          <div className="flex flex-col gap-10">

            {/* Overall Assessment */}
            <section>
              <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-3">
                Overall Assessment
              </h2>
              <p className="text-sm text-[#1A1918] leading-7">{result.overall_assessment}</p>
            </section>

            {/* Dimension Scores */}
            <section>
              <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-5">
                Dimension Score
              </h2>
              <div className="flex flex-col gap-6">
                {DIMENSION_ORDER.map((key) => {
                  const dim = result.dimension_scores[key];
                  const conf = result.confidence_by_dimension[key];
                  return (
                    <div key={key}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-[#1A1918]">
                          {DIMENSION_LABELS[key]}
                        </span>
                        <span className="text-sm font-semibold text-[#1A1918]">
                          {dim.score}/10
                        </span>
                      </div>
                      <ScoreBar score={dim.score} />
                      <p className="text-xs text-[#4A4542] leading-5 mt-1">{dim.reason}</p>
                      <p className="text-xs text-[#9B948D] mt-0.5">{conf} confidence</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Major Concerns */}
            {result.major_concerns.length > 0 && (
              <section>
                <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-3">
                  Major Concerns
                </h2>
                <div className="flex flex-col gap-3">
                  {result.major_concerns.map((item, i) => (
                    <p key={i} className="text-sm text-[#1A1918] leading-6 border-l-2 border-[#D4561E] pl-4">
                      {item}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Strong Signals */}
            {result.strong_signals.length > 0 && (
              <section>
                <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-3">
                  Strong Signals
                </h2>
                <div className="flex flex-col gap-3">
                  {result.strong_signals.map((item, i) => (
                    <p key={i} className="text-sm text-[#1A1918] leading-6 border-l-2 border-[#A0B89A] pl-4">
                      {item}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Questions a serious reviewer would ask */}
            {result.critical_questions.length > 0 && (
              <section>
                <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-3">
                  Questions a Serious Reviewer Would Ask
                </h2>
                <div className="flex flex-col gap-2">
                  {result.critical_questions.map((item, i) => (
                    <p key={i} className="text-sm text-[#1A1918] leading-6">{item}</p>
                  ))}
                </div>
              </section>
            )}

            {/* What you still need to prove */}
            {result.missing_evidence.length > 0 && (
              <section>
                <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-3">
                  What You Still Need to Prove
                </h2>
                <div className="flex flex-col gap-2">
                  {result.missing_evidence.map((item, i) => (
                    <p key={i} className="text-sm text-[#1A1918] leading-6">{item}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Next 3 Moves */}
            <section>
              <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-4">
                Next 3 Moves
              </h2>
              <div className="flex flex-col gap-4">
                {result.next_3_moves.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex-shrink-0 text-sm font-semibold text-[#D4561E] w-4">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-[#1A1918] leading-6">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Hard Truth */}
            <section className="border-l-2 border-[#D4561E] pl-5 py-1">
              <h2 className="text-xs font-medium tracking-widest text-[#9B948D] uppercase mb-3">
                Hard Truth
              </h2>
              <p
                className="text-base leading-7 text-[#1A1918]"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {result.hard_truth}
              </p>
            </section>

            {/* Bottom CTAs */}
            <div className="no-print border-t border-[#E2DDD6] pt-6 flex flex-col-reverse md:flex-row md:justify-between gap-3">
              <button
                onClick={() => { setResult(null); setError(null); setView("application"); }}
                className="text-sm text-[#6B6560] underline underline-offset-2 hover:text-[#1A1918] transition-colors text-left"
              >
                Evaluate Another Application
              </button>
              <button
                onClick={() => window.print()}
                className="text-sm text-[#1A1918] underline underline-offset-2 hover:text-[#D4561E] transition-colors text-left md:text-right"
              >
                Download Review Copy
              </button>
            </div>

          </div>
        </div>
      </main>
    );
  }

  return null;
}
