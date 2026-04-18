"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const DESKTOP_QUOTE_LINES = [
  "The less confident",
  "you are, the more serious",
  "you have to act.",
];

const MOBILE_QUOTE_SEGMENTS = [
  [{ text: "The less", bold: false }],
  [{ text: "confident you are,", bold: false }],
  [{ text: "the more serious", bold: false }],
  [{ text: "you have to", bold: false }],
  [{ text: "act.", bold: true }],
] as const;

const MOBILE_QUOTE_LINES = MOBILE_QUOTE_SEGMENTS.map((line) => line.map((segment) => segment.text).join(""));

const DESKTOP_QUOTE_SEGMENTS = [
  [{ text: "“ The less confident", bold: false }],
  [{ text: "you are, the more serious", bold: false }],
  [{ text: "you have to", bold: false }],
  [{ text: "act.", bold: true }, { text: " ”", bold: false }],
] as const;

const DESKTOP_QUOTE_TEXT = DESKTOP_QUOTE_SEGMENTS.map((line) => line.map((segment) => segment.text).join("")).join(" ");
const DESKTOP_QUOTE_CHARACTERS = DESKTOP_QUOTE_SEGMENTS.flatMap((line, lineIndex) =>
  line.flatMap((segment) =>
    [...segment.text].map((character) => ({
      character,
      bold: segment.bold,
      lineIndex,
    })),
  ),
);
const DESKTOP_QUOTE_LENGTH = DESKTOP_QUOTE_CHARACTERS.length;

function getVisibleLine(line: string, visibleChars: number, consumed: number) {
  const remaining = Math.max(visibleChars - consumed, 0);
  return line.slice(0, Math.min(remaining, line.length));
}

export default function Home() {
  const router = useRouter();
  const [quoteLines, setQuoteLines] = useState(DESKTOP_QUOTE_LINES);
  const [visibleChars, setVisibleChars] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncQuoteLines = () => {
      setIsMobile(mediaQuery.matches);
      setQuoteLines(mediaQuery.matches ? MOBILE_QUOTE_LINES : DESKTOP_QUOTE_LINES);
    };

    syncQuoteLines();
    mediaQuery.addEventListener("change", syncQuoteLines);

    return () => mediaQuery.removeEventListener("change", syncQuoteLines);
  }, []);

  const quoteLength = useMemo(
    () => (isMobile ? quoteLines.reduce((sum, line) => sum + line.length, 0) : DESKTOP_QUOTE_LENGTH),
    [isMobile, quoteLines],
  );

  useEffect(() => {
    const durationMs = 3200;
    const startedAt = performance.now();
    setVisibleChars(0);

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setVisibleChars(Math.round(easedProgress * quoteLength));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [quoteLength]);

  const typedLines = useMemo(() => {
    let consumed = 0;
    return MOBILE_QUOTE_SEGMENTS.map((line) =>
      line
        .map((segment) => {
          const visible = getVisibleLine(segment.text, visibleChars, consumed);
          consumed += segment.text.length;
          return { ...segment, visible };
        })
        .filter((segment) => segment.visible.length > 0),
    );
  }, [quoteLines, visibleChars]);

  const desktopVisibleLines = useMemo(() => {
    const visibleCharacters = DESKTOP_QUOTE_CHARACTERS.slice(0, visibleChars);

    return DESKTOP_QUOTE_SEGMENTS.map((_, lineIndex) => {
      const lineCharacters = visibleCharacters.filter((character) => character.lineIndex === lineIndex);

      return lineCharacters.reduce<Array<{ bold: boolean; text: string }>>((segments, character) => {
        const previousSegment = segments.at(-1);

        if (previousSegment && previousSegment.bold === character.bold) {
          previousSegment.text += character.character;
        } else {
          segments.push({ bold: character.bold, text: character.character });
        }

        return segments;
      }, []);
    });
  }, [visibleChars]);

  return (
    <main className="yc-app-shell">
      <div className="yc-card yc-landing-card relative">
        <div
          className="yc-landing-texture absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 mix-blend-multiply"
          aria-hidden="true"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/video/stitch-texture.webm" type="video/webm" />
            <source src="/video/stitch-texture.mp4" type="video/mp4" />
          </video>
        </div>

        <header className="yc-card-topline">
          <span className="yc-meta-kicker">Not YC-aligned and independently built</span>
          <div className="yc-card-topline-actions hidden sm:block">
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
          {isMobile ? (
            <h1 className="yc-landing-quote yc-landing-quote-mobile" aria-label={quoteLines.join(" ")}>
              <span className="yc-landing-quote-content">
                {typedLines.map((line, index) => (
                  <span key={`mobile-line-${index}`} className="yc-landing-quote-line">
                    {index === 0 ? (
                      <span className="yc-landing-open-quote" aria-hidden="true">
                        “{" "}
                      </span>
                    ) : null}
                    {line.map((segment, segmentIndex) => (
                      <span
                        key={`${segment.text}-${segmentIndex}`}
                        className={segment.bold ? "yc-landing-quote-emphasis" : undefined}
                      >
                        {segment.visible}
                      </span>
                    ))}
                    {index === typedLines.length - 1 ? (
                      <span className="yc-landing-close-quote" aria-hidden="true">
                        {" "}”
                      </span>
                    ) : null}
                  </span>
                ))}
              </span>
            </h1>
          ) : (
            <h1 className="yc-landing-quote">
              <span className="yc-landing-quote-content" aria-label={DESKTOP_QUOTE_TEXT.replaceAll("\n", " ")}>
                {desktopVisibleLines.map((line, index) => (
                  <span key={`${line}-${index}`} className="yc-landing-quote-line" aria-hidden="true">
                    {line.map((segment, segmentIndex) => (
                      <span
                        key={`${segment.text}-${segmentIndex}`}
                        className={segment.bold ? "yc-landing-quote-emphasis" : undefined}
                      >
                        {segment.text}
                      </span>
                    ))}
                    {index === desktopVisibleLines.length - 1 && visibleChars < quoteLength ? (
                      <span className="yc-soft-caret" aria-hidden="true" />
                    ) : null}
                  </span>
                ))}
              </span>
            </h1>
          )}
          <p className="yc-landing-subhead">
            We tell you how strong your YC application really is.
          </p>
          <Link href="/apply" className="yc-primary-cta">
            <span>Evaluate my application</span>
            <span className="yc-cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          {!isMobile ? (
            <p className="yc-privacy-line">
              <span className="yc-privacy-lock" aria-hidden="true" />
              <span>
                Your application draft is <span className="yc-privacy-emphasis">never</span> retained by us.
              </span>
            </p>
          ) : null}
        </section>

        <footer className="yc-landing-footer">
          {isMobile ? (
            <p className="yc-privacy-line yc-privacy-line-mobile">
              <span className="yc-privacy-lock" aria-hidden="true" />
              <span>
                Your application draft is <span className="yc-privacy-emphasis">never</span> retained by us.
              </span>
            </p>
          ) : null}
          <p>Built on a YC-informed review framework shaped from extensive source material.</p>
          {!isMobile ? (
            <p>
              This is an independent YC-aligned analysis tool. It is not affiliated
              with or endorsed by Y Combinator, and it does not make admissions
              decisions.
            </p>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
