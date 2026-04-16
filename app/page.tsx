"use client";

import { useEffect, useMemo, useState } from "react";

type View = "landing" | "application" | "results";
type Section = "company" | "problem" | "founder" | "progress" | "competitors" | "expertise";
type Stage = "idea" | "mvp" | "users" | "revenue" | "";
type Binary = "yes" | "no" | "";

type EvalResponse = {
  overall_assessment: string;
  dimension_scores: Record<
    "problem_quality" | "founder_fit" | "solution_clarity" | "market_potential" | "traction_and_evidence",
    { score: number; reason: string }
  >;
  confidence_by_dimension: Record<
    "problem_quality" | "founder_fit" | "solution_clarity" | "market_potential" | "traction_and_evidence",
    "low" | "medium" | "high"
  >;
  major_concerns: string[];
  strong_signals: string[];
  critical_questions: string[];
  missing_evidence: string[];
  next_3_moves: string[];
  hard_truth: string;
};

const landingQuote = "The less confident you are, the more serious you have to act.";

const navItems: { id: Section; label: string }[] = [
  { id: "company", label: "Company" },
  { id: "problem", label: "Problem" },
  { id: "founder", label: "Founder" },
  { id: "progress", label: "Progress" },
  { id: "competitors", label: "Competitors" },
  { id: "expertise", label: "Expertise" },
];

const dimensionLabels: Record<keyof EvalResponse["dimension_scores"], string> = {
  problem_quality: "Problem Quality",
  founder_fit: "Founder Fit",
  solution_clarity: "Solution Clarity",
  market_potential: "Market Potential",
  traction_and_evidence: "Traction Evidence",
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function makeStartupDescription(input: {
  companyDescription: string;
  problemDescription: string;
  founderContext: string;
  competitors: string;
  stage: Stage;
  domainExpertise: Binary;
  teamTimeContext: string;
  isFullTime: Binary;
}) {
  const lines = [
    `Company: ${input.companyDescription}`,
    `Problem: ${input.problemDescription}`,
    `Founder context: ${input.founderContext}`,
    `Competitors: ${input.competitors}`,
    `Domain expertise: ${input.domainExpertise === "yes" ? "Yes" : input.domainExpertise === "no" ? "No" : "Unknown"}`,
    `Stage: ${input.stage || "unspecified"}`,
  ];

  if (input.stage === "users" || input.stage === "revenue") {
    lines.push(`Team time context: ${input.teamTimeContext}`);
  }

  if (input.stage === "idea" || input.stage === "mvp") {
    lines.push(`Working full-time: ${input.isFullTime === "yes" ? "Yes" : input.isFullTime === "no" ? "No" : "Unknown"}`);
  }

  return lines.join("\n");
}

function inferFullTimeFromContext(teamTimeContext: string) {
  return /(full[\s-]?time|100%|all of us full time|working full time)/i.test(teamTimeContext);
}

function buildReviewCopy(result: EvalResponse) {
  const dimensions = Object.entries(result.dimension_scores)
    .map(([key, value]) => {
      const confidence = titleCase(result.confidence_by_dimension[key as keyof EvalResponse["confidence_by_dimension"]]);
      return `${dimensionLabels[key as keyof EvalResponse["dimension_scores"]]} — ${value.score}/10\n${value.reason}\n${confidence}`;
    })
    .join("\n\n");

  const sections = [
    `Application Notes`,
    ``,
    `Overall Assessment`,
    result.overall_assessment,
    ``,
    `Dimension Score`,
    dimensions,
    ``,
    `Major Concerns`,
    result.major_concerns.join("\n\n"),
    ``,
    `Strong Signals`,
    result.strong_signals.join("\n\n"),
    ``,
    `Questions a Serious Reviewer Would Ask`,
    result.critical_questions.join("\n"),
    ``,
    `What You Still Need to Prove`,
    result.missing_evidence.join("\n"),
    ``,
    `Next 3 Moves`,
    result.next_3_moves.map((move, index) => `${index + 1}. ${move}`).join("\n\n"),
    ``,
    `Hard Truth`,
    result.hard_truth,
  ];

  return sections.join("\n");
}

function ScoreRow({
  label,
  score,
  reason,
  confidence,
}: {
  label: string;
  score: number;
  reason: string;
  confidence: "low" | "medium" | "high";
}) {
  return (
    <div className="yc-score-row">
      <div className="yc-score-row-top">
        <h4>{label}</h4>
        <span>{score}/10</span>
      </div>
      <div className="yc-score-bar" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={`${label}-${index}`}
            className={index < score ? "is-filled" : undefined}
          />
        ))}
      </div>
      <p className="yc-score-note">{reason}</p>
      <p className="yc-score-confidence">{titleCase(confidence)}</p>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [typedQuote, setTypedQuote] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("company");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EvalResponse | null>(null);
  const [form, setForm] = useState({
    companyDescription: "",
    problemDescription: "",
    founderContext: "",
    stage: "" as Stage,
    teamTimeContext: "",
    isFullTime: "" as Binary,
    competitors: "",
    domainExpertise: "" as Binary,
  });

  useEffect(() => {
    if (view !== "landing") return;

    let frame = 0;
    const totalFrames = 70;
    const timer = window.setInterval(() => {
      frame += 1;
      const nextLength = Math.round((frame / totalFrames) * landingQuote.length);
      setTypedQuote(landingQuote.slice(0, nextLength));
      if (frame >= totalFrames) {
        window.clearInterval(timer);
      }
    }, 40);

    return () => window.clearInterval(timer);
  }, [view]);

  const startupDescription = useMemo(
    () =>
      makeStartupDescription({
        companyDescription: form.companyDescription,
        problemDescription: form.problemDescription,
        founderContext: form.founderContext,
        competitors: form.competitors,
        stage: form.stage,
        domainExpertise: form.domainExpertise,
        teamTimeContext: form.teamTimeContext,
        isFullTime: form.isFullTime,
      }),
    [form]
  );

  const canSubmit =
    form.companyDescription.trim() &&
    form.problemDescription.trim() &&
    form.founderContext.trim() &&
    form.stage &&
    form.competitors.trim() &&
    form.domainExpertise &&
    ((form.stage === "idea" || form.stage === "mvp") ? form.isFullTime : form.teamTimeContext.trim());

  async function handleReviewSubmit() {
    if (!canSubmit) {
      setError("Please complete every section before submitting for review.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup_description: startupDescription,
          stage: form.stage,
          is_technical: form.domainExpertise === "yes",
          is_full_time:
            form.stage === "idea" || form.stage === "mvp"
              ? form.isFullTime === "yes"
              : inferFullTimeFromContext(form.teamTimeContext),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "We couldn't complete your evaluation. Please try again.");
      }

      setResult(payload);
      setView("results");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We couldn't complete your evaluation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadReview() {
    if (!result) return;

    const blob = new Blob([buildReviewCopy(result)], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "application-notes.txt";
    link.click();
    URL.revokeObjectURL(href);
  }

  function handleReset() {
    setForm({
      companyDescription: "",
      problemDescription: "",
      founderContext: "",
      stage: "",
      teamTimeContext: "",
      isFullTime: "",
      competitors: "",
      domainExpertise: "",
    });
    setResult(null);
    setError("");
    setActiveSection("company");
    setView("application");
  }

  return (
    <main className="yc-app-shell">
      {view === "landing" && (
        <section className="yc-card yc-landing-card">
          <div className="yc-card-topline">
            <span className="yc-meta-kicker">YC-aligned and independently built</span>
            <button
              type="button"
              className="yc-primary-cta yc-primary-cta--small"
              onClick={() => setView("application")}
            >
              Evaluate My Application
            </button>
          </div>

          <div className="yc-landing-copy">
            <h1 className="yc-landing-quote">
              “{typedQuote}
              {typedQuote.length < landingQuote.length ? <span className="yc-soft-caret" /> : null}”
            </h1>
            <p className="yc-landing-subhead">We tell you how strong your YC application really is.</p>
            <button
              type="button"
              className="yc-primary-cta"
              onClick={() => setView("application")}
            >
              Evaluate My Application
            </button>
            <p className="yc-privacy-line">Your application draft is never retained by us.</p>
          </div>

          <div className="yc-landing-footer">
            <p>
              Built on a YC-informed review framework shaped from extensive source material.
              We analyze for clarity, growth signals, and technical depth through the lens of
              successful historical outcomes.
            </p>
          </div>
        </section>
      )}

      {view === "application" && (
        <section className="yc-card yc-application-card">
          <button type="button" className="yc-back-link" onClick={() => setView("landing")}>
            ‹ Back
          </button>

          <div className="yc-page-head">
            <h2>Your Application</h2>
            <p>WRITE THIS THE WAY YOU WOULD WANT A YC REVIEWER TO READ IT.</p>
          </div>

          <div className="yc-application-layout">
            <aside className="yc-left-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`yc-left-nav-item ${activeSection === item.id ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  {item.label}
                </button>
              ))}
            </aside>

            <div className="yc-form-column">
              <section id="company" className="yc-form-section" onFocus={() => setActiveSection("company")}>
                <h3>Describe what your company does or is going to make.</h3>
                <textarea
                  value={form.companyDescription}
                  onChange={(event) => setForm((current) => ({ ...current, companyDescription: event.target.value }))}
                  placeholder="We are building..."
                />
              </section>

              <section id="problem" className="yc-form-section" onFocus={() => setActiveSection("problem")}>
                <h3>What problem are you solving, and who has it?</h3>
                <textarea
                  value={form.problemDescription}
                  onChange={(event) => setForm((current) => ({ ...current, problemDescription: event.target.value }))}
                  placeholder="Be specific about who has the problem and why it matters."
                />
              </section>

              <section id="founder" className="yc-form-section" onFocus={() => setActiveSection("founder")}>
                <h3>Why are you the right founder to build this?</h3>
                <textarea
                  value={form.founderContext}
                  onChange={(event) => setForm((current) => ({ ...current, founderContext: event.target.value }))}
                  placeholder="Explain your edge, experience, or insight."
                />
              </section>

              <section id="progress" className="yc-form-section" onFocus={() => setActiveSection("progress")}>
                <div className="yc-progress-row">
                  <div>
                    <h3>How far along are you?</h3>
                    <p>Select the stage that best represents your current momentum.</p>
                  </div>
                  <select
                    value={form.stage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stage: event.target.value as Stage,
                        teamTimeContext:
                          event.target.value === "users" || event.target.value === "revenue"
                            ? current.teamTimeContext
                            : "",
                        isFullTime:
                          event.target.value === "idea" || event.target.value === "mvp"
                            ? current.isFullTime
                            : "",
                      }))
                    }
                  >
                    <option value="">Current stage</option>
                    <option value="idea">Idea</option>
                    <option value="mvp">MVP</option>
                    <option value="users">Users</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>

                {(form.stage === "users" || form.stage === "revenue") && (
                  <div className="yc-inline-followup">
                    <h4>How long has each of you been working on this? How much of that has been full-time? Please explain.</h4>
                    <textarea
                      value={form.teamTimeContext}
                      onChange={(event) => setForm((current) => ({ ...current, teamTimeContext: event.target.value }))}
                      placeholder="Give the real timeline and how much of it has been full-time."
                    />
                  </div>
                )}

                {(form.stage === "idea" || form.stage === "mvp") && (
                  <div className="yc-inline-followup">
                    <h4>Are you working on this full-time?</h4>
                    <div className="yc-binary-group">
                      {(["yes", "no"] as const).map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          className={form.isFullTime === choice ? "is-selected" : ""}
                          onClick={() => setForm((current) => ({ ...current, isFullTime: choice }))}
                        >
                          {titleCase(choice)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section id="competitors" className="yc-form-section" onFocus={() => setActiveSection("competitors")}>
                <h3>Who are your competitors, and what do you understand that they don&apos;t?</h3>
                <textarea
                  value={form.competitors}
                  onChange={(event) => setForm((current) => ({ ...current, competitors: event.target.value }))}
                  placeholder="Name the real alternatives and explain what you see differently."
                />
              </section>

              <section id="expertise" className="yc-form-section" onFocus={() => setActiveSection("expertise")}>
                <div className="yc-progress-row">
                  <div>
                    <h3>Does your founding team have domain expertise in this area?</h3>
                    <p>Consider formal education, professional history, or deep obsession.</p>
                  </div>
                  <div className="yc-binary-group">
                    {(["yes", "no"] as const).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        className={form.domainExpertise === choice ? "is-selected" : ""}
                        onClick={() => setForm((current) => ({ ...current, domainExpertise: choice }))}
                      >
                        {titleCase(choice)}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <div className="yc-application-actions">
                {error ? <p className="yc-error-message">{error}</p> : null}
                <button
                  type="button"
                  className="yc-primary-cta"
                  disabled={loading}
                  onClick={handleReviewSubmit}
                >
                  {loading ? "Evaluating your application..." : "Submit for Review"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === "results" && result && (
        <section className="yc-review-wrapper">
          <button type="button" className="yc-back-link" onClick={() => setView("application")}>
            ‹ Back to Application
          </button>

          <article className="yc-review-sheet">
            <div className="yc-review-head">
              <span>Review Copy</span>
              <h2>Application Notes</h2>
            </div>

            <section className="yc-review-section">
              <h3>Overall Assessment</h3>
              <p className="yc-review-paragraph">{result.overall_assessment}</p>
            </section>

            <section className="yc-review-section">
              <h3>Dimension Score</h3>
              {(
                Object.entries(result.dimension_scores) as Array<
                  [keyof EvalResponse["dimension_scores"], EvalResponse["dimension_scores"][keyof EvalResponse["dimension_scores"]]]
                >
              ).map(([key, value]) => (
                <ScoreRow
                  key={key}
                  label={dimensionLabels[key]}
                  score={value.score}
                  reason={value.reason}
                  confidence={result.confidence_by_dimension[key]}
                />
              ))}
            </section>

            <section className="yc-review-section">
              <h3>Major Concerns</h3>
              {result.major_concerns.map((concern) => (
                <p key={concern} className="yc-review-paragraph">
                  {concern}
                </p>
              ))}
            </section>

            <section className="yc-review-section">
              <h3>Strong Signals</h3>
              {result.strong_signals.map((signal) => (
                <p key={signal} className="yc-review-paragraph">
                  {signal}
                </p>
              ))}
            </section>

            <section className="yc-review-section">
              <h3>Questions a Serious Reviewer Would Ask</h3>
              <div className="yc-question-stack">
                {result.critical_questions.map((question) => (
                  <p key={question}>{question}</p>
                ))}
              </div>
            </section>

            <section className="yc-review-section">
              <h3>What You Still Need to Prove</h3>
              <div className="yc-evidence-stack">
                {result.missing_evidence.map((evidence) => (
                  <p key={evidence}>{evidence}</p>
                ))}
              </div>
            </section>

            <section className="yc-review-section">
              <h3>Next 3 Moves</h3>
              <div className="yc-moves-stack">
                {result.next_3_moves.map((move, index) => (
                  <div key={move} className="yc-move-item">
                    <span>{index + 1}</span>
                    <p>{move}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="yc-hard-truth">
              <span>Hard Truth</span>
              <p>{result.hard_truth}</p>
            </section>
          </article>

          <div className="yc-review-actions">
            <button type="button" onClick={handleReset}>
              Evaluate Another Application
            </button>
            <button type="button" onClick={handleDownloadReview}>
              Download Review Copy
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
