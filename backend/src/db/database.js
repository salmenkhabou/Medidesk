import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function openDatabase(
  filename = process.env.DB_PATH || "./data/medidesk.sqlite",
) {
  if (filename !== ":memory:")
    mkdirSync(dirname(resolve(filename)), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  if (filename !== ":memory:") chmodSync(filename, 0o600);
  db.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('patient','doctor','secretariat','superadmin')),
      session_version INTEGER NOT NULL DEFAULT 0, doctor_id INTEGER REFERENCES users(id), specialty TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '',
      clinic TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', cnom TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES users(id), doctor_id INTEGER NOT NULL REFERENCES users(id),
      appointment_date TEXT NOT NULL, appointment_time TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','completed','cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS appointment_slot ON appointments(doctor_id,appointment_date,appointment_time) WHERE status != 'cancelled';
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY, appointment_id INTEGER NOT NULL UNIQUE REFERENCES appointments(id),
      doctor_id INTEGER NOT NULL REFERENCES users(id), patient_id INTEGER NOT NULL REFERENCES users(id),
      notes TEXT NOT NULL, prescription TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY, appointment_id INTEGER NOT NULL UNIQUE REFERENCES appointments(id),
      amount_millimes INTEGER NOT NULL CHECK(amount_millimes > 0), method TEXT NOT NULL CHECK(method IN ('cash','card','transfer')),
      recorded_by INTEGER NOT NULL REFERENCES users(id), created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), category TEXT NOT NULL,
      message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','under_review','planned','closed')),
      response TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, specialty TEXT NOT NULL,
      city TEXT NOT NULL, cnom TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed','rejected')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), action TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS analytics_daily (
      day TEXT NOT NULL,
      page TEXT NOT NULL CHECK(page IN ('directory','application','privacy')),
      views INTEGER NOT NULL DEFAULT 0 CHECK(views >= 0),
      PRIMARY KEY(day,page)
    );
    PRAGMA user_version = 1;
  `);
  if (
    !db
      .prepare("PRAGMA table_info(users)")
      .all()
      .some((column) => column.name === "session_version")
  ) {
    db.exec(
      "ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0",
    );
  }
  return db;
}
