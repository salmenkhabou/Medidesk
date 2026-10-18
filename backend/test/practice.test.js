import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../src/db/database.js";
import { createApp } from "../src/app.js";
import { createVault } from "../src/vault.js";
import { emailWorker } from "../src/mail.js";
import { encryptBackup, decryptBackup } from "../src/backup-codec.js";
import { backupDatabase } from "../src/backup.js";
async function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "medidesk-practice-")),
    filename = join(dir, "data.sqlite"),
    db = openDatabase(filename),
    hash = await bcrypt.hash("Fixture-only-2026!", 4),
    ids = {};
  for (const [name, role, doctor] of [
    ["doctor", "doctor"],
    ["other", "doctor"],
    ["secretary", "secretariat", "doctor"],
    ["patient", "patient"],
    ["stranger", "patient"],
    ["admin", "superadmin"],
  ])
    ids[name] = Number(
      db
        .prepare(
          "INSERT INTO users(name,email,password_hash,role,doctor_id) VALUES (?,?,?,?,?)",
        )
        .run(
          name,
          name + "@example.test",
          hash,
          role,
          doctor ? ids[doctor] : null,
        ).lastInsertRowid,
    );
  const aid = Number(
    db
      .prepare(
        "INSERT INTO appointments(patient_id,doctor_id,appointment_date,appointment_time,reason) VALUES (?,?,'2099-05-01','09:00','private-appointment-reason')",
      )
      .run(ids.patient, ids.doctor).lastInsertRowid,
  );
  const app = createApp({
    db,
    jwtSecret: "practice-test-signing-key-32-characters",
    rateLimits: false,
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`,
    tokens = {};
  for (const name of Object.keys(ids)) {
    const response = await fetch(base + "/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: name + "@example.test",
        password: "Fixture-only-2026!",
      }),
    });
    tokens[name] = (await response.json()).token;
  }
  const request = async (user, path, method = "GET", body) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Authorization: "Bearer " + tokens[user],
        ...(body ? { "content-type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  };
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { db, dir, filename, ids, aid, app, request };
}
const expect = async (p, status = 200) => {
  const r = await p;
  assert.equal(r.status, status, JSON.stringify(r.body));
  return r.body;
};
test("patient files isolate cabinets and secrets; secretary receives demographics but never clinical content", async (t) => {
  const f = await fixture(t),
    id = f.ids.patient;
  await expect(
    f.request("doctor", `/patients/${id}/medical`, "PUT", {
      history: "private-history",
      allergies: "private-allergy",
    }),
  );
  assert.throws(
    () => createVault({ production: true, key: "" }),
    /HEALTH_DATA_KEY/,
  );
  const restarted = createApp({
    db: f.db,
    jwtSecret: "a-different-signing-key-at-least-32-characters",
    rateLimits: false,
  });
  assert.equal(
    restarted.locals.practice.vault.open(
      f.db.prepare("SELECT reason FROM appointments").get().reason,
    ),
    "private-appointment-reason",
    "JWT key rotation does not rotate the retained health-data key",
  );
  const doc = await expect(f.request("doctor", `/patients/${id}`));
  assert.equal(doc.data.medical.history, "private-history");
  const secretary = await expect(f.request("secretary", `/patients/${id}`));
  assert.equal("medical" in secretary.data, false);
  assert.equal("consultations" in secretary.data, false);
  await expect(
    f.request("secretary", `/patients/${id}/medical`, "PUT", {
      history: "attempt",
    }),
    403,
  );
  await expect(f.request("other", `/patients/${id}`), 404);
  await expect(f.request("admin", `/patients/${id}`), 403);
  assert.equal(
    (await expect(f.request("admin", "/appointments"))).data[0].reason,
    "",
    "Technical administrators do not receive appointment free text",
  );
  const own = await expect(
    f.request("patient", `/patients/${id}?doctor_id=${f.ids.doctor}`),
  );
  assert.equal(own.data.medical.allergies, "private-allergy");
  await expect(
    f.request("stranger", `/patients/${id}?doctor_id=${f.ids.doctor}`),
    404,
  );
  assert.ok(
    f.db
      .prepare("SELECT medical FROM patient_profiles")
      .get()
      .medical.startsWith("mdenc:v1:"),
  );
  assert.ok(
    !f.db
      .prepare("SELECT reason FROM appointments")
      .get()
      .reason.includes("private-appointment-reason"),
  );
});
test("offline files link only through a one-use confidential token to the authenticated patient account", async (t) => {
  const f = await fixture(t);
  const { data: created } = await expect(
    f.request("secretary", "/patients", "POST", {
      name: "Real offline record",
      insurance: "CNAM",
    }),
    201,
  );
  assert.equal(created.portal_account, false);
  await expect(
    f.request("secretary", `/patients/${created.id}/link-token`, "POST", {}),
    403,
  );
  const { data: link } = await expect(
    f.request("doctor", `/patients/${created.id}/link-token`, "POST", {}),
  );
  assert.ok(
    !JSON.stringify(f.db.prepare("SELECT * FROM patient_links").get()).includes(
      link.token,
    ),
  );
  await expect(
    f.request("stranger", "/my-files/link", "POST", { token: link.token }),
  );
  await expect(
    f.request("patient", "/my-files/link", "POST", { token: link.token }),
    400,
  );
  const profiles = await expect(f.request("stranger", "/my-files"));
  assert.equal(profiles.data[0].id, f.ids.doctor);
});
test("documents require real allowed file signatures and scoped access; only explicit medical messages share them", async (t) => {
  const f = await fixture(t),
    pid = f.ids.patient;
  await expect(
    f.request("doctor", `/patients/${pid}/documents`, "POST", {
      name: "x.pdf",
      mime: "application/pdf",
      category: "analysis",
      content_base64: Buffer.from("not a PDF").toString("base64"),
    }),
    400,
  );
  const { data: d } = await expect(
    f.request("doctor", `/patients/${pid}/documents`, "POST", {
      name: "result.pdf",
      mime: "application/pdf",
      category: "analysis",
      content_base64: Buffer.from("%PDF-1.4\nfixture-content").toString(
        "base64",
      ),
    }),
    201,
  );
  await expect(f.request("other", `/documents/${d.id}`), 404);
  await expect(f.request("secretary", `/documents/${d.id}`), 403);
  await expect(f.request("stranger", `/documents/${d.id}`), 404);
  const own = await expect(f.request("patient", `/documents/${d.id}`));
  assert.equal(own.data.name, "result.pdf");
  await expect(
    f.request("doctor", "/messages", "POST", {
      recipient_id: f.ids.other,
      patient_id: pid,
      document_id: d.id,
      subject: "Avis spécialisé",
      body: "Confidential referral body",
    }),
    201,
  );
  await expect(f.request("other", `/documents/${d.id}`));
  await expect(f.request("other", `/patients/${pid}`), 404);
  assert.ok(
    !f.db
      .prepare("SELECT payload FROM messages")
      .get()
      .payload.includes("Confidential referral"),
  );
  await expect(
    f.request("stranger", "/messages", "POST", {
      recipient_id: f.ids.doctor,
      subject: "Attempt",
      body: "No relationship",
    }),
    404,
  );
});
test("vitals and consultation observations persist with encryption and remain hidden from other roles", async (t) => {
  const f = await fixture(t),
    pid = f.ids.patient;
  await expect(
    f.request("doctor", `/patients/${pid}/vitals`, "POST", {
      measured_at: "2026-10-18",
      weight: "72.5",
      systolic: "120",
      glucose: "0.95",
    }),
    201,
  );
  await expect(f.request("secretary", `/patients/${pid}/vitals`), 403);
  await expect(
    f.request("doctor", `/patients/${pid}/vitals`, "POST", {
      measured_at: "2026-10-18",
      weight: "-1",
    }),
    400,
  );
  const c = await expect(
    f.request("doctor", `/appointments/${f.aid}/consultation`, "POST", {
      notes: "Private clinical note",
      prescription: "Clinical prescription",
      diagnosis: "Hypertension",
      examination: "Private exam",
      lab_orders: "Blood test",
    }),
    201,
  );
  assert.equal(c.data.clinical.diagnosis, "Hypertension");
  const rows = await expect(f.request("patient", "/consultations"));
  assert.equal(rows.data[0].notes, "Private clinical note");
  const stored = f.db.prepare("SELECT * FROM consultations").get();
  assert.ok(!stored.notes.includes("Private clinical note"));
  assert.ok(!stored.clinical_payload.includes("Hypertension"));
});
test("agenda enforces overlapping durations, protected urgent slots, cancellations and waiting-list ownership", async (t) => {
  const f = await fixture(t);
  await expect(
    f.request("patient", "/appointments", "POST", {
      doctor_id: f.ids.doctor,
      appointment_date: "2099-05-01",
      appointment_time: "09:15",
    }),
    409,
  );
  await expect(
    f.request("secretary", "/schedule", "POST", {
      slot_date: "2099-05-01",
      slot_time: "10:00",
      duration: 30,
      kind: "urgent",
    }),
    201,
  );
  await expect(
    f.request("patient", "/appointments", "POST", {
      doctor_id: f.ids.doctor,
      appointment_date: "2099-05-01",
      appointment_time: "10:00",
    }),
    409,
  );
  await expect(
    f.request("secretary", "/staff-appointments", "POST", {
      patient_id: f.ids.patient,
      appointment_date: "2099-05-01",
      appointment_time: "10:00",
      duration: 30,
      priority: "urgent",
    }),
    201,
  );
  await expect(
    f.request("patient", `/appointments/${f.aid}`, "PATCH", {
      status: "cancelled",
    }),
  );
  await expect(
    f.request("patient", "/appointments", "POST", {
      doctor_id: f.ids.doctor,
      appointment_date: "2099-05-01",
      appointment_time: "09:00",
    }),
    201,
  );
  const { data: w } = await expect(
    f.request("patient", "/waiting-list", "POST", {
      doctor_id: f.ids.doctor,
      preferred_date: "2099-05-02",
    }),
    201,
  );
  await expect(
    f.request("other", `/waiting-list/${w.id}`, "PATCH", {
      status: "contacted",
    }),
    404,
  );
  await expect(
    f.request("patient", `/waiting-list/${w.id}`, "PATCH", {
      status: "booked",
    }),
    400,
  );
});
test("invoices track partial payments, prevent overpayment and double entry, and scope insurance claims", async (t) => {
  const f = await fixture(t);
  await expect(
    f.request("doctor", `/appointments/${f.aid}/payment`, "POST", {
      amount: "20.125",
      method: "cash",
    }),
    201,
  );
  const { data: i } = await expect(
    f.request("secretary", "/invoices", "POST", {
      patient_id: f.ids.patient,
      appointment_id: f.aid,
      lines: [{ label: "Consultation", quantity: 1, unit_amount: "65.125" }],
    }),
    201,
  );
  assert.equal(i.balance_millimes, 45000);
  await expect(
    f.request("doctor", `/appointments/${f.aid}/payment`, "POST", {
      amount: "1",
      method: "cash",
    }),
    409,
  );
  await expect(
    f.request("other", `/invoices/${i.id}/receipts`, "POST", {
      amount: "45",
      method: "cheque",
    }),
    404,
  );
  const paid = await expect(
    f.request("secretary", `/invoices/${i.id}/receipts`, "POST", {
      amount: "45",
      method: "cheque",
    }),
    201,
  );
  assert.equal(paid.data.balance_millimes, 0);
  await expect(
    f.request("doctor", `/invoices/${i.id}/receipts`, "POST", {
      amount: "1",
      method: "cash",
    }),
    409,
  );
  await expect(
    f.request("secretary", `/invoices/${i.id}/claim`, "PUT", {
      status: "submitted",
      insurer: "CNAM",
      reference: "CLAIM-REAL",
    }),
  );
  const own = await expect(f.request("patient", "/invoices"));
  assert.equal(own.data.length, 1);
  assert.equal(own.data[0].claim.insurer, "CNAM");
  assert.equal(
    (await expect(f.request("stranger", "/invoices"))).data.length,
    0,
  );
});
test("reports use real receipts once, export valid Excel, and suppress diagnoses for administrators and secretaries", async (t) => {
  const f = await fixture(t);
  await expect(
    f.request("doctor", `/appointments/${f.aid}/consultation`, "POST", {
      notes: "Clinical observation",
      diagnosis: "Hypertension",
    }),
    201,
  );
  await expect(
    f.request("doctor", `/appointments/${f.aid}/payment`, "POST", {
      amount: "65.125",
      method: "cash",
    }),
    201,
  );
  const from = "2026-01-01",
    to = "2026-12-31",
    query = `?from=${from}&to=${to}`;
  const r = await expect(f.request("doctor", "/reports" + query));
  assert.equal(r.data.revenue_millimes, 65125);
  assert.equal(r.data.diagnoses[0].name, "Hypertension");
  assert.deepEqual(
    (await expect(f.request("admin", "/reports" + query))).data.diagnoses,
    [],
  );
  assert.deepEqual(
    (await expect(f.request("secretary", "/reports" + query))).data.diagnoses,
    [],
  );
  await expect(f.request("patient", "/reports" + query), 403);
  const excel = await expect(
    f.request("doctor", "/reports/export" + query + "&format=xlsx"),
  );
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(excel.data.content_base64, "base64"));
  assert.equal(workbook.worksheets[0].getRow(2).getCell(4).value, 65.125);
});
test("reminders are deduplicated, SMTP requires consent, withdrawal/cancellation prevents delivery, and no clinical text is emailed", async (t) => {
  const f = await fixture(t),
    future = new Date(Date.now() + 3600000),
    tunis = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Africa/Tunis",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(future),
    [day, hour] = tunis.split(" ");
  f.db
    .prepare(
      "UPDATE appointments SET appointment_date=?,appointment_time=? WHERE id=?",
    )
    .run(day, hour, f.aid);
  f.app.locals.practice.reminders();
  f.app.locals.practice.reminders();
  assert.equal(
    f.db
      .prepare("SELECT count(*) n FROM notifications WHERE reference=?")
      .get("reminder:" + f.aid).n,
    2,
  );
  assert.equal(f.db.prepare("SELECT count(*) n FROM email_queue").get().n, 0);
  await expect(
    f.request("patient", "/notification-preferences", "PUT", {
      email_opt_in: true,
    }),
  );
  f.app.locals.practice.reminders();
  const sent = [],
    worker = emailWorker({
      db: f.db,
      vault: f.app.locals.practice.vault,
      transport: { sendMail: async (m) => sent.push(m) },
    });
  await worker();
  assert.equal(sent.length, 1);
  assert.ok(!JSON.stringify(sent[0]).includes("private-appointment-reason"));
  f.db.prepare("UPDATE email_queue SET status='pending'").run();
  await expect(
    f.request("patient", "/notification-preferences", "PUT", {
      email_opt_in: false,
    }),
  );
  await worker();
  assert.equal(sent.length, 1);
});
test("schema upgrades preserve legacy identities and encrypted backups authenticate before restoration", async (t) => {
  const f = await fixture(t);
  const before = f.db.prepare("SELECT count(*) n FROM users").get().n;
  const reopened = openDatabase(f.filename);
  assert.equal(
    reopened.prepare("SELECT count(*) n FROM users").get().n,
    before,
  );
  assert.equal(reopened.prepare("PRAGMA user_version").get().user_version, 2);
  reopened.close();
  const previous = process.env.HEALTH_DATA_KEY;
  process.env.HEALTH_DATA_KEY = "a".repeat(64);
  t.after(() => {
    if (previous === undefined) delete process.env.HEALTH_DATA_KEY;
    else process.env.HEALTH_DATA_KEY = previous;
  });
  const plain = await backupDatabase(f.filename),
    encrypted = plain + ".enc",
    restored = join(f.dir, "restored.sqlite");
  await encryptBackup(plain, encrypted);
  await decryptBackup(encrypted, restored);
  const read = openDatabase(restored);
  assert.equal(read.prepare("SELECT count(*) n FROM users").get().n, before);
  read.close();
  const damaged = readFileSync(encrypted);
  damaged[30] ^= 1;
  const corrupt = join(f.dir, "bad.enc"),
    badTarget = join(f.dir, "bad.sqlite");
  writeFileSync(corrupt, damaged);
  await assert.rejects(decryptBackup(corrupt, badTarget));
  assert.equal(existsSync(badTarget), false);
  const vault = createVault({ key: "b".repeat(64) });
  assert.throws(() => vault.open(f.app.locals.practice.vault.seal("private")));
});
test("templates and personal medicine catalogues are doctor-scoped and never pretend to provide validated drug safety checks", async (t) => {
  const f = await fixture(t);
  await expect(
    f.request("doctor", "/templates", "POST", {
      kind: "certificate",
      title: "Certificat de repos",
      body: "Texte rédigé par le médecin.",
    }),
    201,
  );
  assert.equal((await expect(f.request("other", "/templates"))).data.length, 0);
  await expect(f.request("secretary", "/templates"), 403);
  await expect(
    f.request("doctor", "/medicines", "POST", {
      name: "Catalogue saisi par le médecin",
      ingredient: "DCI",
      source: "Référence professionnelle",
      reviewed_on: "2026-10-18",
    }),
    201,
  );
  assert.equal(
    (await expect(f.request("doctor", "/medicines"))).decision_support,
    false,
  );
  assert.equal((await expect(f.request("other", "/medicines"))).data.length, 0);
  await expect(
    f.request("patient", `/appointments/${f.aid}/video`, "POST", {
      consent: true,
    }),
    503,
  );
});

test("published slots determine patient appointment duration and booked slots disappear until cancellation", async (t) => {
  const f = await fixture(t);
  await expect(
    f.request("doctor", "/schedule", "POST", {
      slot_date: "2099-05-03",
      slot_time: "11:00",
      duration: 15,
      kind: "available",
    }),
    201,
  );
  await expect(
    f.request("patient", "/appointments", "POST", {
      doctor_id: f.ids.doctor,
      appointment_date: "2099-05-03",
      appointment_time: "11:15",
    }),
    409,
  );
  const before = await expect(
    f.request(
      "patient",
      `/schedule?doctor_id=${f.ids.doctor}&from=2099-05-03&to=2099-05-03`,
    ),
  );
  assert.equal(before.published, true);
  assert.equal(before.data.length, 1);
  const booked = await expect(
    f.request("patient", "/appointments", "POST", {
      doctor_id: f.ids.doctor,
      appointment_date: "2099-05-03",
      appointment_time: "11:00",
    }),
    201,
  );
  assert.equal(booked.data.duration, 15);
  assert.equal(
    (
      await expect(
        f.request(
          "patient",
          `/schedule?doctor_id=${f.ids.doctor}&from=2099-05-03&to=2099-05-03`,
        ),
      )
    ).data.length,
    0,
  );
  await expect(
    f.request("patient", `/appointments/${booked.data.id}`, "PATCH", {
      status: "cancelled",
    }),
  );
  assert.equal(
    (
      await expect(
        f.request(
          "patient",
          `/schedule?doctor_id=${f.ids.doctor}&from=2099-05-03&to=2099-05-03`,
        ),
      )
    ).data.length,
    1,
  );
});
