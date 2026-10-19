import {
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { validPassword, passwordHelp } from "./password-policy.js";
import { smtpConfigured } from "./mail.js";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function base32(bytes) {
  let bits = 0,
    value = 0,
    out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}
function decode(value) {
  let bits = 0,
    n = 0,
    bytes = [];
  for (const c of value) {
    const i = alphabet.indexOf(c);
    if (i < 0) throw Error("Invalid authenticator secret");
    n = (n << 5) | i;
    bits += 5;
    if (bits >= 8) {
      bytes.push((n >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}
export function totp(secret, counter = Math.floor(Date.now() / 30000)) {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", decode(secret)).update(b).digest();
  const o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1000000).padStart(6, "0");
}
const hash = (value) => createHash("sha256").update(value).digest("hex");
const safeEqual = (a, b) =>
  typeof b === "string" &&
  a.length === b.length &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function accountSecurity({
  db,
  vault,
  fail,
  wrap,
  audit,
  issueSession,
  transport,
}) {
  db.exec(`CREATE TABLE IF NOT EXISTS account_mfa(user_id INTEGER PRIMARY KEY REFERENCES users(id),secret TEXT,pending_secret TEXT,pending_until INTEGER,enabled INTEGER NOT NULL DEFAULT 0,last_counter INTEGER NOT NULL DEFAULT -1,recovery TEXT NOT NULL DEFAULT '[]');
 CREATE TABLE IF NOT EXISTS account_challenges(hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),version INTEGER NOT NULL,expires INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE IF NOT EXISTS account_tokens(hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),kind TEXT NOT NULL,version INTEGER NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS account_emails(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),token_hash TEXT NOT NULL,payload TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'pending');
 CREATE TABLE IF NOT EXISTS account_verifications(user_id INTEGER PRIMARY KEY REFERENCES users(id),verified_at TEXT NOT NULL);`);
  const one = (sql, ...a) => db.prepare(sql).get(...a),
    run = (sql, ...a) => db.prepare(sql).run(...a);
  const now = () => Date.now();
  const enabled = (id) =>
    one("SELECT * FROM account_mfa WHERE user_id=? AND enabled=1", id);
  const current = (id) => one("SELECT * FROM users WHERE id=?", id);
  const available = () => !!transport || smtpConfigured();
  const tx = (fn) => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const out = fn();
      db.exec("COMMIT");
      return out;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  };
  function checkCode(row, code) {
    if (typeof code !== "string") return null;
    if (/^\d{6}$/.test(code))
      for (const delta of [0, -1, 1]) {
        const counter = Math.floor(now() / 30000) + delta;
        if (
          counter > row.last_counter &&
          safeEqual(totp(vault().open(row.secret), counter), code)
        )
          return { counter };
      }
    const recovery = JSON.parse(row.recovery);
    const index = recovery.indexOf(
      hash(code.replaceAll("-", "").toLowerCase()),
    );
    if (index >= 0) return { recovery: recovery.filter((_, i) => i !== index) };
    return null;
  }
  function consume(row, match) {
    if (match.recovery)
      run(
        "UPDATE account_mfa SET recovery=? WHERE user_id=?",
        JSON.stringify(match.recovery),
        row.user_id,
      );
    else
      run(
        "UPDATE account_mfa SET last_counter=? WHERE user_id=?",
        match.counter,
        row.user_id,
      );
  }
  function challenge(user) {
    const token = randomBytes(32).toString("hex");
    run("DELETE FROM account_challenges WHERE expires<?", now());
    run(
      "INSERT INTO account_challenges(hash,user_id,version,expires) VALUES (?,?,?,?)",
      hash(token),
      user.id,
      user.session_version,
      now() + 5 * 60000,
    );
    return { requires_mfa: true, challenge: token };
  }
  const login = (user) =>
    enabled(user.id) ? challenge(user) : issueSession(user);
  async function password(user, value) {
    if (
      typeof value !== "string" ||
      value.length > 200 ||
      !(await bcrypt.compare(value, user.password_hash))
    )
      throw fail(400, "Mot de passe actuel incorrect.");
    if (current(user.id)?.session_version !== user.session_version)
      throw fail(401, "Session expirée.");
  }
  function queue(user, kind) {
    const recent = one(
      "SELECT 1 FROM account_tokens WHERE user_id=? AND kind=? AND expires>?",
      user.id,
      kind,
      now() + 29 * 60000,
    );
    if (recent) return;
    const code = randomBytes(24).toString("hex");
    tx(() => {
      run(
        "DELETE FROM account_tokens WHERE user_id=? AND kind=?",
        user.id,
        kind,
      );
      run(
        "INSERT INTO account_tokens(hash,user_id,kind,version,expires) VALUES (?,?,?,?,?)",
        hash(code),
        user.id,
        kind,
        user.session_version,
        now() + 30 * 60000,
      );
      run(
        "INSERT INTO account_emails(user_id,token_hash,payload) VALUES (?,?,?)",
        user.id,
        hash(code),
        vault().pack({
          subject:
            kind === "reset"
              ? "MediDesk · récupération du compte"
              : "MediDesk · vérification de votre email",
          text: `Votre code MediDesk : ${code}\nValable 30 minutes, une seule utilisation. Saisissez-le dans MediDesk. Ne le communiquez à personne. Si vous n’avez rien demandé, ignorez cet email.`,
        }),
      );
    });
  }
  function publicRoutes(app) {
    app.post(
      "/api/auth/verify-2fa",
      wrap((req, res) => {
        const c =
          typeof req.body.challenge === "string"
            ? one(
                "SELECT * FROM account_challenges WHERE hash=?",
                hash(req.body.challenge),
              )
            : null;
        const user = c && current(c.user_id),
          row = user && enabled(user.id);
        if (
          !c ||
          !user ||
          !row ||
          c.expires < now() ||
          c.attempts >= 5 ||
          c.version !== user.session_version
        )
          throw fail(
            401,
            "Vérification expirée ou invalide. Reconnectez-vous.",
          );
        run(
          "UPDATE account_challenges SET attempts=attempts+1 WHERE hash=?",
          c.hash,
        );
        const match = checkCode(row, req.body.code);
        if (!match) throw fail(401, "Code incorrect ou déjà utilisé.");
        tx(() => {
          consume(row, match);
          run("DELETE FROM account_challenges WHERE hash=?", c.hash);
        });
        audit(user.id, "session.mfa_login");
        res.json(issueSession(user));
      }),
    );
    app.post(
      "/api/auth/forgot-password",
      wrap((req, res) => {
        if (!available())
          throw fail(
            503,
            "La récupération par email nécessite la configuration Gmail du cabinet.",
          );
        const user =
          typeof req.body.email === "string" &&
          one(
            "SELECT * FROM users WHERE email=?",
            req.body.email.trim().toLowerCase(),
          );
        if (user && !user.email.endsWith("@patients.invalid"))
          queue(user, "reset");
        res
          .status(202)
          .json({
            message:
              "Si cette adresse correspond à un compte, un email de récupération sera envoyé.",
          });
      }),
    );
    app.post(
      "/api/auth/reset-password",
      wrap(async (req, res) => {
        if (!validPassword(req.body.password)) throw fail(400, passwordHelp);
        const token =
          typeof req.body.code === "string" &&
          one(
            "SELECT * FROM account_tokens WHERE hash=? AND kind='reset'",
            hash(req.body.code),
          );
        const user = token && current(token.user_id);
        if (
          !user ||
          token.expires < now() ||
          token.version !== user.session_version
        )
          throw fail(400, "Code expiré ou invalide.");
        const encoded = await bcrypt.hash(req.body.password, 12);
        tx(() => {
          const still = one(
            "SELECT * FROM account_tokens WHERE hash=?",
            token.hash,
          );
          if (
            !still ||
            still.expires < now() ||
            current(user.id)?.session_version !== token.version
          )
            throw fail(400, "Code expiré ou invalide.");
          run(
            "UPDATE users SET password_hash=?,session_version=session_version+1 WHERE id=?",
            encoded,
            user.id,
          );
          run("DELETE FROM account_tokens WHERE user_id=?", user.id);
          run("DELETE FROM account_challenges WHERE user_id=?", user.id);
        });
        audit(user.id, "password.recovered");
        res.json({
          message:
            "Mot de passe modifié. Reconnectez-vous ; la double authentification reste active.",
        });
      }),
    );
  }
  function privateRoutes(app, limiter) {
    app.use("/api/account/security", limiter);
    app.get("/api/account/security", (req, res) => {
      const row = enabled(req.user.id);
      res.json({
        data: {
          mfa_enabled: !!row,
          recovery_remaining: row ? JSON.parse(row.recovery).length : 0,
          email_verified: !!one(
            "SELECT 1 FROM account_verifications WHERE user_id=?",
            req.user.id,
          ),
          smtp_configured: available(),
        },
      });
    });
    app.post(
      "/api/account/security/mfa/setup",
      wrap(async (req, res) => {
        await password(req.user, req.body.password);
        if (enabled(req.user.id))
          throw fail(409, "La double authentification est déjà active.");
        const secret = base32(randomBytes(20));
        run(
          "INSERT INTO account_mfa(user_id,pending_secret,pending_until) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET pending_secret=excluded.pending_secret,pending_until=excluded.pending_until",
          req.user.id,
          vault().seal(secret),
          now() + 10 * 60000,
        );
        res.json({
          secret,
          uri: `otpauth://totp/${encodeURIComponent("MediDesk:" + req.user.email)}?secret=${secret}&issuer=MediDesk&algorithm=SHA1&digits=6&period=30`,
        });
      }),
    );
    app.post(
      "/api/account/security/mfa/enable",
      wrap((req, res) => {
        const row = one(
          "SELECT * FROM account_mfa WHERE user_id=?",
          req.user.id,
        );
        if (!row?.pending_secret || row.pending_until < now() || row.enabled)
          throw fail(400, "Configuration expirée. Recommencez.");
        const match = checkCode(
          {
            ...row,
            secret: row.pending_secret,
            last_counter: -1,
            recovery: "[]",
          },
          req.body.code,
        );
        if (!match) throw fail(400, "Code incorrect.");
        const codes = Array.from({ length: 10 }, () =>
          randomBytes(16).toString("hex"),
        );
        tx(() => {
          run(
            "UPDATE account_mfa SET secret=pending_secret,pending_secret=NULL,pending_until=NULL,enabled=1,last_counter=?,recovery=? WHERE user_id=?",
            match.counter,
            JSON.stringify(codes.map(hash)),
            req.user.id,
          );
          run(
            "UPDATE users SET session_version=session_version+1 WHERE id=?",
            req.user.id,
          );
        });
        audit(req.user.id, "mfa.enabled");
        res.json({
          ...issueSession(current(req.user.id)),
          recovery_codes: codes,
        });
      }),
    );
    app.post(
      "/api/account/security/mfa/disable",
      wrap(async (req, res) => {
        await password(req.user, req.body.password);
        const row = enabled(req.user.id),
          match = row && checkCode(row, req.body.code);
        if (!match) throw fail(400, "Code incorrect ou déjà utilisé.");
        tx(() => {
          run("DELETE FROM account_mfa WHERE user_id=?", req.user.id);
          run(
            "UPDATE users SET session_version=session_version+1 WHERE id=?",
            req.user.id,
          );
        });
        audit(req.user.id, "mfa.disabled");
        res.json(issueSession(current(req.user.id)));
      }),
    );
    app.post(
      "/api/account/security/email/send",
      wrap((req, res) => {
        if (!available())
          throw fail(
            503,
            "Configurez Gmail sur le serveur pour envoyer la vérification.",
          );
        queue(req.user, "verify");
        res
          .status(202)
          .json({ message: "Email de vérification en attente d’envoi." });
      }),
    );
    app.post(
      "/api/account/security/email/confirm",
      wrap((req, res) => {
        const token =
          typeof req.body.code === "string" &&
          one(
            "SELECT * FROM account_tokens WHERE hash=? AND kind='verify' AND user_id=?",
            hash(req.body.code),
            req.user.id,
          );
        if (
          !token ||
          token.expires < now() ||
          token.version !== req.user.session_version
        )
          throw fail(400, "Code expiré ou invalide.");
        tx(() => {
          run(
            "INSERT OR REPLACE INTO account_verifications(user_id,verified_at) VALUES (?,datetime('now'))",
            req.user.id,
          );
          run("DELETE FROM account_tokens WHERE hash=?", token.hash);
        });
        audit(req.user.id, "email.verified");
        res.json({ message: "Adresse email vérifiée." });
      }),
    );
  }
  let running = false;
  async function sendEmail() {
    if (running || !available()) return;
    running = true;
    try {
      const mailer =
        transport ||
        nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          tls: { minVersion: "TLSv1.2" },
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
          connectionTimeout: 10000,
          socketTimeout: 15000,
        });
      for (const job of db
        .prepare(
          "SELECT q.*,u.email FROM account_emails q JOIN users u ON u.id=q.user_id WHERE status='pending' AND attempts<3 ORDER BY id LIMIT 20",
        )
        .all()) {
        const token = one(
          "SELECT * FROM account_tokens WHERE hash=?",
          job.token_hash,
        );
        if (
          !token ||
          token.expires < now() ||
          token.version !== current(job.user_id)?.session_version
        ) {
          run(
            "UPDATE account_emails SET status='cancelled',payload='' WHERE id=?",
            job.id,
          );
          continue;
        }
        run("UPDATE account_emails SET attempts=attempts+1 WHERE id=?", job.id);
        try {
          await mailer.sendMail({
            from: process.env.SMTP_FROM,
            to: job.email,
            ...vault().unpack(job.payload),
          });
          run(
            "UPDATE account_emails SET status='sent',payload='' WHERE id=?",
            job.id,
          );
        } catch {
          run(
            "UPDATE account_emails SET status=CASE WHEN attempts>=3 THEN 'failed' ELSE 'pending' END WHERE id=?",
            job.id,
          );
        }
      }
      run("DELETE FROM account_challenges WHERE expires<?", now());
      run("DELETE FROM account_tokens WHERE expires<?", now());
      run(
        "DELETE FROM account_emails WHERE status IN ('sent','cancelled') OR (status='failed' AND NOT EXISTS (SELECT 1 FROM account_tokens t WHERE t.hash=account_emails.token_hash))",
      );
    } finally {
      running = false;
    }
  }
  return { login, publicRoutes, privateRoutes, sendEmail };
}
