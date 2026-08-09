// Server-side helpers for Vapi outbound calls. Private credentials never reach the browser.

const VAPI_BASE_URL = "https://api.vapi.ai";
const VAPI_REQUEST_TIMEOUT_MS = 10_000;

export interface VapiOutboundCallRequest {
  phoneNumber: string;
  scheduledAt: string;
  variableValues?: Record<string, string>;
}

export interface VapiOutboundCallResponse {
  id: string;
  status: string;
  [key: string]: unknown;
}

export class VapiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "VapiRequestError";
  }
}

const INITIAL_GREETING =
  "Hey, I am Notyc voice agent. I will listen to your idea. Can you share your idea so I can give better suggestions or feedback?";

/** Creates a Vapi-scheduled call; Vapi, rather than the web server, owns delivery at the selected time. */
export async function createOutboundCall(
  request: VapiOutboundCallRequest,
): Promise<VapiOutboundCallResponse> {
  const apiKey = process.env.VAPI_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

  if (!apiKey || !assistantId || !phoneNumberId) {
    throw new VapiRequestError("Vapi outbound calling is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VAPI_REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumberId,
        assistantId,
        customer: { number: request.phoneNumber },
        schedulePlan: { earliestAt: request.scheduledAt },
        assistantOverrides: {
          firstMessage: INITIAL_GREETING,
          ...(request.variableValues ? { variableValues: request.variableValues } : {}),
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new VapiRequestError("Vapi did not confirm the booking in time.", 504);
    }
    throw new VapiRequestError("Could not reach Vapi to schedule the call.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new VapiRequestError("Vapi rejected the outbound call request.", response.status);
  }

  try {
    return (await response.json()) as VapiOutboundCallResponse;
  } catch {
    throw new VapiRequestError("Vapi returned an invalid booking response.", 502);
  }
}
