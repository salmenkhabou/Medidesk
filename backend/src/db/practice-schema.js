export function migratePractice(db) {
  const column = (table, name, type) => {
    if (
      !db
        .prepare(`PRAGMA table_info(${table})`)
        .all()
        .some((c) => c.name === name)
    )
      db.exec(`
ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
  };
  db.exec("BEGIN IMMEDIATE");
  try {
    column("users", "email_reminders_opt_in", "INTEGER NOT NULL DEFAULT 0");
    column(
      "appointments",
      "duration",
      "INTEGER NOT NULL DEFAULT 30 CHECK(duration BETWEEN 5 AND 240)",
    );
    column("appointments", "priority", "TEXT NOT NULL DEFAULT 'normal'");
    column("appointments", "attendance", "TEXT NOT NULL DEFAULT 'pending'");
    column("consultations", "clinical_payload", "TEXT NOT NULL DEFAULT '{}'");
    db.exec(`
 CREATE TABLE IF NOT EXISTS vault_state(id INTEGER PRIMARY KEY CHECK(id=1),check_value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS patient_links(id INTEGER PRIMARY KEY,patient_id INTEGER NOT NULL REFERENCES users(id),doctor_id INTEGER NOT NULL REFERENCES users(id),token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,used_at TEXT);
 CREATE TABLE IF NOT EXISTS email_queue(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),reference TEXT NOT NULL UNIQUE,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,sent_at TEXT);
 CREATE TABLE IF NOT EXISTS patient_profiles(patient_id INTEGER NOT NULL REFERENCES users(id),doctor_id INTEGER NOT NULL REFERENCES users(id),demographics TEXT NOT NULL DEFAULT '{}',medical TEXT NOT NULL DEFAULT '{}',updated_at TEXT NOT NULL DEFAULT (datetime('now')),PRIMARY KEY(patient_id,doctor_id));
 CREATE TABLE IF NOT EXISTS documents(id INTEGER PRIMARY KEY,patient_id INTEGER NOT NULL REFERENCES users(id),doctor_id INTEGER NOT NULL REFERENCES users(id),uploaded_by INTEGER NOT NULL REFERENCES users(id),payload TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE TABLE IF NOT EXISTS vitals(id INTEGER PRIMARY KEY,patient_id INTEGER NOT NULL REFERENCES users(id),doctor_id INTEGER NOT NULL REFERENCES users(id),measured_at TEXT NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE TABLE IF NOT EXISTS report_templates(id INTEGER PRIMARY KEY,doctor_id INTEGER NOT NULL REFERENCES users(id),kind TEXT NOT NULL CHECK(kind IN ('report','certificate','prescription','lab','imaging')),payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS schedule_slots(id INTEGER PRIMARY KEY,doctor_id INTEGER NOT NULL REFERENCES users(id),slot_date TEXT NOT NULL,slot_time TEXT NOT NULL,duration INTEGER NOT NULL CHECK(duration BETWEEN 5 AND 240),kind TEXT NOT NULL CHECK(kind IN ('available','urgent','blocked')),UNIQUE(doctor_id,slot_date,slot_time));
 CREATE TABLE IF NOT EXISTS waiting_list(id INTEGER PRIMARY KEY,patient_id INTEGER NOT NULL REFERENCES users(id),doctor_id INTEGER NOT NULL REFERENCES users(id),preferred_date TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','contacted','booked','cancelled')),created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE UNIQUE INDEX IF NOT EXISTS one_waiting_entry ON waiting_list(patient_id,doctor_id,preferred_date) WHERE status='waiting';
 CREATE TABLE IF NOT EXISTS invoices(id INTEGER PRIMARY KEY,patient_id INTEGER NOT NULL REFERENCES users(id),doctor_id INTEGER NOT NULL REFERENCES users(id),appointment_id INTEGER UNIQUE REFERENCES appointments(id),total_millimes INTEGER NOT NULL CHECK(total_millimes>0),payload TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE TABLE IF NOT EXISTS invoice_payments(id INTEGER PRIMARY KEY,invoice_id INTEGER NOT NULL REFERENCES invoices(id),amount_millimes INTEGER NOT NULL CHECK(amount_millimes>0),method TEXT NOT NULL CHECK(method IN ('cash','card','cheque','transfer','third_party')),recorded_by INTEGER NOT NULL REFERENCES users(id),created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE TABLE IF NOT EXISTS insurance_claims(id INTEGER PRIMARY KEY,invoice_id INTEGER NOT NULL UNIQUE REFERENCES invoices(id),status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','accepted','rejected','reimbursed')),payload TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY,sender_id INTEGER NOT NULL REFERENCES users(id),recipient_id INTEGER NOT NULL REFERENCES users(id),patient_id INTEGER REFERENCES users(id),document_id INTEGER REFERENCES documents(id),payload TEXT NOT NULL,read_at TEXT,created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),reference TEXT NOT NULL,payload TEXT NOT NULL,read_at TEXT,created_at TEXT NOT NULL DEFAULT (datetime('now')),UNIQUE(user_id,reference));
 CREATE TABLE IF NOT EXISTS medicines(id INTEGER PRIMARY KEY,doctor_id INTEGER NOT NULL REFERENCES users(id),payload TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS video_sessions(id INTEGER PRIMARY KEY,appointment_id INTEGER NOT NULL UNIQUE REFERENCES appointments(id),room_id TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE INDEX IF NOT EXISTS documents_owner ON documents(doctor_id,patient_id);
 CREATE INDEX IF NOT EXISTS messages_inbox ON messages(recipient_id,id);
 PRAGMA user_version=2;
 `);
    column("documents", "metadata", "TEXT NOT NULL DEFAULT ''");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
