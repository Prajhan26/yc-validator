 "use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const QUOTE_LINES = [
  "The less confident",
  "you are, the more serious",
  "you have to act.",
];

const QUOTE_LENGTH = QUOTE_LINES.reduce((sum, line) => sum + line.length, 0);

function getVisibleLine(line: string, visibleChars: number, consumed: number) {
  const remaining = Math.max(visibleChars - consumed, 0);
  return line.slice(0, Math.min(remaining, line.length));
}

export default function Home() {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    const durationMs = 2800;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      setVisibleChars(Math.round(progress * QUOTE_LENGTH));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const typedLines = useMemo(() => {
    let consumed = 0;
    return QUOTE_LINES.map((line) => {
      const typed = getVisibleLine(line, visibleChars, consumed);
      consumed += line.length;
      return typed;
    });
  }, [visibleChars]);

  return (
    <main className="yc-app-shell">
      <div className="yc-card yc-landing-card">
        <header className="yc-card-topline">
          <span className="yc-meta-kicker">YC-aligned and independently built</span>
          <div className="yc-card-topline-actions">
            <Link href="/apply" className="yc-top-cta">
              Evaluate my application
            </Link>
          </div>
        </header>

        <section className="yc-landing-copy">
          <h1 className="yc-landing-quote">
            <span className="yc-landing-open-quote" aria-hidden="true">
              “
            </span>
            <span className="yc-landing-quote-content" aria-label="The less confident you are, the more serious you have to act.">
              {QUOTE_LINES.map((line, index) => (
                <span key={line} className="yc-landing-quote-line">
                  <span className="yc-landing-quote-line-template" aria-hidden="true">
                    {line}
                    {index === QUOTE_LINES.length - 1 ? "”" : null}
                  </span>
                  <span className="yc-landing-quote-line-typed">
                    {typedLines[index]}
                    {index === QUOTE_LINES.length - 1 ? (
                      <>
                        <span className="yc-landing-inline-close-quote" aria-hidden="true">
                          ”
                        </span>
                        {visibleChars < QUOTE_LENGTH ? (
                          <span className="yc-soft-caret" aria-hidden="true" />
                        ) : null}
                      </>
                    ) : null}
                  </span>
                </span>
              ))}
            </span>
          </h1>
          <p className="yc-landing-subhead">
            We tell you how strong your YC application really is.
          </p>
          <Link href="/apply" className="yc-primary-cta">
            Evaluate my application
          </Link>
          <p className="yc-privacy-line">Your application draft is never retained by us.</p>
        </section>

        <footer className="yc-landing-footer">
          <p>Built on a YC-informed review framework shaped from extensive source material.</p>
        </footer>
      </div>
    </main>
  );
}
