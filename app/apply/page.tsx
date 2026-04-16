"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EvalInput, EvalOutput } from "../../lib/evaluator/schema";

const SECTION_IDS = [
  "company",
  "problem",
  "founder",
  "progress",
  "competitors",
  "expertise",
] as const;

type Stage = "" | "Idea" | "MVP" | "Users" | "Revenue";
type Binary = "" | "Yes" | "No";
type SectionId = (typeof SECTION_IDS)[number];

export default function ApplyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>("company");
  const [company, setCompany] = useState("");
  const [problem, setProblem] = useState("");
  const [founder, setFounder] = useState("");
  const [stage, setStage] = useState<Stage>("");
  const [fullTime, setFullTime] = useState<Binary>("");
  const [workHistory, setWorkHistory] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [expertise, setExpertise] = useState<Binary>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showWorkHistory = stage === "Users" || stage === "Revenue";
  const showFullTime = stage === "Idea" || stage === "MVP";

  useEffect(() => {
    sessionStorage.removeItem("yc-validator:last-input");
    sessionStorage.removeItem("yc-validator:last-review");
    sessionStorage.removeItem("yc-validator:last-review-token");
  }, []);

  const startupDescription = [
    `Company: ${company}`,
    `Problem: ${problem}`,
    `Founder: ${founder}`,
    competitors ? `Competitors: ${competitors}` : "",
    showWorkHistory && workHistory ? `Work history: ${workHistory}` : "",
    showFullTime && fullTime ? `Working full-time: ${fullTime}` : "",
    expertise ? `Domain expertise: ${expertise}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const mapStage = (value: Stage): EvalInput["stage"] => {
    switch (value) {
      case "Idea":
        return "idea";
      case "MVP":
        return "mvp";
      case "Users":
        return "users";
      case "Revenue":
        return "revenue";
      default:
        return "idea";
    }
  };

  const inferTechnicalFounder = () => {
    const founderText = founder.toLowerCase();
    return (
      /engineer|developer|built|coding|technical|programmer|software|full-stack|frontend|backend/.test(
        founderText,
      ) || expertise === "Yes"
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!company || !problem || !founder || !stage || !competitors || !expertise) {
      setErrorMessage("Please complete all sections before submitting for review.");
      return;
    }

    if (showFullTime && !fullTime) {
      setErrorMessage("Please tell us whether you are working on this full-time.");
      return;
    }

    if (showWorkHistory && !workHistory) {
      setErrorMessage("Please explain how long you have been working on this.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const payload: EvalInput = {
        startup_description: startupDescription,
        stage: mapStage(stage),
        is_technical: inferTechnicalFounder(),
        is_full_time: showFullTime ? fullTime === "Yes" : true,
      };

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as EvalOutput | { error?: string };

      if (!response.ok || "error" in data) {
        setErrorMessage(data.error ?? "We couldn't generate the review right now.");
        setIsSubmitting(false);
        return;
      }

      const reviewToken = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem("yc-validator:last-input", JSON.stringify(payload));
      sessionStorage.setItem("yc-validator:last-review", JSON.stringify(data));
      sessionStorage.setItem("yc-validator:last-review-token", reviewToken);
      router.push(`/review?rid=${reviewToken}`);
    } catch {
      setErrorMessage("We couldn't generate the review right now.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="yc-app-shell">
      <div className="yc-card yc-application-card">
        <Link href="/" className="yc-back-link">
          ‹ Back
        </Link>

        <div className="yc-page-head">
          <h2>Your Application</h2>
          <p>Write this the way you would want a YC reviewer to read it.</p>
        </div>

        <div className="yc-application-layout">
          <nav className="yc-left-nav" aria-label="Application sections">
            {SECTION_IDS.map((sectionId) => (
              <button
                key={sectionId}
                type="button"
                className={`yc-left-nav-item${activeSection === sectionId ? " is-active" : ""}`}
                onClick={() => {
                  setActiveSection(sectionId);
                  document.getElementById(sectionId)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
              </button>
            ))}
          </nav>

          <form className="yc-form-column" onSubmit={handleSubmit}>
            <section
              id="company"
              className="yc-form-section"
              onFocusCapture={() => setActiveSection("company")}
            >
              <h3>Describe what your company does or is going to make.</h3>
              <textarea
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="We are building..."
              />
            </section>

            <section
              id="problem"
              className="yc-form-section"
              onFocusCapture={() => setActiveSection("problem")}
            >
              <h3>What problem are you solving, and who has it?</h3>
              <textarea
                value={problem}
                onChange={(event) => setProblem(event.target.value)}
              />
            </section>

            <section
              id="founder"
              className="yc-form-section"
              onFocusCapture={() => setActiveSection("founder")}
            >
              <h3>Why are you the right founder to build this?</h3>
              <textarea
                value={founder}
                onChange={(event) => setFounder(event.target.value)}
              />
            </section>

            <section
              id="progress"
              className="yc-form-section"
              onFocusCapture={() => setActiveSection("progress")}
            >
              <div className="yc-progress-row">
                <div>
                  <h3>How far along are you?</h3>
                  <p>Select the stage that best represents your current momentum.</p>
                </div>
                <select value={stage} onChange={(event) => setStage(event.target.value as Stage)}>
                  <option value="">Current stage</option>
                  <option value="Idea">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="Users">Users</option>
                  <option value="Revenue">Revenue</option>
                </select>
              </div>

              {showWorkHistory ? (
                <div className="yc-inline-followup">
                  <h4>
                    How long has each of you been working on this? How much of that has
                    been full-time? Please explain.
                  </h4>
                  <textarea
                    value={workHistory}
                    onChange={(event) => setWorkHistory(event.target.value)}
                  />
                </div>
              ) : null}

              {showFullTime ? (
                <div className="yc-inline-followup">
                  <h4>Are you working on this full-time?</h4>
                  <div className="yc-binary-group">
                    {(["Yes", "No"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={fullTime === value ? "is-selected" : ""}
                        onClick={() => setFullTime(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section
              id="competitors"
              className="yc-form-section"
              onFocusCapture={() => setActiveSection("competitors")}
            >
              <h3>Who are your competitors, and what do you understand that they don’t?</h3>
              <textarea
                value={competitors}
                onChange={(event) => setCompetitors(event.target.value)}
              />
            </section>

            <section
              id="expertise"
              className="yc-form-section"
              onFocusCapture={() => setActiveSection("expertise")}
            >
              <div className="yc-progress-row">
                <div>
                  <h3>Does your founding team have domain expertise in this area?</h3>
                </div>
                <div className="yc-binary-group">
                  {(["Yes", "No"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={expertise === value ? "is-selected" : ""}
                      onClick={() => setExpertise(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="yc-application-actions">
              {errorMessage ? <p className="yc-error-message">{errorMessage}</p> : null}
              <button type="submit" className="yc-primary-cta" disabled={isSubmitting}>
                Submit for Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
