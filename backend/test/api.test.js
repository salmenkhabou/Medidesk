import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";

const password = "Integration-only-7!";
async function fixture(t) {
  const folder = mkdtempSync(join(tmpdir(), "medidesk-test-"));
  const filename = join(folder, "test.sqlite");
  const db = openDatabase(filename);
  const hash = await bcrypt.hash(password, 4);
  const insert = db.prepare(
    "INSERT INTO users(name,email,password_hash,role,specialty,city,cnom,doctor_id) VALUES (?,?,?,?,?,?,?,?)",
  );
  const add = (name, role, id = null) =>
    Number(
      insert.run(
        name,
        `${name}@example.test`,
        hash,
        role,
        role === "doctor" ? "Médecine générale" : "",
        "Tunis",
        role === "doctor" ? "TEST-CNOM" : "",
        id,
      ).lastInsertRowid,
    );
  const admin = add("Admin", "superadmin");
  const doctor = add("Doctor", "doctor");
  const otherDoctor = add("OtherDoctor", "doctor");
  const patient = add("Patient", "patient");
  const otherPatient = add("OtherPatient", "patient");
  add("Secretary", "secretariat", doctor);
  const secret = "integration-test-secret-with-at-least-32-characters";
  const app = createApp({ db, jwtSecret: secret, rateLimits: false });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  let base = `http://127.0.0.1:${server.address().port}/api`;
  const request = async (path, method = "GET", body, token) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, body: await res.json() };
  };
  const login = async (name) => {
    const r = await request("/auth/login", "POST", {
      email: `${name}@example.test`,
      password,
    });
    assert.equal(r.status, 200);
    return r.body.token;
  };
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
    rmSync(folder, { recursive: true, force: true });
  });
  return {
    db,
    filename,
    request,
    login,
    ids: { admin, doctor, otherDoctor, patient, otherPatient },
    restart: async () => {
      await new Promise((resolve) => server.close(resolve));
      const reopened = openDatabase(filename);
      const s = await new Promise((resolve) => {
        const s = createApp({
          db: reopened,
          jwtSecret: secret,
          rateLimits: false,
        }).listen(0, "127.0.0.1", () => resolve(s));
      });
      base = `http://127.0.0.1:${s.address().port}/api`;
      t.after(async () => {
        await new Promise((resolve) => s.close(resolve));
        reopened.close();
      });
    },
  };
}
const slot = (doctor_id) => ({
  doctor_id,
  appointment_date: "2099-04-12",
  appointment_time: "09:00",
  reason: "Consultation de suivi",
});

test("clean database has no demo identities or practitioners; public registration cannot assign roles", async (t) => {
  const db = openDatabase(":memory:");
  t.after(() => db.close());
  assert.equal(db.prepare("SELECT count(*) AS n FROM users").get().n, 0);
  const f = await fixture(t);
  const r = await f.request("/auth/register", "POST", {
    name: "New Patient",
    email: "new@example.test",
    password,
    role: "superadmin",
    doctor_id: f.ids.doctor,
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.role, "patient");
  assert.equal(r.body.user.doctor_id, null);
  assert.equal("password_hash" in r.body.user, false);
  assert.equal(
    (
      await f.request("/auth/register", "POST", {
        name: "Duplicate",
        email: "NEW@example.test",
        password,
      })
    ).status,
    409,
  );
});
test("authentication rejects wrong passwords, prototype bypasses and unauthorized roles", async (t) => {
  const f = await fixture(t);
  assert.equal(
    (
      await f.request("/auth/login", "POST", {
        email: "Admin@example.test",
        password: "Password123!",
      })
    ).status,
    401,
  );
  assert.equal(
    (await f.request("/team", "GET", undefined, "mdk_jwt_token_sample")).status,
    401,
  );
  assert.equal((await f.request("/team")).status, 401);
  const token = await f.login("Patient");
  assert.equal((await f.request("/team", "GET", undefined, token)).status, 403);
  assert.equal(
    (await f.request("/audit", "GET", undefined, token)).status,
    403,
  );
  assert.equal(
    (await f.request("/auth/verify-2fa", "POST", { code: "123456" })).status,
    401,
  );
});
test("booking, consultation, record access, payments and persistence form a complete workflow", async (t) => {
  const f = await fixture(t);
  const patient = await f.login("Patient");
  const other = await f.login("OtherPatient");
  const doctor = await f.login("Doctor");
  const otherDoctor = await f.login("OtherDoctor");
  const secretary = await f.login("Secretary");
  const booking = await f.request(
    "/appointments",
    "POST",
    slot(f.ids.doctor),
    patient,
  );
  assert.equal(booking.status, 201);
  const id = booking.body.data.id;
  assert.equal(
    (await f.request("/appointments", "POST", slot(f.ids.doctor), other))
      .status,
    409,
  );
  assert.equal(
    (await f.request("/appointments", "GET", undefined, other)).body.data
      .length,
    0,
  );
  assert.equal(
    (await f.request("/appointments", "GET", undefined, secretary)).body.data
      .length,
    1,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}/consultation`,
        "POST",
        { notes: "Private record" },
        otherDoctor,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}/consultation`,
        "POST",
        { notes: "Private record" },
        secretary,
      )
    ).status,
    403,
  );
  const record = await f.request(
    `/appointments/${id}/consultation`,
    "POST",
    { notes: "Follow-up note", prescription: "Test prescription" },
    doctor,
  );
  assert.equal(record.status, 201);
  assert.equal(
    (await f.request("/consultations", "GET", undefined, patient)).body.data[0]
      .notes,
    "Follow-up note",
  );
  assert.equal(
    (await f.request("/consultations", "GET", undefined, other)).body.data
      .length,
    0,
  );
  assert.equal(
    (await f.request("/consultations", "GET", undefined, secretary)).status,
    403,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}/payment`,
        "POST",
        { amount: "65.125", method: "cash" },
        secretary,
      )
    ).status,
    201,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}/payment`,
        "POST",
        { amount: "65.125", method: "cash" },
        secretary,
      )
    ).status,
    409,
  );
  assert.equal(
    (await f.request("/payments", "GET", undefined, doctor)).body.data[0]
      .amount_millimes,
    65125,
  );
  assert.equal(
    (await f.request("/payments", "GET", undefined, otherDoctor)).body.data
      .length,
    0,
  );
  await f.restart();
  assert.equal(
    (await f.request("/appointments", "GET", undefined, patient)).body.data[0]
      .status,
    "completed",
  );
  assert.equal(
    (await f.request("/consultations", "GET", undefined, patient)).body.data
      .length,
    1,
  );
});
test("invalid dates, past bookings, unauthorized status changes and invalid payments fail", async (t) => {
  const f = await fixture(t);
  const token = await f.login("Patient");
  const doctor = await f.login("Doctor");
  for (const appointment_date of ["2020-01-01", "2099-02-30", "invalid"])
    assert.equal(
      (
        await f.request(
          "/appointments",
          "POST",
          { ...slot(f.ids.doctor), appointment_date },
          token,
        )
      ).status,
      400,
    );
  const r = await f.request("/appointments", "POST", slot(f.ids.doctor), token);
  const id = r.body.data.id;
  assert.equal(
    (
      await f.request(
        `/appointments/${id}`,
        "PATCH",
        { status: "completed" },
        token,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}/payment`,
        "POST",
        { amount: -1, method: "cash" },
        doctor,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}/payment`,
        "POST",
        { amount: 1.0001, method: "cash" },
        doctor,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}`,
        "PATCH",
        { status: "cancelled" },
        token,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await f.request(
        `/appointments/${id}/payment`,
        "POST",
        { amount: 10, method: "cash" },
        doctor,
      )
    ).status,
    409,
  );
  assert.equal(
    (await f.request("/appointments", "POST", slot(f.ids.doctor), token))
      .status,
    201,
  );
});
test("suggestions are real, scoped, and reply changes persist", async (t) => {
  const f = await fixture(t);
  const patient = await f.login("Patient");
  const other = await f.login("OtherPatient");
  const admin = await f.login("Admin");
  assert.deepEqual(
    (await f.request("/suggestions", "GET", undefined, admin)).body.data,
    [],
  );
  const r = await f.request(
    "/suggestions",
    "POST",
    { category: "Agenda", message: "Please add an accessible calendar." },
    patient,
  );
  assert.equal(r.status, 201);
  assert.equal(
    (await f.request("/suggestions", "GET", undefined, other)).body.data.length,
    0,
  );
  assert.equal(
    (
      await f.request(
        `/suggestions/${r.body.data.id}`,
        "PATCH",
        { status: "planned", response: "Merci pour ce retour." },
        patient,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await f.request(
        `/suggestions/${r.body.data.id}`,
        "PATCH",
        { status: "planned", response: "Merci pour ce retour." },
        admin,
      )
    ).status,
    200,
  );
  assert.equal(
    (await f.request("/suggestions", "GET", undefined, patient)).body.data[0]
      .response,
    "Merci pour ce retour.",
  );
});
test("account creation is atomic on duplicate email; doctor team is scoped; applications do not fabricate accounts", async (t) => {
  const f = await fixture(t);
  const admin = await f.login("Admin");
  const doctor = await f.login("Doctor");
  const other = await f.login("OtherDoctor");
  const body = {
    name: "Real Practitioner",
    email: "real@example.test",
    password,
    role: "doctor",
    specialty: "Cardiologie",
    city: "Sfax",
    cnom: "Verified externally",
  };
  assert.equal((await f.request("/team", "POST", body, admin)).status, 201);
  assert.equal((await f.request("/team", "POST", body, admin)).status, 409);
  assert.equal((await f.request("/doctors")).body.data.length, 3);
  assert.equal(
    (
      await f.request(
        "/team",
        "POST",
        { ...body, email: "sec@example.test", role: "secretariat" },
        doctor,
      )
    ).status,
    201,
  );
  assert.equal(
    (await f.request("/team", "GET", undefined, doctor)).body.data.length,
    2,
  );
  assert.equal(
    (await f.request("/team", "GET", undefined, other)).body.data.length,
    0,
  );
  const application = await f.request("/applications", "POST", {
    name: "Applicant",
    email: "app@example.test",
    specialty: "Cardiologie",
    city: "Tunis",
    cnom: "CNOM-to-verify",
  });
  assert.equal(application.status, 201);
  assert.equal(
    (
      await f.request(
        `/applications/${application.body.id}`,
        "PATCH",
        { status: "reviewed" },
        admin,
      )
    ).status,
    200,
  );
  assert.equal((await f.request("/doctors")).body.data.length, 3);
  const dashboard = await f.request("/dashboard", "GET", undefined, admin);
  assert.equal(dashboard.body.doctors, 3);
  assert.equal(dashboard.body.pending_applications, 0);
});
test("production refuses absent signing keys and password changes require current password", async (t) => {
  const db = openDatabase(":memory:");
  t.after(() => db.close());
  assert.throws(
    () => createApp({ db, production: true, jwtSecret: "" }),
    /JWT_SECRET/,
  );
  const f = await fixture(t);
  const patient = await f.login("Patient");
  assert.equal(
    (
      await f.request(
        "/account/password",
        "PUT",
        { current_password: "wrong", password: "New-password-123!" },
        patient,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request(
        "/account/password",
        "PUT",
        { current_password: password, password: "New-password-123!" },
        patient,
      )
    ).status,
    200,
  );
  assert.equal(
    (await f.request("/auth/me", "GET", undefined, patient)).status,
    401,
  );
  assert.equal(
    (
      await f.request("/auth/login", "POST", {
        email: "patient@example.test",
        password,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await f.request("/auth/login", "POST", {
        email: "patient@example.test",
        password: "New-password-123!",
      })
    ).status,
    200,
  );
});

test("logout revokes signed tokens; passwords retain intentional whitespace; invalid request shapes fail", async (t) => {
  const f = await fixture(t);
  const token = await f.login("Patient");
  assert.equal(
    (await f.request("/auth/logout", "POST", {}, token)).status,
    200,
  );
  assert.equal(
    (await f.request("/auth/me", "GET", undefined, token)).status,
    401,
  );
  const spaced = "  Intentional spaces 123!  ";
  assert.equal(
    (
      await f.request("/auth/register", "POST", {
        name: "Whitespace User",
        email: "spaces@example.test",
        password: spaced,
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await f.request("/auth/login", "POST", {
        email: "spaces@example.test",
        password: spaced,
      })
    ).status,
    200,
  );
  assert.equal((await f.request("/auth/register", "POST", [])).status, 400);
});

test("first-party analytics accepts only opted-in public-page counters and protects aggregate reports", async (t) => {
  const f = await fixture(t);
  const admin = await f.login("Admin");
  const patient = await f.login("Patient");
  const send = async (body, headers = {}) => {
    const server = createApp({
      db: f.db,
      jwtSecret: "analytics-fixture-secret-at-least-32-characters",
      rateLimits: false,
    }).listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    try {
      return await fetch(
        `http://127.0.0.1:${server.address().port}/api/analytics/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(body),
        },
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  };
  assert.equal((await send({ page: "directory", consent: true })).status, 204);
  assert.equal((await send({ page: "directory", consent: false })).status, 400);
  assert.equal((await send({ page: "records", consent: true })).status, 400);
  assert.equal(
    (
      await send({
        page: "directory?email=private@example.test",
        consent: true,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await send({
        page: "directory",
        consent: true,
        email: "private@example.test",
      })
    ).status,
    400,
  );
  assert.equal(
    (await send({ page: "privacy", consent: true }, { DNT: "1" })).status,
    204,
  );
  assert.equal(
    (await send({ page: "privacy", consent: true }, { "Sec-GPC": "1" })).status,
    204,
  );
  assert.equal((await f.request("/analytics/summary")).status, 401);
  assert.equal(
    (await f.request("/analytics/summary", "GET", undefined, patient)).status,
    403,
  );
  f.db
    .prepare(
      "INSERT INTO analytics_daily(day,page,views) VALUES (date('now','-91 days'),'directory',99)",
    )
    .run();
  const result = await f.request("/analytics/summary", "GET", undefined, admin);
  assert.equal(result.status, 200);
  assert.equal(result.body.data.length, 1);
  assert.equal(result.body.data[0].views, 1);
  assert.equal(result.body.data[0].page, "directory");
  assert.deepEqual(
    f.db
      .prepare("PRAGMA table_info(analytics_daily)")
      .all()
      .map((c) => c.name),
    ["day", "page", "views"],
  );
  assert.equal(
    f.db.prepare("SELECT count(*) AS n FROM analytics_daily").get().n,
    1,
  );
});

test("SQLite online backup can be reopened independently with committed data intact", async (t) => {
  const f = await fixture(t);
  const { backupDatabase } = await import("../src/backup.js");
  const destination = join(
    tmpdir(),
    `medidesk-backup-${process.pid}-${Date.now()}.sqlite`,
  );
  t.after(() => rmSync(destination, { force: true }));
  await backupDatabase(f.filename, destination);
  const copy = openDatabase(destination);
  try {
    assert.equal(
      copy
        .prepare("SELECT count(*) AS n FROM users WHERE role='superadmin'")
        .get().n,
      1,
    );
    assert.equal(
      copy.prepare("PRAGMA integrity_check").get().integrity_check,
      "ok",
    );
  } finally {
    copy.close();
  }
});

test('password policy is enforced by the API and accepts eight characters', async (t) => {
  const f = await fixture(t);
  for (const password of ['Aa1!abc', 'abcdefgh1!', 'ABCDEFGH1!', 'Abcdefg!', 'Abcdefg1', 'Aa1!' + 'é'.repeat(35)]) {
    const r = await f.request('/auth/register', 'POST', {name:'Policy test', email:'policy@example.test', password});
    assert.equal(r.status, 400);
  }
  const r = await f.request('/auth/register', 'POST', {name:'Policy test', email:'policy@example.test', password:'Abcdef1!'});
  assert.equal(r.status, 201);
  const login = await f.request('/auth/login', 'POST', {email:'policy@example.test', password:'Abcdef1!'});
  assert.equal(login.status, 200);
  const change = await f.request('/account/password', 'PUT', {current_password:'Abcdef1!', password:'abcdefgh'}, login.body.token);
  assert.equal(change.status, 400);
});
