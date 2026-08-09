"use client";

import { useRef, useState } from "react";

const PRESET_TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"] as const;
type BookingStatus = "idle" | "submitting" | "success" | "error";

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getTomorrowISO(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatLocalDate(date);
}

function getMaxBookingISO(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return formatLocalDate(date);
}

function toScheduledAt(dateValue: string, timeValue: string): string | null {
  const customTime = /^(\d{2}):(\d{2})$/.exec(timeValue);
  const presetTime = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(timeValue);
  let hours: number;
  let minutes: number;
  if (customTime) {
    hours = Number(customTime[1]);
    minutes = Number(customTime[2]);
  } else if (presetTime) {
    hours = Number(presetTime[1]) % 12 + (presetTime[3] === "PM" ? 12 : 0);
    minutes = Number(presetTime[2]);
  } else return null;

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime()) || hours > 23 || minutes > 59) return null;
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function normalizePhoneNumber(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

export default function CallBookingForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [scheduledFor, setScheduledFor] = useState(getTomorrowISO());
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [customTime, setCustomTime] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setError("Please enter a valid phone number with country code (e.g. +1 555 000 1234).");
      return;
    }
    const finalTimeSlot = useCustomTime ? customTime : timeSlot;
    const scheduledAt = toScheduledAt(scheduledFor, finalTimeSlot);
    if (!scheduledAt || new Date(scheduledAt).getTime() < Date.now() + 60_000) {
      setError("Please choose a future date and time for your call.");
      return;
    }

    submittingRef.current = true;
    setError("");
    setStatus("submitting");
    try {
      const response = await fetch("/api/vapi/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: normalizedPhone, scheduledFor, timeSlot: finalTimeSlot, scheduledAt }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok || data.error) {
        setError(data.error ?? "We couldn't schedule your call right now. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("We couldn't schedule your call right now. Please check your connection.");
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  };

  const selectedTime = useCustomTime ? customTime : timeSlot;
  return (
    <div className="yc-booking-form">
      <div className="yc-booking-header"><p className="yc-booking-label">📞 Book a Custom Voice Review Call</p><span className="yc-booking-badge">SQLite Saved &amp; Vapi Scheduled</span></div>
      <p className="yc-booking-note">Select a date and local time for an automated Notyc AI voice review call directly to your phone.</p>
      <div className="yc-booking-fields">
        <div className="yc-booking-field"><label htmlFor="booking-phone">Phone Number (with country code)</label><input id="booking-phone" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+1 555 000 1234" disabled={status === "submitting"} /></div>
        <div className="yc-booking-field"><label htmlFor="booking-date">Preferred Date</label><input id="booking-date" type="date" value={scheduledFor} min={getTomorrowISO()} max={getMaxBookingISO()} onChange={(event) => setScheduledFor(event.target.value)} disabled={status === "submitting"} /></div>
        <div className="yc-booking-field">
          <div className="yc-time-field-header"><label htmlFor="booking-time">Preferred Time (your local time)</label><button type="button" className="yc-toggle-time-mode" onClick={() => setUseCustomTime((value) => !value)} disabled={status === "submitting"}>{useCustomTime ? "Use Slot Dropdown" : "Enter Custom Time"}</button></div>
          {useCustomTime ? <input id="booking-time-custom" type="time" value={customTime} onChange={(event) => setCustomTime(event.target.value)} disabled={status === "submitting"} className="yc-custom-time-input" /> : <select id="booking-time" value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)} disabled={status === "submitting"}><option value="">Select a time slot</option>{PRESET_TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select>}
        </div>
      </div>
      {error ? <p className="yc-error-message" role="alert">{error}</p> : null}
      {status === "success" ? <div className="yc-booking-success-box"><p className="yc-booking-success">✓ <strong>Call Scheduled &amp; Saved!</strong> Vapi will ring <code>{normalizePhoneNumber(phoneNumber)}</code> on <strong>{scheduledFor}</strong> at <strong>{selectedTime}</strong> (your local time).</p></div> : null}
      <button type="button" className="yc-booking-submit" disabled={status === "submitting"} onClick={handleSubmit}>{status === "submitting" ? "Scheduling with Vapi..." : "Schedule Voice Call"}</button>
    </div>
  );
}
