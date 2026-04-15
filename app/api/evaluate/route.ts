import Anthropic from "@anthropic-ai/sdk";
import { EvalInputSchema, EvalOutputSchema } from "../../../lib/evaluator/schema";
import { runHeuristics } from "../../../lib/evaluator/heuristics";
import { retrieveContext } from "../../../lib/evaluator/retrieval";
import { assemblePrompt } from "../../../lib/evaluator/prompt";

export async function POST(request: Request) {
  // ── Rule 10: env var check ────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set." },
      { status: 500 }
    );
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  // ── Validate input ────────────────────────────────────────────────────────
  const parsed = EvalInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // ── Run heuristics and merge results into input ───────────────────────────
  const heuristics = runHeuristics(parsed.data);

  const input = {
    ...parsed.data,
    buzzwords_detected: parsed.data.buzzwords_detected ?? heuristics.buzzwords_detected,
    tarpit_match:       parsed.data.tarpit_match       ?? heuristics.tarpit_match,
  };

  // ── Retrieval ─────────────────────────────────────────────────────────────
  let context: string;
  try {
    context = retrieveContext(input.startup_description);
  } catch {
    return Response.json(
      { error: "Failed to load knowledge base." },
      { status: 500 }
    );
  }

  // ── Prompt assembly ───────────────────────────────────────────────────────
  const { system, user } = assemblePrompt(input, context);

  // ── Model call ────────────────────────────────────────────────────────────
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let rawContent: string;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      return Response.json({ error: "Unexpected response type from model." }, { status: 500 });
    }
    rawContent = block.text;
  } catch {
    return Response.json({ error: "Model call failed." }, { status: 502 });
  }

  // ── Parse model JSON ──────────────────────────────────────────────────────
  let parsed_output: unknown;
  try {
    parsed_output = JSON.parse(rawContent);
  } catch {
    return Response.json(
      { error: "Model returned invalid JSON.", raw: rawContent },
      { status: 502 }
    );
  }

  // ── Validate output against locked schema ─────────────────────────────────
  const validated = EvalOutputSchema.safeParse(parsed_output);
  if (!validated.success) {
    return Response.json(
      { error: "Model output did not match locked schema.", details: validated.error.flatten() },
      { status: 502 }
    );
  }

  // ── Return response ───────────────────────────────────────────────────────
  return Response.json(validated.data);
}
