 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
          <span className="yc-meta-kicker">Not YC-aligned and independently built</span>
          <div className="yc-card-topline-actions">
            <button
              type="button"
              className="yc-top-cta"
              onClick={() => router.push("/apply")}
            >
              Evaluate my application
            </button>
          </div>
        </header>

        <section className="yc-landing-copy">
          <h1 className="yc-landing-quote">
            <span className="yc-landing-quote-content" aria-label="The less confident you are, the more serious you have to act.">
              {QUOTE_LINES.map((line, index) => (
                <span key={line} className="yc-landing-quote-line">
                  <span className="yc-landing-quote-line-template" aria-hidden="true">
                    {line}
                  </span>
                  <span className="yc-landing-quote-line-typed">
                    {typedLines[index]}
                    {index === QUOTE_LINES.length - 1 ? (
                      <>
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
          <p>
            This is an independent YC-aligned analysis tool. It is not affiliated
            with or endorsed by Y Combinator, and it does not make admissions
            decisions.
          </p>
        </footer>
      </div>
    </main>
  );
}
