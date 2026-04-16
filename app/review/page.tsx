"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { EvalOutput } from "../../lib/evaluator/schema";

const SCORE_LABELS: Array<{
  key: keyof EvalOutput["dimension_scores"];
  label: string;
}> = [
  { key: "problem_quality", label: "Problem Quality" },
  { key: "founder_fit", label: "Founder Fit" },
  { key: "solution_clarity", label: "Solution Clarity" },
  { key: "market_potential", label: "Market Potential" },
  { key: "traction_and_evidence", label: "Traction Evidence" },
];

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [review, setReview] = useState<EvalOutput | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const requestedToken = searchParams.get("rid");
    const storedToken = sessionStorage.getItem("yc-validator:last-review-token");
    const raw = sessionStorage.getItem("yc-validator:last-review");
    if (!requestedToken || !storedToken || requestedToken !== storedToken || !raw) {
      router.replace("/apply");
      return;
    }

    try {
      setReview(JSON.parse(raw) as EvalOutput);
      setIsReady(true);
    } catch {
      router.replace("/apply");
    }
  }, [router, searchParams]);

  const handleDownload = () => {
    window.print();
  };

  const scoreRows = useMemo(() => {
    if (!review) return [];

    return SCORE_LABELS.map(({ key, label }) => ({
      label,
      score: review.dimension_scores[key].score,
      note: review.dimension_scores[key].reason,
      confidence: `Confidence: ${review.confidence_by_dimension[key]}.`,
    }));
  }, [review]);

  if (!isReady || !review) {
    return null;
  }

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
            <p className="yc-review-paragraph">{review.overall_assessment}</p>
          </section>

          <section className="yc-review-section">
            <h3>Dimension Score</h3>
            {scoreRows.map((item) => (
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
            {review.major_concerns.map((item) => (
              <p key={item} className="yc-review-paragraph">
                {item}
              </p>
            ))}
          </section>

          <section className="yc-review-section">
            <h3>Strong Signals</h3>
            {review.strong_signals.map((item) => (
              <p key={item} className="yc-review-paragraph">
                {item}
              </p>
            ))}
          </section>

          <section className="yc-review-section">
            <h3>Questions a serious reviewer would ask</h3>
            <div className="yc-question-stack">
              {review.critical_questions.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>

          <section className="yc-review-section">
            <h3>What you still need to prove</h3>
            <div className="yc-evidence-stack">
              {review.missing_evidence.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>

          <section className="yc-review-section">
            <h3>Next 3 moves</h3>
            <div className="yc-moves-stack">
              {review.next_3_moves.map((item, index) => (
                <div key={item} className="yc-move-item">
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="yc-hard-truth">
            <span>Hard Truth</span>
            <p>{review.hard_truth}</p>
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
