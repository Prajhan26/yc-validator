export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { VapiRequestError, createOutboundCall } from "../../../../lib/vapi";
import { insertCallBooking, updateCallBookingVapiId } from "../../../../lib/db";

const E164_PHONE = /^\+[1-9]\d{7,14}$/;

function normalizePhoneNumber(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

function vapiErrorResponse(error: unknown, bookingId: number) {
  const status = error instanceof VapiRequestError ? error.status : undefined;
  if (status === 400) return Response.json({ error: "Vapi rejected this phone number or scheduled time.", bookingId }, { status: 400 });
  if (status === 401 || status === 403) return Response.json({ error: "Outbound calling is temporarily unavailable. Please contact support.", bookingId }, { status: 503 });
  if (status === 429) return Response.json({ error: "Outbound calling is busy. Please try scheduling again in a minute.", bookingId }, { status: 429, headers: { "Retry-After": "60" } });
  if (status === 504) return Response.json({ error: "Vapi did not confirm the booking in time. Please try again.", bookingId }, { status: 504 });
  return Response.json({ error: "We couldn't schedule the call with Vapi right now. Please try again.", bookingId }, { status: 502 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  const { phoneNumber, scheduledFor, timeSlot, scheduledAt } = (body ?? {}) as {
    phoneNumber?: string;
    scheduledFor?: string;
    timeSlot?: string;
    scheduledAt?: string;
  };
  const normalizedPhone = typeof phoneNumber === "string" ? normalizePhoneNumber(phoneNumber) : "";
  const scheduledDate = typeof scheduledAt === "string" ? new Date(scheduledAt) : null;

  if (!E164_PHONE.test(normalizedPhone)) {
    return Response.json({ error: "Enter a valid phone number with country code, for example +15550001234." }, { status: 400 });
  }
  if (!scheduledFor || !timeSlot || !scheduledDate || Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now() + 60_000) {
    return Response.json({ error: "Choose a future date and time for your call." }, { status: 400 });
  }

  let bookingId: number;
  try {
    bookingId = insertCallBooking({
      phoneNumber: normalizedPhone,
      scheduledFor,
      timeSlot,
    });
  } catch {
    return Response.json({ error: "We couldn't save your booking. Please try again." }, { status: 500 });
  }

  try {
    const result = await createOutboundCall({
      phoneNumber: normalizedPhone,
      scheduledAt: scheduledDate.toISOString(),
      variableValues: { scheduledFor, timeSlot },
    });

    try {
      updateCallBookingVapiId(bookingId, result.id);
    } catch {
      // The Vapi call is already scheduled; do not report a false failure to the caller.
    }

    return Response.json({ id: result.id, status: result.status, bookingId, scheduledAt: scheduledDate.toISOString() });
  } catch (error) {
    return vapiErrorResponse(error, bookingId);
  }
}
