"use client";

import Link from "next/link";

const SCORES = [
  {
    label: "Problem Quality",
    score: 8,
    note: "The problem is felt sharply by a defined user group and the pain reads as recurring rather than optional.",
    confidence: "Confidence: grounded in the clarity of the stated problem.",
  },
  {
    label: "Founder Fit",
    score: 7,
    note: "There is believable founder motivation here, but the application still needs one stronger proof point of unusual insight or earned advantage.",
    confidence: "Confidence: moderate based on the current narrative.",
  },
  {
    label: "Solution Clarity",
    score: 8,
    note: "The proposed product direction is understandable and concrete, which makes the application easier to trust.",
    confidence: "Confidence: high because the solution statement is legible.",
  },
  {
    label: "Market Potential",
    score: 6,
    note: "The opportunity feels real, but the application still needs a stronger argument for why this can become large enough to matter.",
    confidence: "Confidence: moderate due to missing market proof.",
  },
  {
    label: "Traction Evidence",
    score: 5,
    note: "Signals are present, but they do not yet read as decisive evidence that the market is already pulling this forward.",
    confidence: "Confidence: lower because the evidence base is still thin.",
  },
] as const;

const CONCERNS = [
  "The application implies a meaningful problem, but it does not yet show enough evidence that the urgency is structurally unavoidable rather than merely plausible.",
  "There is a significant gap between a coherent idea and repeated market pull; the current version overstates that bridge.",
] as const;

const SIGNALS = [
  "The writing is more focused than average, which already puts the company ahead of many weak applications.",
  "The core user and the pain pattern are legible enough that the reader can imagine the first wedge without excessive inference.",
] as const;

const QUESTIONS = [
  "How do you know this problem is painful enough that users will switch now, rather than later?",
  "What have you learned from real users that changed the product or the positioning materially?",
  "Why are you uniquely positioned to see this market correctly before everyone else does?",
] as const;

const PROOF_GAPS = [
  "Validation of user pain substantial enough to convert interest into action.",
  "Signal that the market is pulling toward this, not merely agreeing with the story.",
  "Clear evidence of asymmetry between the founding team and plausible fast followers.",
] as const;

const MOVES = [
  "Talk to ten users who recently felt this pain and document what they already do to solve it.",
  "Tighten the founder-fit section so it proves earned insight instead of only motivation.",
  "Replace vague market potential language with one specific argument for why this expands into a large outcome.",
] as const;

export default function ReviewPage() {
  const handleDownload = () => {
    window.print();
  };

  return (
    <main className="yc-app-shell">
      <div className="yc-review-wrapper">
        <Link href="/apply" className="yc-back-link">
          ‹ Back to Application
        </Link>

        <article className="yc-card yc-review-sheet">
          <header className="yc-review-head">
            <span>Review Copy</span>
            <h2>Application Notes</h2>
          </header>

          <section className="yc-review-section">
            <h3>Overall Assessment</h3>
            <p className="yc-review-paragraph">
              The application presents a compelling theme and a credible direction,
              but it still needs stronger proof that the underlying demand is real,
              repeated, and forceful enough to support venture-scale outcomes.
            </p>
          </section>

          <section className="yc-review-section">
            <h3>Dimension Score</h3>
            {SCORES.map((item) => (
              <div key={item.label} className="yc-score-row">
                <div className="yc-score-row-top">
                  <h4>{item.label}</h4>
                  <span>{item.score}/10</span>
                </div>
                <div className="yc-score-bar" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, index) => (
                    <span key={index} className={index < item.score ? "is-filled" : ""} />
                  ))}
                </div>
                <p className="yc-score-note">{item.note}</p>
                <p className="yc-score-confidence">{item.confidence}</p>
              </div>
            ))}
          </section>

          <section className="yc-review-section">
            <h3>Major Concerns</h3>
            {CONCERNS.map((item) => (
              <p key={item} className="yc-review-paragraph">
                {item}
              </p>
            ))}
          </section>

          <section className="yc-review-section">
            <h3>Strong Signals</h3>
            {SIGNALS.map((item) => (
              <p key={item} className="yc-review-paragraph">
                {item}
              </p>
            ))}
          </section>

          <section className="yc-review-section">
            <h3>Questions a serious reviewer would ask</h3>
            <div className="yc-question-stack">
              {QUESTIONS.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>

          <section className="yc-review-section">
            <h3>What you still need to prove</h3>
            <div className="yc-evidence-stack">
              {PROOF_GAPS.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>

          <section className="yc-review-section">
            <h3>Next 3 moves</h3>
            <div className="yc-moves-stack">
              {MOVES.map((item, index) => (
                <div key={item} className="yc-move-item">
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="yc-hard-truth">
            <span>Hard Truth</span>
            <p>
              This reads like a promising company draft, not yet an undeniable
              company.
            </p>
          </section>

          <div className="yc-review-actions">
            <Link href="/apply">Evaluate Another Application</Link>
            <button type="button" onClick={handleDownload}>
              Download Review Copy
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}
