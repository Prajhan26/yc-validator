import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";

// ── SQLite storage ─────────────────────────────────────────────────────────────
// Lightweight local store for user submissions (YC ideas, timestamps, AI feedback).
// Uses Node's built-in `node:sqlite` (no native addon — avoids better-sqlite3
// prebuilt-binary crashes on some Node versions).

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "submissions.db");

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      startup_description TEXT NOT NULL,
      stage               TEXT NOT NULL,
      is_technical        INTEGER NOT NULL,
      is_full_time        INTEGER NOT NULL,
      ai_feedback         TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS call_bookings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number  TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      time_slot     TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      vapi_call_id  TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

export interface SubmissionRecord {
  id?: number;
  startup_description: string;
  stage: string;
  is_technical: boolean;
  is_full_time: boolean;
  ai_feedback?: string | null;
  created_at?: string;
}

export function insertSubmission(record: SubmissionRecord): number {
  const database = getDb();
  const result = database
    .prepare(
      `INSERT INTO submissions (startup_description, stage, is_technical, is_full_time, ai_feedback)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      record.startup_description,
      record.stage,
      record.is_technical ? 1 : 0,
      record.is_full_time ? 1 : 0,
      record.ai_feedback ?? null,
    );
  return Number(result.lastInsertRowid);
}

export function listSubmissions(limit = 100): SubmissionRecord[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT id, startup_description, stage, is_technical, is_full_time, ai_feedback, created_at
       FROM submissions ORDER BY id DESC LIMIT ?`,
    )
    .all(limit) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as number,
    startup_description: row.startup_description as string,
    stage: row.stage as string,
    is_technical: Boolean(row.is_technical),
    is_full_time: Boolean(row.is_full_time),
    ai_feedback: typeof row.ai_feedback === "string" ? row.ai_feedback : null,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
  }));
}

export function getSubmission(id: number): SubmissionRecord | undefined {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT id, startup_description, stage, is_technical, is_full_time, ai_feedback, created_at
       FROM submissions WHERE id = ?`,
    )
    .get(id) as Record<string, unknown> | undefined;

  if (!row) return undefined;

  return {
    id: row.id as number,
    startup_description: row.startup_description as string,
    stage: row.stage as string,
    is_technical: Boolean(row.is_technical),
    is_full_time: Boolean(row.is_full_time),
    ai_feedback: typeof row.ai_feedback === "string" ? row.ai_feedback : null,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
  };
}

// ── Call bookings (scheduled outbound voice review calls) ───────────────────

export interface CallBookingRecord {
  id?: number;
  phoneNumber: string;
  scheduledFor: string;
  timeSlot: string;
  status?: string;
  vapiCallId?: string | null;
  createdAt?: string;
}

export function insertCallBooking(record: CallBookingRecord): number {
  const database = getDb();
  const result = database
    .prepare(
      `INSERT INTO call_bookings (phone_number, scheduled_for, time_slot, status, vapi_call_id)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      record.phoneNumber,
      record.scheduledFor,
      record.timeSlot,
      record.status ?? "pending",
      record.vapiCallId ?? null,
    );
  return Number(result.lastInsertRowid);
}

export function updateCallBookingVapiId(id: number, vapiCallId: string): void {
  const database = getDb();
  database
    .prepare(`UPDATE call_bookings SET vapi_call_id = ?, status = 'scheduled' WHERE id = ?`)
    .run(vapiCallId, id);
}
