import { validPassword, passwordHelp } from "./password-policy.js";
import { installPractice } from "./practice.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { openDatabase } from "./db/database.js";

const publicUser = ({ password_hash, session_version, ...user }) => user;
const fail = (status, message) => Object.assign(new Error(message), { status });
const text = (value, label, min = 1, max = 500) => {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    throw fail(400, `${label} : ${min} à ${max} caractères requis.`);
  return value.trim();
};
const emailAddress = (value) => {
  const email = text(value, "Email", 5, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw fail(400, "Adresse email invalide.");
  return email;
};
const passwordValue = (value) => {
  if (!validPassword(value)) throw fail(400, passwordHelp);
  return value;
};
const providedPassword = (value) => {
  if (typeof value !== "string" || value.length < 1 || value.length > 200)
    throw fail(400, "Mot de passe requis.");
  return value;
};
const integer = (value) => {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1)
    throw fail(400, "Identifiant invalide.");
  return n;
};

export function createApp({
  db = openDatabase(),
  jwtSecret = process.env.JWT_SECRET,
  production = process.env.NODE_ENV === "production",
  rateLimits = true,
} = {}) {
  if (production && (!jwtSecret || jwtSecret.length < 32))
    throw Error("JWT_SECRET (32 caractères minimum) est requis en production.");
  const secret = jwtSecret || randomBytes(48).toString("hex");
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use(helmet());
  const origins = (
    process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((s) => s.trim());
  app.use(
    cors({
      origin(origin, callback) {
        callback(
          origin && !origins.includes(origin)
            ? fail(403, "Origine non autorisée.")
            : null,
          true,
        );
      },
    }),
  );
  app.use(express.json({ limit: "5mb" }));
  app.use((req, res, next) => {
    if (
      ["POST", "PUT", "PATCH"].includes(req.method) &&
      (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    )
      return next(fail(400, "Un objet JSON est requis."));
    next();
  });
  if (rateLimits) {
    app.use(
      "/api",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 500,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { message: "Trop de requêtes. Réessayez plus tard." },
      }),
    );
    app.use(
      "/api/auth",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 30,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { message: "Trop de tentatives. Réessayez dans 15 minutes." },
      }),
    );
  }
  const one = (sql, ...args) => db.prepare(sql).get(...args);
  const all = (sql, ...args) => db.prepare(sql).all(...args);
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  const audit = (id, action) =>
    run("INSERT INTO audit_events(user_id, action) VALUES (?,?)", id, action);
  const wrap = (fn) => (req, res, next) =>
    Promise.resolve()
      .then(() => fn(req, res))
      .catch(next);
  const auth = (req, res, next) => {
    try {
      const match = /^Bearer (\S+)$/.exec(req.headers.authorization || "");
      if (!match) throw Error();
      const token = jwt.verify(match[1], secret, {
        algorithms: ["HS256"],
        issuer: "medidesk",
      });
      req.user = one("SELECT * FROM users WHERE id=?", Number(token.sub));
      if (!req.user || token.version !== req.user.session_version)
        throw Error();
      next();
    } catch {
      next(fail(401, "Session expirée ou invalide. Veuillez vous connecter."));
    }
  };
  const roles =
    (...allowed) =>
    (req, res, next) =>
      allowed.includes(req.user.role)
        ? next()
        : next(fail(403, "Vous ne disposez pas des droits nécessaires."));
  const staffDoctorId = (user) =>
    user.role === "doctor" ? user.id : user.doctor_id;
  const canSee = (user, appointment) =>
    user.role === "superadmin" ||
    (user.role === "patient"
      ? appointment.patient_id === user.id
      : appointment.doctor_id === staffDoctorId(user));
  const appointment = (req) => {
    const item = one(
      "SELECT * FROM appointments WHERE id=?",
      integer(req.params.id),
    );
    if (!item || !canSee(req.user, item))
      throw fail(404, "Rendez-vous introuvable.");
    return item;
  };
  app.get("/api/health", (req, res) => {
    one("SELECT 1");
    res.json({
      status: "online",
      service: "MediDesk API",
      database: "connected",
    });
  });
  app.post(
    "/api/auth/register",
    wrap(async (req, res) => {
      const name = text(req.body.name, "Nom", 2, 120);
      const email = emailAddress(req.body.email);
      const hash = await bcrypt.hash(passwordValue(req.body.password), 12);
      const result = run(
        "INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,'patient')",
        name,
        email,
        hash,
      );
      audit(Number(result.lastInsertRowid), "account.created");
      res.status(201).json({
        user: publicUser(
          one("SELECT * FROM users WHERE id=?", result.lastInsertRowid),
        ),
      });
    }),
  );
  app.post(
    "/api/auth/login",
    wrap(async (req, res) => {
      const email = emailAddress(req.body.email);
      const password = providedPassword(req.body.password);
      const user = one("SELECT * FROM users WHERE email=?", email);
      const hash =
        user?.password_hash ||
        "$2b$12$LOKfyTj83Q7dRzRrjHPmPuXXGRH2RPW/ED99nnOHvWz2.BjWG6Ifq";
      if (!(await bcrypt.compare(password, hash)) || !user)
        throw fail(401, "Email ou mot de passe incorrect.");
      audit(user.id, "session.login");
      const token = jwt.sign({ version: user.session_version }, secret, {
        subject: String(user.id),
        issuer: "medidesk",
        expiresIn: "8h",
        algorithm: "HS256",
      });
      res.json({ token, user: publicUser(user) });
    }),
  );
  app.post("/api/auth/forgot-password", (req, res) =>
    res.status(503).json({
      message:
        "La récupération par email n’est pas configurée. Contactez l’administrateur.",
    }),
  );
  app.post("/api/auth/verify-2fa", (req, res) =>
    res.status(503).json({
      message: "L’authentification à deux facteurs n’est pas configurée.",
    }),
  );
  app.get("/api/doctors", (req, res) => {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.slice(0, 120)
        : "";
    res.json({
      data: all(
        "SELECT id,name,specialty,city,clinic,cnom FROM users WHERE role='doctor' AND (name LIKE ? OR specialty LIKE ? OR city LIKE ?) ORDER BY name LIMIT 200",
        ...Array(3).fill(`%${search}%`),
      ),
    });
  });
  app.post(
    "/api/applications",
    wrap((req, res) => {
      const result = run(
        "INSERT INTO applications(name,email,specialty,city,cnom) VALUES (?,?,?,?,?)",
        text(req.body.name, "Nom", 2, 120),
        emailAddress(req.body.email),
        text(req.body.specialty, "Spécialité", 2, 120),
        text(req.body.city, "Ville", 2, 120),
        text(req.body.cnom, "Numéro CNOM", 2, 80),
      );
      res.status(201).json({
        id: Number(result.lastInsertRowid),
        message:
          "Votre demande a été enregistrée. Elle sera examinée par l’équipe.",
      });
    }),
  );
  const purgeAnalytics = () =>
    run("DELETE FROM analytics_daily WHERE day <= date('now','-90 days')");
  if (rateLimits)
    app.use(
      "/api/analytics/events",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 60,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { message: "Trop de requêtes statistiques." },
      }),
    );
  app.post(
    "/api/analytics/events",
    wrap((req, res) => {
      if (
        req.body.consent !== true ||
        !["directory", "application", "privacy"].includes(req.body.page) ||
        Object.keys(req.body).some((key) => !["page", "consent"].includes(key))
      )
        throw fail(400, "Événement statistique non autorisé.");
      if (req.headers.dnt === "1" || req.headers["sec-gpc"] === "1")
        return res.status(204).end();
      purgeAnalytics();
      run(
        "INSERT INTO analytics_daily(day,page,views) VALUES (date('now'),?,1) ON CONFLICT(day,page) DO UPDATE SET views=views+1",
        req.body.page,
      );
      res.status(204).end();
    }),
  );
  app.use("/api", auth, (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.post("/api/auth/logout", (req, res) => {
    run(
      "UPDATE users SET session_version=session_version+1 WHERE id=?",
      req.user.id,
    );
    audit(req.user.id, "session.logout");
    res.json({ message: "Session fermée." });
  });
  app.get("/api/auth/me", (req, res) =>
    res.json({ user: publicUser(req.user) }),
  );
  app.put(
    "/api/account",
    wrap(async (req, res) => {
      const name = text(req.body.name, "Nom", 2, 120);
      const phone = text(req.body.phone || "", "Téléphone", 0, 40);
      run(
        "UPDATE users SET name=?,phone=? WHERE id=?",
        name,
        phone,
        req.user.id,
      );
      audit(req.user.id, "account.updated");
      res.json({
        user: publicUser(one("SELECT * FROM users WHERE id=?", req.user.id)),
      });
    }),
  );
  app.put(
    "/api/account/password",
    wrap(async (req, res) => {
      if (
        !(await bcrypt.compare(
          providedPassword(req.body.current_password),
          req.user.password_hash,
        ))
      )
        throw fail(400, "Mot de passe actuel incorrect.");
      const hash = await bcrypt.hash(passwordValue(req.body.password), 12);
      run(
        "UPDATE users SET password_hash=?,session_version=session_version+1 WHERE id=?",
        hash,
        req.user.id,
      );
      audit(req.user.id, "password.changed");
      res.json({ message: "Mot de passe modifié." });
    }),
  );
  const scope = (user) =>
    user.role === "superadmin"
      ? ["1=1", []]
      : user.role === "patient"
        ? ["a.patient_id=?", [user.id]]
        : ["a.doctor_id=?", [staffDoctorId(user) || -1]];
  const practice = installPractice(app, {
    db,
    roles,
    wrap,
    fail,
    text,
    integer,
    audit,
    jwtSecret: secret,
    production,
  });
  const appointmentList = (user) => {
    const [where, args] = scope(user);
    return all(
      `SELECT a.*,p.name AS patient_name,d.name AS doctor_name,d.specialty,d.clinic FROM appointments a JOIN users p ON p.id=a.patient_id JOIN users d ON d.id=a.doctor_id WHERE ${where} ORDER BY a.appointment_date DESC,a.appointment_time DESC LIMIT 1000`,
      ...args,
    ).map((a) => practice.revealAppointment(a, user));
  };
  app.get("/api/appointments", (req, res) =>
    res.json({ data: appointmentList(req.user) }),
  );
  app.post(
    "/api/appointments",
    roles("patient"),
    wrap((req, res) => {
      const doctorId = integer(req.body.doctor_id);
      if (!one("SELECT id FROM users WHERE id=? AND role='doctor'", doctorId))
        throw fail(404, "Médecin introuvable.");
      const date = text(req.body.appointment_date, "Date", 10, 10);
      const time = text(req.body.appointment_time, "Heure", 5, 5);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
        !Number.isFinite(Date.parse(`${date}T${time}:00+01:00`)) ||
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
      )
        throw fail(400, "Date ou heure invalide.");
      if (Date.parse(`${date}T${time}:00+01:00`) <= Date.now())
        throw fail(400, "Choisissez un créneau futur (heure de Tunis).");
      const length =
        one(
          "SELECT duration FROM schedule_slots WHERE doctor_id=? AND slot_date=? AND slot_time=? AND kind='available'",
          doctorId,
          date,
          time,
        )?.duration || 30;
      practice.ensureSlot(req.user, doctorId, date, time, length);
      const result = run(
        "INSERT INTO appointments(patient_id,doctor_id,appointment_date,appointment_time,reason,duration) VALUES (?,?,?,?,?,?)",
        req.user.id,
        doctorId,
        date,
        time,
        practice.vault.seal(text(req.body.reason || "", "Motif", 0, 1000)),
        length,
      );
      audit(req.user.id, "appointment.created");
      practice.notify(req.user.id, `appointment:${result.lastInsertRowid}`, {
        title: "Votre rendez-vous est confirmé.",
        page: "appointments",
      });
      res.status(201).json({
        data: practice.revealAppointment(
          one("SELECT * FROM appointments WHERE id=?", result.lastInsertRowid),
        ),
      });
    }),
  );
  app.patch(
    "/api/appointments/:id",
    wrap((req, res) => {
      const item = appointment(req);
      if (item.status !== "confirmed")
        throw fail(409, "Ce rendez-vous ne peut plus être modifié.");
      const status = req.body.status;
      if (
        !["cancelled", "completed"].includes(status) ||
        (req.user.role === "patient" && status !== "cancelled")
      )
        throw fail(403, "Modification non autorisée.");
      run("UPDATE appointments SET status=? WHERE id=?", status, item.id);
      audit(req.user.id, `appointment.${status}`);
      if (status === "cancelled")
        practice.notify(item.patient_id, `cancelled:${item.id}`, {
          title: "Un rendez-vous a été annulé.",
          page: "appointments",
        });
      res.json({
        data: practice.revealAppointment(
          one("SELECT * FROM appointments WHERE id=?", item.id),
          req.user,
        ),
      });
    }),
  );
  app.get("/api/consultations", roles("patient", "doctor"), (req, res) => {
    const key = req.user.role === "patient" ? "patient_id" : "doctor_id";
    res.json({
      data: all(
        `SELECT c.*,p.name AS patient_name,d.name AS doctor_name FROM consultations c JOIN users p ON p.id=c.patient_id JOIN users d ON d.id=c.doctor_id WHERE c.${key}=? ORDER BY c.created_at DESC LIMIT 1000`,
        req.user.id,
      ).map(practice.revealConsultation),
    });
    audit(req.user.id, "consultations.read");
  });
  app.post(
    "/api/appointments/:id/consultation",
    roles("doctor"),
    wrap((req, res) => {
      const item = appointment(req);
      if (item.status !== "confirmed")
        throw fail(409, "Ce rendez-vous est déjà clôturé.");
      const notes = text(req.body.notes, "Notes", 2, 10000);
      const prescription = text(
        req.body.prescription || "",
        "Ordonnance",
        0,
        10000,
      );
      db.exec("BEGIN IMMEDIATE");
      try {
        const result = run(
          "INSERT INTO consultations(appointment_id,doctor_id,patient_id,notes,prescription,clinical_payload) VALUES (?,?,?,?,?,?)",
          item.id,
          req.user.id,
          item.patient_id,
          practice.vault.seal(notes),
          practice.vault.seal(prescription),
          practice.vault.pack(
            Object.fromEntries(
              [
                "reason",
                "examination",
                "diagnosis",
                "lab_orders",
                "imaging_orders",
                "certificate",
              ].map((key) => [key, text(req.body[key] || "", key, 0, 15000)]),
            ),
          ),
        );
        run("UPDATE appointments SET status='completed' WHERE id=?", item.id);
        audit(req.user.id, "consultation.created");
        db.exec("COMMIT");
        res.status(201).json({
          data: practice.revealConsultation(
            one(
              "SELECT * FROM consultations WHERE id=?",
              result.lastInsertRowid,
            ),
          ),
        });
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    }),
  );
  app.get(
    "/api/payments",
    roles("doctor", "secretariat", "superadmin"),
    (req, res) => {
      const [where, args] = scope(req.user);
      res.json({
        data: all(
          `SELECT b.*,p.name AS patient_name,d.name AS doctor_name FROM payments b JOIN appointments a ON a.id=b.appointment_id JOIN users p ON p.id=a.patient_id JOIN users d ON d.id=a.doctor_id WHERE ${where} ORDER BY b.created_at DESC LIMIT 1000`,
          ...args,
        ),
      });
    },
  );
  app.post(
    "/api/appointments/:id/payment",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const item = appointment(req);
      if (item.status === "cancelled")
        throw fail(409, "Ce rendez-vous est annulé.");
      if (one("SELECT id FROM invoices WHERE appointment_id=?", item.id))
        throw fail(
          409,
          "Enregistrez le règlement depuis la facture liée à ce rendez-vous.",
        );
      const amount = Number(req.body.amount);
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 100000 ||
        Math.abs(amount * 1000 - Math.round(amount * 1000)) > 0.00001
      )
        throw fail(400, "Montant invalide (trois décimales maximum).");
      if (!["cash", "card", "transfer"].includes(req.body.method))
        throw fail(400, "Mode de règlement invalide.");
      const result = run(
        "INSERT INTO payments(appointment_id,amount_millimes,method,recorded_by) VALUES (?,?,?,?)",
        item.id,
        Math.round(amount * 1000),
        req.body.method,
        req.user.id,
      );
      audit(req.user.id, "payment.recorded");
      res.status(201).json({
        data: one("SELECT * FROM payments WHERE id=?", result.lastInsertRowid),
      });
    }),
  );
  app.get("/api/suggestions", (req, res) =>
    res.json({
      data: all(
        `SELECT s.*,u.name AS author FROM suggestions s JOIN users u ON u.id=s.user_id ${req.user.role === "superadmin" ? "" : "WHERE s.user_id=?"} ORDER BY s.created_at DESC LIMIT 1000`,
        ...(req.user.role === "superadmin" ? [] : [req.user.id]),
      ),
    }),
  );
  app.post(
    "/api/suggestions",
    wrap((req, res) => {
      const result = run(
        "INSERT INTO suggestions(user_id,category,message) VALUES (?,?,?)",
        req.user.id,
        text(req.body.category, "Catégorie", 2, 80),
        text(req.body.message, "Message", 10, 4000),
      );
      res.status(201).json({
        data: one(
          "SELECT * FROM suggestions WHERE id=?",
          result.lastInsertRowid,
        ),
      });
    }),
  );
  app.patch(
    "/api/suggestions/:id",
    roles("superadmin"),
    wrap((req, res) => {
      if (
        !["new", "under_review", "planned", "closed"].includes(req.body.status)
      )
        throw fail(400, "Statut invalide.");
      const id = integer(req.params.id);
      if (!one("SELECT id FROM suggestions WHERE id=?", id))
        throw fail(404, "Suggestion introuvable.");
      run(
        "UPDATE suggestions SET status=?,response=? WHERE id=?",
        req.body.status,
        text(req.body.response || "", "Réponse", 0, 4000),
        id,
      );
      audit(req.user.id, "suggestion.updated");
      res.json({ data: one("SELECT * FROM suggestions WHERE id=?", id) });
    }),
  );
  app.get("/api/analytics/summary", roles("superadmin"), (req, res) => {
    purgeAnalytics();
    res.json({
      data: all(
        "SELECT day,page,views FROM analytics_daily WHERE day >= date('now','-29 days') ORDER BY day DESC,page",
      ),
      retention_days: 90,
    });
  });
  app.get("/api/dashboard", (req, res) => {
    const items = appointmentList(req.user);
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Tunis",
    }).format(new Date());
    const [where, args] = scope(req.user);
    const counts = one(
      `SELECT count(*) AS total,
      coalesce(sum(a.appointment_date=? AND a.status!='cancelled'),0) AS appointments_today,
      coalesce(sum(a.status='confirmed' AND a.appointment_date>=?),0) AS upcoming,
      coalesce(sum(a.status='completed'),0) AS completed
      FROM appointments a WHERE ${where}`,
      today,
      today,
      ...args,
    );
    res.json({
      ...counts,
      recent: items.sort((a, b) => b.id - a.id).slice(0, 5),
      ...(req.user.role === "superadmin"
        ? {
            doctors: one("SELECT count(*) AS n FROM users WHERE role='doctor'")
              .n,
            patients: one(
              "SELECT count(*) AS n FROM users WHERE role='patient'",
            ).n,
            pending_applications: one(
              "SELECT count(*) AS n FROM applications WHERE status='pending'",
            ).n,
          }
        : {}),
    });
  });
  app.get("/api/team", roles("doctor", "superadmin"), (req, res) =>
    res.json({
      data: all(
        `SELECT id,name,email,role,specialty,city,clinic,phone,cnom,doctor_id,created_at FROM users WHERE ${req.user.role === "superadmin" ? "role != 'patient'" : "doctor_id=?"} ORDER BY name`,
        ...(req.user.role === "superadmin" ? [] : [req.user.id]),
      ),
    }),
  );
  app.post(
    "/api/team",
    roles("doctor", "superadmin"),
    wrap(async (req, res) => {
      const role = req.body.role;
      if (
        !(
          req.user.role === "superadmin"
            ? ["doctor", "secretariat", "superadmin"]
            : ["secretariat"]
        ).includes(role)
      )
        throw fail(403, "Rôle non autorisé.");
      const name = text(req.body.name, "Nom", 2, 120);
      const email = emailAddress(req.body.email);
      const specialty = text(
        req.body.specialty || "",
        "Spécialité",
        role === "doctor" ? 2 : 0,
        120,
      );
      const city = text(
        req.body.city || "",
        "Ville",
        role === "doctor" ? 2 : 0,
        120,
      );
      const cnom = text(
        req.body.cnom || "",
        "Numéro CNOM",
        role === "doctor" ? 2 : 0,
        80,
      );
      const clinic = text(req.body.clinic || "", "Cabinet", 0, 200);
      let doctorId = null;
      if (role === "secretariat") {
        doctorId =
          req.user.role === "doctor"
            ? req.user.id
            : integer(req.body.doctor_id);
        if (!one("SELECT id FROM users WHERE id=? AND role='doctor'", doctorId))
          throw fail(400, "Médecin responsable introuvable.");
      }
      const hash = await bcrypt.hash(passwordValue(req.body.password), 12);
      const result = run(
        "INSERT INTO users(name,email,password_hash,role,doctor_id,specialty,city,clinic,cnom) VALUES (?,?,?,?,?,?,?,?,?)",
        name,
        email,
        hash,
        role,
        doctorId,
        specialty,
        city,
        clinic,
        cnom,
      );
      audit(req.user.id, "team.member_created");
      res.status(201).json({
        user: publicUser(
          one("SELECT * FROM users WHERE id=?", result.lastInsertRowid),
        ),
      });
    }),
  );
  app.get("/api/applications", roles("superadmin"), (req, res) =>
    res.json({
      data: all(
        "SELECT * FROM applications ORDER BY created_at DESC LIMIT 1000",
      ),
    }),
  );
  app.patch(
    "/api/applications/:id",
    roles("superadmin"),
    wrap((req, res) => {
      if (!["reviewed", "rejected"].includes(req.body.status))
        throw fail(400, "Statut invalide.");
      const result = run(
        "UPDATE applications SET status=? WHERE id=?",
        req.body.status,
        integer(req.params.id),
      );
      if (!result.changes) throw fail(404, "Demande introuvable.");
      audit(req.user.id, "application.updated");
      res.json({
        message:
          "Demande mise à jour. La création du compte se fait dans Équipe.",
      });
    }),
  );
  app.get("/api/audit", roles("superadmin"), (req, res) =>
    res.json({
      data: all(
        "SELECT e.id,e.action,e.created_at,u.name AS actor FROM audit_events e LEFT JOIN users u ON u.id=e.user_id ORDER BY e.id DESC LIMIT 200",
      ),
    }),
  );
  app.use("/api", (req, res) =>
    res
      .status(404)
      .json({ message: "Cette fonctionnalité n’est pas disponible." }),
  );
  app.use((err, req, res, next) => {
    if (
      err.code?.startsWith("ERR_SQLITE") &&
      /UNIQUE constraint/.test(err.message)
    )
      return res.status(409).json({
        message: "Cet email, ce créneau ou cet enregistrement existe déjà.",
      });
    const status = err.status || 500;
    if (status >= 500) console.error("API error:", err.code || err.name);
    res.status(status).json({
      message:
        status >= 500
          ? "Une erreur interne est survenue. Réessayez plus tard."
          : err.message,
    });
  });
  app.locals.practice = practice;
  return app;
}
