import { z } from "zod";

// ── Request ──────────────────────────────────────────────────────────────────

export const EvalInputSchema = z.object({
  startup_description: z
    .string()
    .min(20, "Startup description must be at least 20 characters")
    .max(2000, "Startup description must be under 2000 characters"),
  stage: z.enum(["idea", "mvp", "users", "revenue"]),
  is_technical: z.boolean(),
  is_full_time: z.boolean(),
  buzzwords_detected: z.array(z.string()).optional(),
  tarpit_match: z.string().nullable().optional(),
});

export type EvalInput = z.infer<typeof EvalInputSchema>;

// ── Response ─────────────────────────────────────────────────────────────────

const ConfidenceLevel = z.enum(["low", "medium", "high"]);

const DimensionScoreSchema = z.object({
  score:  z.number().int().min(1).max(10),
  reason: z.string(),
});

export const EvalOutputSchema = z.object({
  overall_assessment: z.string(),

  dimension_scores: z.object({
    problem_quality:       DimensionScoreSchema,
    founder_fit:           DimensionScoreSchema,
    solution_clarity:      DimensionScoreSchema,
    market_potential:      DimensionScoreSchema,
    traction_and_evidence: DimensionScoreSchema,
  }),

  confidence_by_dimension: z.object({
    problem_quality:       ConfidenceLevel,
    founder_fit:           ConfidenceLevel,
    solution_clarity:      ConfidenceLevel,
    market_potential:      ConfidenceLevel,
    traction_and_evidence: ConfidenceLevel,
  }),

  major_concerns:     z.array(z.string()).max(5),
  strong_signals:     z.array(z.string()).max(5),
  critical_questions: z.array(z.string()).max(5),
  missing_evidence:   z.array(z.string()).max(5),
  next_3_moves:       z.array(z.string()).length(3),
  hard_truth:         z.string(),
});

export type EvalOutput = z.infer<typeof EvalOutputSchema>;
