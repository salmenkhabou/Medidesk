// Isolated offensive regression checks: temporary accounts, no production target.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { createVault } from "../src/vault.js";
import { encryptBackup, decryptBackup } from "../src/backup-codec.js";
const secret = "security-test-signing-key-at-least-32-characters";
async function fixture(t, rateLimits = false) {
  const dir = mkdtempSync(join(tmpdir(), "medidesk-security-"));
  const db = openDatabase(join(dir, "db.sqlite"));
  const password = "Security-fixture-8!";
  const hash = await bcrypt.hash(password, 4);
  const ids = {};
  for (const [role, doctor] of [
    ["doctor"],
    ["secretariat", "doctor"],
    ["patient"],
    ["superadmin"],
  ])
    ids[role] = Number(
      db
        .prepare(
          "INSERT INTO users(name,email,password_hash,role,doctor_id) VALUES (?,?,?,?,?)",
        )
        .run(
          role,
          role + "@example.test",
          hash,
          role,
          doctor ? ids[doctor] : null,
        ).lastInsertRowid,
    );
  const app = createApp({ db, jwtSecret: secret, rateLimits });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = (role = "patient", claims = {}, options = {}) =>
    jwt.sign({ version: 0, ...claims }, secret, {
      issuer: "medidesk",
      subject: String(ids[role]),
      expiresIn: "1h",
      ...options,
    });
  const request = async (
    path,
    { method = "GET", body, auth, headers = {} } = {},
  ) => {
    const r = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...(auth ? { authorization: "Bearer " + auth } : {}),
        ...headers,
      },
      ...(body !== undefined
        ? { body: typeof body === "string" ? body : JSON.stringify(body) }
        : {}),
    });
    return { status: r.status, headers: r.headers, text: await r.text() };
  };
  t.after(async () => {
    await new Promise((r) => server.close(r));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { db, ids, token, request, password, dir };
}

test("JWT rejects forgery, none/other algorithms, wrong issuer, expiry and deleted identities", async (t) => {
  const f = await fixture(t);
  const claims = {
    sub: String(f.ids.patient),
    version: 0,
    iss: "medidesk",
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const none =
    Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(JSON.stringify(claims)).toString("base64url") +
    ".";
  for (const token of [
    none,
    "not-a-token",
    jwt.sign(claims, "attacker-key"),
    f.token("patient", {}, { algorithm: "HS384" }),
    f.token("patient", {}, { issuer: "attacker" }),
    f.token("patient", {}, { expiresIn: -10 }),
    f.token("patient", { version: 99 }),
    f.token("patient", {}, { subject: "99999999" }),
  ])
    assert.equal(
      (await f.request("/api/auth/me", { auth: token })).status,
      401,
    );
  assert.equal(
    (
      await f.request("/api/audit", {
        auth: f.token("patient", { role: "superadmin" }),
      })
    ).status,
    403,
  );
});

test("every representative private route denies anonymous access", async (t) => {
  const f = await fixture(t);
  for (const path of [
    "/auth/me",
    "/patients",
    "/patients/1",
    "/patients/1/documents",
    "/documents/1",
    "/patients/1/vitals",
    "/messages",
    "/invoices",
    "/reports",
    "/appointments",
    "/consultations",
    "/payments",
    "/team",
    "/audit",
    "/notifications",
    "/security/status",
    "/capabilities",
  ])
    assert.equal((await f.request("/api" + path)).status, 401, path);
});

test("medical routes reject secretary/admin and authority comes from database, not submitted role", async (t) => {
  const f = await fixture(t);
  for (const role of ["secretariat", "superadmin"])
    for (const path of [
      "/api/messages",
      `/api/patients/${f.ids.patient}/documents`,
      `/api/patients/${f.ids.patient}/vitals`,
    ])
      assert.equal(
        (await f.request(path, { auth: f.token(role) })).status,
        403,
        role + path,
      );
  const result = await f.request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Injection tester",
      email: "new@example.test",
      password: "Abcdef1!",
      role: "superadmin",
      doctor_id: f.ids.doctor,
      session_version: 999,
    },
  });
  assert.equal(result.status, 201);
  assert.equal(
    f.db
      .prepare("SELECT role,doctor_id,session_version FROM users WHERE email=?")
      .get("new@example.test").role,
    "patient",
  );
  assert.equal(
    (
      await f.request("/api/team", {
        method: "POST",
        auth: f.token("patient"),
        body: { role: "superadmin" },
      })
    ).status,
    403,
  );
});

test("SQL injection cannot bypass login or change query scope and invalid identifiers fail closed", async (t) => {
  const f = await fixture(t);
  const r = await f.request("/api/auth/login", {
    method: "POST",
    body: { email: "'OR/**/1=1--@example.test", password: f.password },
  });
  assert.equal(r.status, 401);
  const list = await f.request(
    "/api/patients?q=" + encodeURIComponent("' OR 1=1; DROP TABLE users; --"),
    { auth: f.token("doctor") },
  );
  assert.equal(list.status, 200);
  assert.deepEqual(JSON.parse(list.text).data, []);
  for (const id of ["1 OR 1=1", "-1", "1e100", "NaN", "1;DROP TABLE users"]) {
    const r = await f.request("/api/patients/" + encodeURIComponent(id), {
      auth: f.token("doctor"),
    });
    assert.ok([400, 404].includes(r.status));
  }
  assert.equal(f.db.prepare("SELECT count(*) AS n FROM users").get().n, 4);
});

test("malformed and oversized JSON never echo secrets or stack traces", async (t) => {
  const f = await fixture(t);
  const secretMarker = "sensitive-password-marker";
  for (const [body, status] of [
    ['{"password":"' + secretMarker + '",}', 400],
    ["[]", 400],
    ["null", 400],
    ['{"padding":"' + "x".repeat(5 * 1024 * 1024) + '"}', 413],
  ]) {
    const r = await f.request("/api/auth/register", { method: "POST", body });
    assert.equal(r.status, status);
    assert.ok(!r.text.includes(secretMarker));
    assert.ok(!/SyntaxError|node_modules|at file:|SELECT .*FROM/i.test(r.text));
  }
  assert.equal((await f.request("/api/health")).status, 200);
});

test("CORS denies hostile origins; protected requests still require bearer authorization", async (t) => {
  const f = await fixture(t);
  for (const method of ["GET", "OPTIONS", "POST"]) {
    const r = await f.request("/api/auth/login", {
      method,
      headers: { origin: "https://evil.example" },
    });
    assert.equal(r.status, 403);
    assert.equal(r.headers.get("access-control-allow-origin"), null);
  }
  const valid = await f.request("/api/health", {
    headers: { origin: "http://localhost:5173" },
  });
  assert.equal(
    valid.headers.get("access-control-allow-origin"),
    "http://localhost:5173",
  );
  assert.equal(
    (
      await f.request("/api/auth/me", {
        headers: { origin: "http://localhost:5173" },
      })
    ).status,
    401,
  );
});

test("API responses disable caching and expose security headers without technology disclosure", async (t) => {
  const f = await fixture(t);
  for (const path of ["/api/health", "/api/auth/me"]) {
    const r = await f.request(path);
    assert.match(r.headers.get("cache-control") || "", /no-store/);
    assert.equal(r.headers.get("x-content-type-options"), "nosniff");
    assert.equal(r.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.equal(r.headers.get("x-powered-by"), null);
  }
});

test("authentication throttles cheap invalid attempts even when attacker changes forwarded IP headers", async (t) => {
  const f = await fixture(t, true);
  for (let i = 0; i < 30; i++)
    assert.equal(
      (
        await f.request("/api/auth/login", {
          method: "POST",
          body: { email: "invalid" },
          headers: { "x-forwarded-for": `198.51.100.${i + 1}` },
        })
      ).status,
      400,
    );
  const r = await f.request("/api/auth/login", {
    method: "POST",
    body: { email: "invalid" },
    headers: { "x-forwarded-for": "203.0.113.99" },
  });
  assert.equal(r.status, 429);
  assert.ok(r.headers.get("retry-after"));
});

test("logout and password change invalidate all old sessions, current password is required", async (t) => {
  const f = await fixture(t);
  const old = f.token();
  assert.equal(
    (
      await f.request("/api/account/password", {
        method: "PUT",
        auth: old,
        body: { current_password: "wrong", password: "Changed1!" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request("/api/account/password", {
        method: "PUT",
        auth: old,
        body: { current_password: f.password, password: "Changed1!" },
      })
    ).status,
    200,
  );
  assert.equal((await f.request("/api/auth/me", { auth: old })).status, 401);
  const current = f.token("patient", { version: 1 });
  assert.equal(
    (
      await f.request("/api/auth/logout", {
        method: "POST",
        auth: current,
        body: {},
      })
    ).status,
    200,
  );
  assert.equal(
    (await f.request("/api/auth/me", { auth: current })).status,
    401,
  );
});

test("AES-GCM uses unique nonces and rejects tampering and wrong keys", () => {
  const a = createVault({ key: "a".repeat(64), production: true }),
    b = createVault({ key: "b".repeat(64), production: true });
  const one = a.seal("secret medical note");
  const two = a.seal("secret medical note");
  assert.notEqual(one, two);
  assert.equal(a.open(one), "secret medical note");
  assert.throws(() => b.open(one));
  const bytes = Buffer.from(one.slice(9), "base64");
  bytes[bytes.length - 1] ^= 1;
  assert.throws(() => a.open("mdenc:v1:" + bytes.toString("base64")));
  assert.throws(() => createVault({ production: true, key: "invalid" }));
});

test("backup decryption must never delete or overwrite an existing destination", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "medidesk-backup-security-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const old = process.env.HEALTH_DATA_KEY;
  process.env.HEALTH_DATA_KEY = "a".repeat(64);
  t.after(() => {
    if (old === undefined) delete process.env.HEALTH_DATA_KEY;
    else process.env.HEALTH_DATA_KEY = old;
  });
  const source = join(dir, "source"),
    archive = join(dir, "archive"),
    target = join(dir, "target");
  writeFileSync(source, "private-backup");
  writeFileSync(target, "existing-data");
  await encryptBackup(source, archive);
  await assert.rejects(decryptBackup(archive, target));
  assert.ok(existsSync(target));
  assert.equal(readFileSync(target, "utf8"), "existing-data");
  const clean = join(dir, "clean");
  await decryptBackup(archive, clean);
  assert.equal(readFileSync(clean, "utf8"), "private-backup");
  assert.equal(statSync(clean).mode & 0o777, 0o600);
  const damaged = readFileSync(archive);
  damaged[damaged.length - 1] ^= 1;
  writeFileSync(archive, damaged);
  const partial = join(dir, "partial");
  await assert.rejects(decryptBackup(archive, partial));
  assert.ok(!existsSync(partial));
});
