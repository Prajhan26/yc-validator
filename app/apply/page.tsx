"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const showWorkHistory = stage === "Users" || stage === "Revenue";
  const showFullTime = stage === "Idea" || stage === "MVP";

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

          <form
            className="yc-form-column"
            onSubmit={(event) => {
              event.preventDefault();
              router.push("/review");
            }}
          >
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
              <button type="submit" className="yc-primary-cta">
                Submit for Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
