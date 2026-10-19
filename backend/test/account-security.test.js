import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import bcrypt from "bcryptjs";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { totp, base32 } from "../src/account-security.js";
async function fixture(t, { mail = true, failMail = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "medidesk-account-")),
    db = openDatabase(join(dir, "db.sqlite"));
  const sent = [];
  const password = "Account-fixture-8!";
  db.prepare(
    "INSERT INTO users(name,email,password_hash,role) VALUES ('Patient','patient@example.test',?,'patient')",
  ).run(await bcrypt.hash(password, 4));
  const transport = {
    sendMail: async (message) => {
      if (failMail) throw Error("Test SMTP failure");
      sent.push(message);
    },
  };
  const app = createApp({
    db,
    jwtSecret: "account-test-signing-key-at-least-32",
    rateLimits: false,
    ...(mail ? { securityMailTransport: transport } : {}),
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, method = "GET", body, token) {
    const r = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: r.status, body: await r.json() };
  }
  const login = () =>
    request("/auth/login", "POST", { email: "patient@example.test", password });
  const original = (await login()).body.token;
  t.after(async () => {
    await new Promise((r) => server.close(r));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  async function enable() {
    const setup = await request(
      "/account/security/mfa/setup",
      "POST",
      { password },
      original,
    );
    assert.equal(setup.status, 200);
    const response = await request(
      "/account/security/mfa/enable",
      "POST",
      { code: totp(setup.body.secret) },
      original,
    );
    assert.equal(response.status, 200);
    return { ...response.body, secret: setup.body.secret };
  }
  return { db, app, request, login, password, token: original, sent, enable };
}
test("TOTP follows the RFC 6238 SHA-1 vector and manual setup uses base32", () => {
  const secret = base32(Buffer.from("12345678901234567890"));
  assert.equal(secret, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  assert.equal(totp(secret, 1), "287082");
});
test("MFA setup requires current password, expires and rejects invalid codes", async (t) => {
  const f = await fixture(t);
  assert.equal(
    (
      await f.request(
        "/account/security/mfa/setup",
        "POST",
        { password: "wrong" },
        f.token,
      )
    ).status,
    400,
  );
  const s = await f.request(
    "/account/security/mfa/setup",
    "POST",
    { password: f.password },
    f.token,
  );
  assert.ok(s.body.uri.startsWith("otpauth://"));
  assert.equal(
    (
      await f.request(
        "/account/security/mfa/enable",
        "POST",
        { code: "bad" },
        f.token,
      )
    ).status,
    400,
  );
  f.db.prepare("UPDATE account_mfa SET pending_until=0").run();
  assert.equal(
    (
      await f.request(
        "/account/security/mfa/enable",
        "POST",
        { code: totp(s.body.secret) },
        f.token,
      )
    ).status,
    400,
  );
});
test("enabling MFA revokes old sessions and encrypts secrets; login needs the second factor", async (t) => {
  const f = await fixture(t);
  const e = await f.enable();
  assert.equal((await f.request("/auth/me", "GET", null, f.token)).status, 401);
  const row = f.db.prepare("SELECT * FROM account_mfa").get();
  assert.ok(row.secret.startsWith("mdenc:v1:"));
  assert.ok(!row.secret.includes(e.secret));
  assert.ok(!row.recovery.includes(e.recovery_codes[0]));
  const l = await f.login();
  assert.equal(l.body.requires_mfa, true);
  assert.equal(l.body.token, undefined);
  const ok = await f.request("/auth/verify-2fa", "POST", {
    challenge: l.body.challenge,
    code: totp(e.secret, Math.floor(Date.now() / 30000) + 1),
  });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);
  assert.equal(
    (
      await f.request("/auth/verify-2fa", "POST", {
        challenge: l.body.challenge,
        code: e.recovery_codes[0],
      })
    ).status,
    401,
  );
});
test("recovery codes are single-use and challenge guesses are capped at five", async (t) => {
  const f = await fixture(t),
    e = await f.enable();
  const a = await f.login();
  assert.equal(
    (
      await f.request("/auth/verify-2fa", "POST", {
        challenge: a.body.challenge,
        code: e.recovery_codes[0],
      })
    ).status,
    200,
  );
  const b = await f.login();
  assert.equal(
    (
      await f.request("/auth/verify-2fa", "POST", {
        challenge: b.body.challenge,
        code: e.recovery_codes[0],
      })
    ).status,
    401,
  );
  for (let i = 0; i < 4; i++)
    assert.equal(
      (
        await f.request("/auth/verify-2fa", "POST", {
          challenge: b.body.challenge,
          code: "wrong",
        })
      ).status,
      401,
    );
  assert.equal(
    (
      await f.request("/auth/verify-2fa", "POST", {
        challenge: b.body.challenge,
        code: e.recovery_codes[1],
      })
    ).status,
    401,
  );
});
test("used TOTP counters cannot be replayed in another login challenge", async (t) => {
  const f = await fixture(t),
    e = await f.enable();
  const a = await f.login();
  assert.equal(
    (
      await f.request("/auth/verify-2fa", "POST", {
        challenge: a.body.challenge,
        code: totp(
          e.secret,
          f.db.prepare("SELECT last_counter FROM account_mfa").get()
            .last_counter,
        ),
      })
    ).status,
    401,
  );
});
test("MFA disable needs password and a valid second factor and revokes sessions", async (t) => {
  const f = await fixture(t),
    e = await f.enable();
  assert.equal(
    (
      await f.request(
        "/account/security/mfa/disable",
        "POST",
        { password: "wrong", code: e.recovery_codes[0] },
        e.token,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request(
        "/account/security/mfa/disable",
        "POST",
        { password: f.password, code: "bad" },
        e.token,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request(
        "/account/security/mfa/disable",
        "POST",
        { password: f.password, code: e.recovery_codes[0] },
        e.token,
      )
    ).status,
    200,
  );
  assert.equal((await f.request("/auth/me", "GET", null, e.token)).status, 401);
  assert.ok((await f.login()).body.token);
});
test("password recovery is non-enumerating and mail queue encrypts codes without clinical content", async (t) => {
  const f = await fixture(t);
  const real = await f.request("/auth/forgot-password", "POST", {
      email: "patient@example.test",
    }),
    unknown = await f.request("/auth/forgot-password", "POST", {
      email: "unknown@example.test",
    });
  assert.deepEqual(real, unknown);
  assert.equal(real.status, 202);
  const queue = f.db.prepare("SELECT * FROM account_emails").get();
  assert.ok(queue.payload.startsWith("mdenc:v1:"));
  await f.app.locals.accountSecurity.sendEmail();
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].to, "patient@example.test");
  assert.ok(!/diagnostic|prescription|allerg/i.test(f.sent[0].text));
  assert.equal(
    f.db.prepare("SELECT count(*) n FROM account_emails").get().n,
    0,
  );
});
test("recovery codes expire, are single use and password recovery preserves MFA", async (t) => {
  const f = await fixture(t),
    e = await f.enable();
  await f.request("/auth/forgot-password", "POST", {
    email: "patient@example.test",
  });
  await f.app.locals.accountSecurity.sendEmail();
  const code = f.sent[0].text.match(/[a-f0-9]{48}/)[0];
  assert.ok(
    !JSON.stringify(
      f.db.prepare("SELECT * FROM account_tokens").get(),
    ).includes(code),
  );
  const r = await f.request("/auth/reset-password", "POST", {
    code,
    password: "Recovered1!",
  });
  assert.equal(r.status, 200);
  assert.equal(
    (
      await f.request("/auth/reset-password", "POST", {
        code,
        password: "Recovered2!",
      })
    ).status,
    400,
  );
  assert.equal((await f.request("/auth/me", "GET", null, e.token)).status, 401);
  const l = await f.request("/auth/login", "POST", {
    email: "patient@example.test",
    password: "Recovered1!",
  });
  assert.equal(l.body.requires_mfa, true);
});
test("expired recovery codes fail closed", async (t) => {
  const f = await fixture(t);
  await f.request("/auth/forgot-password", "POST", {
    email: "patient@example.test",
  });
  await f.app.locals.accountSecurity.sendEmail();
  const code = f.sent[0].text.match(/[a-f0-9]{48}/)[0];
  f.db.prepare("UPDATE account_tokens SET expires=0").run();
  assert.equal(
    (
      await f.request("/auth/reset-password", "POST", {
        code,
        password: "Recovered1!",
      })
    ).status,
    400,
  );
});
test("email verification requires the owning session and single-use code", async (t) => {
  const f = await fixture(t);
  await f.request("/account/security/email/send", "POST", {}, f.token);
  await f.app.locals.accountSecurity.sendEmail();
  const code = f.sent[0].text.match(/[a-f0-9]{48}/)[0];
  assert.equal(
    (
      await f.request(
        "/account/security/email/confirm",
        "POST",
        { code: "bad" },
        f.token,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request(
        "/account/security/email/confirm",
        "POST",
        { code },
        f.token,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await f.request(
        "/account/security/email/confirm",
        "POST",
        { code },
        f.token,
      )
    ).status,
    400,
  );
  assert.equal(
    (await f.request("/account/security", "GET", null, f.token)).body.data
      .email_verified,
    true,
  );
});
test("account mails never claim success on SMTP delivery failure", async (t) => {
  const f = await fixture(t, { failMail: true });
  await f.request("/auth/forgot-password", "POST", {
    email: "patient@example.test",
  });
  for (let i = 0; i < 3; i++) await f.app.locals.accountSecurity.sendEmail();
  const job = f.db.prepare("SELECT status,attempts FROM account_emails").get();
  assert.equal(job.status, "failed");
  assert.equal(job.attempts, 3);
  assert.equal(f.sent.length, 0);
});
