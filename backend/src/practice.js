import { readFileSync, writeFileSync, chmodSync } from "node:fs";
import { smtpConfigured, emailWorker } from "./mail.js";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { createVault } from "./vault.js";

export function installPractice(
  app,
  { db, roles, wrap, fail, text, integer, audit, jwtSecret, production },
) {
  const one = (sql, ...args) => db.prepare(sql).get(...args),
    all = (sql, ...args) => db.prepare(sql).all(...args),
    run = (sql, ...args) => db.prepare(sql).run(...args);
  let healthKey = process.env.HEALTH_DATA_KEY;
  if (!healthKey && !production) {
    const filename = one("PRAGMA database_list")?.file;
    if (filename) {
      const keyFile = filename + ".key";
      try {
        healthKey = readFileSync(keyFile, "utf8").trim();
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        const generated = randomBytes(32).toString("hex");
        try {
          writeFileSync(keyFile, generated, { flag: "wx", mode: 0o600 });
          healthKey = generated;
        } catch (error) {
          if (error.code !== "EEXIST") throw error;
          healthKey = readFileSync(keyFile, "utf8").trim();
        }
      }
      chmodSync(keyFile, 0o600);
    }
  }
  const vault = createVault({
    key: healthKey,
    production,
    developmentSecret: jwtSecret,
  });
  const pack = vault.pack,
    unpack = vault.unpack;
  const doctor = (u) => (u.role === "doctor" ? u.id : u.doctor_id);
  const clinical = (u) => ["doctor", "patient"].includes(u.role);
  const str = (v, label, max = 2000) => text(v ?? "", label, 0, max);
  const enumValue = (v, values) => {
    if (!values.includes(v)) throw fail(400, "Valeur non autorisée.");
    return v;
  };
  const transact = (fn) => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const value = fn();
      db.exec("COMMIT");
      return value;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  };
  function date(v) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(v || "") ||
      !Number.isFinite(Date.parse(v + "T12:00:00Z")) ||
      new Date(v + "T12:00:00Z").toISOString().slice(0, 10) !== v
    )
      throw fail(400, "Date invalide.");
    return v;
  }
  function time(v) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v || ""))
      throw fail(400, "Heure invalide.");
    return v;
  }
  const minutes = (v) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
  const duration = (v) => {
    const n = Number(v ?? 30);
    if (!Number.isInteger(n) || n < 5 || n > 240)
      throw fail(400, "Durée entre 5 et 240 minutes.");
    return n;
  };
  function amount(v) {
    const n = Number(v);
    if (
      !Number.isFinite(n) ||
      n <= 0 ||
      n > 100000 ||
      Math.abs(n * 1000 - Math.round(n * 1000)) > 0.00001
    )
      throw fail(400, "Montant positif, trois décimales maximum.");
    return Math.round(n * 1000);
  }
  const methods = ["cash", "card", "cheque", "transfer", "third_party"];
  function patientScope(user, id, explicitDoctor) {
    const pid = integer(id),
      did = user.role === "patient" ? integer(explicitDoctor) : doctor(user);
    if (!clinical(user) && user.role !== "secretariat")
      throw fail(403, "Accès au dossier non autorisé.");
    if (user.role === "patient" && pid !== user.id)
      throw fail(404, "Dossier introuvable.");
    if (
      !did ||
      !one("SELECT id FROM users WHERE id=? AND role='patient'", pid) ||
      !one("SELECT id FROM users WHERE id=? AND role='doctor'", did)
    )
      throw fail(404, "Dossier introuvable.");
    if (
      !one(
        "SELECT 1 FROM patient_profiles WHERE patient_id=? AND doctor_id=?",
        pid,
        did,
      ) &&
      !one(
        "SELECT 1 FROM appointments WHERE patient_id=? AND doctor_id=?",
        pid,
        did,
      )
    )
      throw fail(404, "Dossier introuvable.");
    return { pid, did };
  }
  const profile = (pid, did) =>
    one(
      "SELECT * FROM patient_profiles WHERE patient_id=? AND doctor_id=?",
      pid,
      did,
    );
  const patientName = (id) =>
    one("SELECT name FROM users WHERE id=?", id)?.name || "";
  function notify(id, reference, content) {
    run(
      "INSERT OR IGNORE INTO notifications(user_id,reference,payload) VALUES (?,?,?)",
      id,
      reference,
      pack(content),
    );
  }
  function ensureSlot(user, did, day, hour, length = 30, skip) {
    date(day);
    time(hour);
    duration(length);
    if (minutes(hour) + length > 1440)
      throw fail(400, "Le créneau dépasse la journée.");
    if (
      user.role === "patient" &&
      one(
        "SELECT 1 FROM schedule_slots WHERE doctor_id=? AND kind='available'",
        did,
      ) &&
      !one(
        "SELECT 1 FROM schedule_slots WHERE doctor_id=? AND slot_date=? AND slot_time=? AND kind='available' AND duration=?",
        did,
        day,
        hour,
        length,
      )
    )
      throw fail(409, "Choisissez un créneau publié par ce cabinet.");
    const overlaps = (start, size) =>
      minutes(hour) < minutes(start) + size &&
      minutes(hour) + length > minutes(start);
    if (
      all(
        "SELECT id,appointment_time,duration FROM appointments WHERE doctor_id=? AND appointment_date=? AND status!='cancelled'",
        did,
        day,
      ).some((a) => a.id !== skip && overlaps(a.appointment_time, a.duration))
    )
      throw fail(409, "Ce créneau chevauche un rendez-vous existant.");
    if (
      all(
        "SELECT * FROM schedule_slots WHERE doctor_id=? AND slot_date=?",
        did,
        day,
      ).some(
        (s) =>
          overlaps(s.slot_time, s.duration) &&
          (s.kind === "blocked" ||
            (s.kind === "urgent" && user.role === "patient")),
      )
    )
      throw fail(409, "Ce créneau est réservé au cabinet.");
  }
  // Verify the retained encryption key, then migrate only legacy plaintext fields.
  transact(() => {
    const state = one("SELECT check_value FROM vault_state WHERE id=1");
    if (state) {
      if (vault.open(state.check_value) !== "MediDesk encryption key check")
        throw Error("Health-data key verification failed.");
    } else
      run(
        "INSERT INTO vault_state(id,check_value) VALUES (1,?)",
        vault.seal("MediDesk encryption key check"),
      );
    for (const c of all(
      "SELECT id,notes,prescription FROM consultations WHERE notes NOT LIKE 'mdenc:v1:%' OR prescription NOT LIKE 'mdenc:v1:%'",
    ))
      run(
        "UPDATE consultations SET notes=?,prescription=? WHERE id=?",
        c.notes.startsWith("mdenc:v1:") ? c.notes : vault.seal(c.notes),
        c.prescription.startsWith("mdenc:v1:")
          ? c.prescription
          : vault.seal(c.prescription),
        c.id,
      );
    for (const a of all(
      "SELECT id,reason FROM appointments WHERE reason NOT LIKE 'mdenc:v1:%'",
    ))
      run(
        "UPDATE appointments SET reason=? WHERE id=?",
        vault.seal(a.reason),
        a.id,
      );
    for (const d of all("SELECT id,payload FROM documents WHERE metadata=''")) {
      const { content_base64, ...meta } = unpack(d.payload);
      run(
        "UPDATE documents SET payload=?,metadata=? WHERE id=?",
        pack({ content_base64 }),
        pack(meta),
        d.id,
      );
    }
  });
  const revealAppointment = (a, user) =>
    a
      ? {
          ...a,
          reason: user?.role === "superadmin" ? "" : vault.open(a.reason),
        }
      : a;
  const revealConsultation = (c) => ({
    ...c,
    notes: vault.open(c.notes),
    prescription: vault.open(c.prescription),
    clinical: unpack(c.clinical_payload),
  });
  app.get("/api/capabilities", (req, res) =>
    res.json({
      data: {
        inAppReminders: true,
        sms: false,
        email: smtpConfigured(),
        drugDecisionSupport: false,
        video:
          !!process.env.VIDEO_BASE_URL &&
          process.env.VIDEO_PRIVACY_APPROVED === "true",
        encryption: "AES-256-GCM (champs cliniques, documents et messages)",
        regulatoryCertification: false,
      },
    }),
  );
  app.get(
    "/api/patients",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const did = doctor(req.user);
      const search = str(req.query.q, "Recherche", 120).toLocaleLowerCase("fr");
      const data = all(
        "SELECT DISTINCT u.id,u.name,u.email,u.phone FROM users u WHERE u.role='patient' AND (EXISTS(SELECT 1 FROM appointments a WHERE a.patient_id=u.id AND a.doctor_id=?) OR EXISTS(SELECT 1 FROM patient_profiles p WHERE p.patient_id=u.id AND p.doctor_id=?)) ORDER BY u.name LIMIT 3000",
        did,
        did,
      )
        .map((u) => ({
          ...u,
          demographics: unpack(profile(u.id, did)?.demographics),
        }))
        .filter((u) =>
          JSON.stringify([u.name, u.email, u.phone, u.demographics])
            .toLocaleLowerCase("fr")
            .includes(search),
        );
      audit(req.user.id, "patient.directory_read");
      res.json({ data });
    }),
  );
  function demographics(b) {
    const value = {};
    for (const k of [
      "name",
      "birth_date",
      "sex",
      "phone",
      "email",
      "address",
      "insurance",
      "insurance_number",
      "coverage",
    ])
      value[k] = str(b[k], k, k === "address" ? 1000 : 200);
    if (value.birth_date) date(value.birth_date);
    if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
      throw fail(400, "Email invalide.");
    if (value.sex && !["F", "M", "X"].includes(value.sex))
      throw fail(400, "Sexe invalide.");
    return value;
  }
  app.post(
    "/api/patients",
    roles("doctor", "secretariat"),
    wrap(async (req, res) => {
      const details = demographics(req.body),
        name = text(details.name, "Nom", 2, 120),
        did = doctor(req.user);
      // Offline clinical records never create a usable shared/default password or take over an existing portal account.
      const hash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
      const pid = transact(() => {
        const id = Number(
          run(
            "INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,'patient')",
            name,
            `offline-${randomUUID()}@patients.invalid`,
            hash,
          ).lastInsertRowid,
        );
        run(
          "INSERT INTO patient_profiles(patient_id,doctor_id,demographics) VALUES (?,?,?)",
          id,
          did,
          pack(details),
        );
        audit(req.user.id, `patient.created:${id}`);
        return id;
      });
      res.status(201).json({
        data: { id: pid, name, demographics: details, portal_account: false },
      });
    }),
  );
  app.post(
    "/api/patients/:id/link-token",
    roles("doctor"),
    wrap((req, res) => {
      const { pid, did } = patientScope(req.user, req.params.id);
      if (
        !one("SELECT email FROM users WHERE id=?", pid).email.endsWith(
          "@patients.invalid",
        )
      )
        throw fail(409, "Ce dossier est déjà associé à un compte personnel.");
      const token = randomBytes(24).toString("hex"),
        hash = createHash("sha256").update(token).digest("hex");
      run(
        "INSERT INTO patient_links(patient_id,doctor_id,token_hash,expires_at) VALUES (?,?,?,?)",
        pid,
        did,
        hash,
        new Date(Date.now() + 86400000).toISOString(),
      );
      audit(req.user.id, "patient.link_issued");
      res.json({ data: { token } });
    }),
  );
  app.post(
    "/api/my-files/link",
    roles("patient"),
    wrap((req, res) => {
      const token = text(req.body.token, "Code", 48, 48),
        hash = createHash("sha256").update(token).digest("hex"),
        link = one(
          "SELECT * FROM patient_links WHERE token_hash=? AND used_at IS NULL AND expires_at>?",
          hash,
          new Date().toISOString(),
        );
      if (!link) throw fail(400, "Code expiré ou invalide.");
      if (
        profile(req.user.id, link.doctor_id) ||
        one(
          "SELECT 1 FROM appointments WHERE patient_id=? AND doctor_id=?",
          req.user.id,
          link.doctor_id,
        )
      )
        throw fail(
          409,
          "Un dossier existe déjà : demandez une réconciliation au cabinet.",
        );
      transact(() => {
        for (const table of [
          "patient_profiles",
          "appointments",
          "consultations",
          "documents",
          "vitals",
          "waiting_list",
          "invoices",
        ])
          run(
            `UPDATE ${table} SET patient_id=? WHERE patient_id=? AND doctor_id=?`,
            req.user.id,
            link.patient_id,
            link.doctor_id,
          );
        run(
          "UPDATE messages SET recipient_id=?,patient_id=? WHERE recipient_id=? AND sender_id=?",
          req.user.id,
          req.user.id,
          link.patient_id,
          link.doctor_id,
        );
        run(
          "UPDATE patient_links SET used_at=datetime('now') WHERE patient_id=? AND doctor_id=?",
          link.patient_id,
          link.doctor_id,
        );
        audit(req.user.id, "patient.portal_linked");
      });
      res.json({ message: "Dossier rattaché." });
    }),
  );
  app.get(
    "/api/my-files",
    roles("patient"),
    wrap((req, res) => {
      const data = all(
        "SELECT DISTINCT d.id,d.name,d.specialty FROM users d WHERE EXISTS(SELECT 1 FROM appointments a WHERE a.patient_id=? AND a.doctor_id=d.id) OR EXISTS(SELECT 1 FROM patient_profiles p WHERE p.patient_id=? AND p.doctor_id=d.id)",
        req.user.id,
        req.user.id,
      );
      res.json({ data });
    }),
  );
  app.get(
    "/api/patients/:id",
    roles("doctor", "secretariat", "patient"),
    wrap((req, res) => {
      const { pid, did } = patientScope(
          req.user,
          req.params.id,
          req.query.doctor_id,
        ),
        p = profile(pid, did),
        u = one("SELECT id,name,email,phone FROM users WHERE id=?", pid);
      audit(req.user.id, `patient.read:${pid}`);
      res.json({
        data: {
          id: pid,
          doctor_id: did,
          name: u.name,
          demographics: {
            name: u.name,
            phone: u.phone,
            email: u.email.endsWith("@patients.invalid") ? "" : u.email,
            ...unpack(p?.demographics),
          },
          ...(clinical(req.user)
            ? {
                medical: unpack(p?.medical),
                consultations: all(
                  "SELECT * FROM consultations WHERE patient_id=? AND doctor_id=? ORDER BY created_at DESC",
                  pid,
                  did,
                ).map(revealConsultation),
              }
            : {}),
        },
      });
    }),
  );
  app.put(
    "/api/patients/:id",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const { pid, did } = patientScope(req.user, req.params.id),
        value = demographics(req.body);
      text(value.name, "Nom", 2, 120);
      run(
        "INSERT INTO patient_profiles(patient_id,doctor_id,demographics) VALUES (?,?,?) ON CONFLICT(patient_id,doctor_id) DO UPDATE SET demographics=excluded.demographics,updated_at=datetime('now')",
        pid,
        did,
        pack(value),
      );
      audit(req.user.id, `patient.demographics_updated:${pid}`);
      res.json({ data: value });
    }),
  );
  app.put(
    "/api/patients/:id/medical",
    roles("doctor"),
    wrap((req, res) => {
      const { pid, did } = patientScope(req.user, req.params.id),
        value = {};
      for (const k of ["history", "allergies", "treatments", "diagnoses"])
        value[k] = str(req.body[k], k, 15000);
      run(
        "INSERT INTO patient_profiles(patient_id,doctor_id,medical) VALUES (?,?,?) ON CONFLICT(patient_id,doctor_id) DO UPDATE SET medical=excluded.medical,updated_at=datetime('now')",
        pid,
        did,
        pack(value),
      );
      audit(req.user.id, `patient.medical_updated:${pid}`);
      res.json({ data: value });
    }),
  );
  app.get(
    "/api/patients/:id/vitals",
    roles("doctor", "patient"),
    wrap((req, res) => {
      const { pid, did } = patientScope(
        req.user,
        req.params.id,
        req.query.doctor_id,
      );
      audit(req.user.id, `vitals.read:${pid}`);
      res.json({
        data: all(
          "SELECT * FROM vitals WHERE patient_id=? AND doctor_id=? ORDER BY measured_at,id",
          pid,
          did,
        ).map((v) => ({
          id: v.id,
          measured_at: v.measured_at,
          ...unpack(v.payload),
        })),
      });
    }),
  );
  app.post(
    "/api/patients/:id/vitals",
    roles("doctor"),
    wrap((req, res) => {
      const { pid, did } = patientScope(req.user, req.params.id),
        value = {};
      for (const [k, min, max] of [
        ["weight", 0.1, 500],
        ["systolic", 30, 300],
        ["diastolic", 20, 200],
        ["glucose", 0.01, 10],
        ["height", 20, 250],
        ["pulse", 10, 300],
      ])
        if (req.body[k] !== "" && req.body[k] != null) {
          const n = Number(req.body[k]);
          if (!Number.isFinite(n) || n < min || n > max)
            throw fail(400, `Valeur invalide : ${k}.`);
          value[k] = n;
        }
      if (!Object.keys(value).length)
        throw fail(400, "Saisissez au moins une constante.");
      const day = date(req.body.measured_at);
      const id = Number(
        run(
          "INSERT INTO vitals(patient_id,doctor_id,measured_at,payload) VALUES (?,?,?,?)",
          pid,
          did,
          day,
          pack(value),
        ).lastInsertRowid,
      );
      audit(req.user.id, `vitals.created:${pid}`);
      res.status(201).json({ data: { id, measured_at: day, ...value } });
    }),
  );
  const documentMeta = (d) => {
    const meta = unpack(d.metadata || d.payload);
    delete meta.content_base64;
    return {
      id: d.id,
      patient_id: d.patient_id,
      doctor_id: d.doctor_id,
      created_at: d.created_at,
      ...meta,
    };
  };
  function documentAccess(user, id) {
    const d = one("SELECT * FROM documents WHERE id=?", integer(id));
    if (
      !d ||
      !(
        (user.role === "patient" && d.patient_id === user.id) ||
        (user.role === "doctor" &&
          (d.doctor_id === user.id ||
            one(
              "SELECT 1 FROM messages WHERE document_id=? AND recipient_id=?",
              d.id,
              user.id,
            )))
      )
    )
      throw fail(404, "Document introuvable.");
    return d;
  }
  app.get(
    "/api/patients/:id/documents",
    roles("doctor", "patient"),
    wrap((req, res) => {
      const { pid, did } = patientScope(
        req.user,
        req.params.id,
        req.query.doctor_id,
      );
      audit(req.user.id, `documents.list_read:${pid}`);
      res.json({
        data: all(
          "SELECT id,patient_id,doctor_id,created_at,metadata FROM documents WHERE patient_id=? AND doctor_id=? ORDER BY id DESC",
          pid,
          did,
        ).map(documentMeta),
      });
    }),
  );
  app.post(
    "/api/patients/:id/documents",
    roles("doctor"),
    wrap((req, res) => {
      const { pid, did } = patientScope(req.user, req.params.id),
        b = req.body,
        content = str(b.content_base64, "Document", 4500000);
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(content) || content.length % 4)
        throw fail(400, "Encodage de document invalide.");
      const bytes = Buffer.from(content, "base64");
      if (!bytes.length || bytes.length > 3 * 1024 * 1024)
        throw fail(400, "Le document doit faire au maximum 3 Mo.");
      const mime = enumValue(b.mime, [
        "application/pdf",
        "image/png",
        "image/jpeg",
      ]);
      const valid =
        mime === "application/pdf"
          ? bytes.subarray(0, 5).toString() === "%PDF-"
          : mime === "image/png"
            ? bytes
                .subarray(0, 8)
                .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      if (!valid)
        throw fail(400, "Le contenu ne correspond pas au type du document.");
      const payload = {
        name: text(b.name, "Nom du document", 1, 150).replace(
          /[\/\\\x00-\x1f]/g,
          "_",
        ),
        category: enumValue(b.category, [
          "analysis",
          "imaging",
          "report",
          "letter",
          "other",
        ]),
        mime,
        size: bytes.length,
        content_base64: content,
      };
      const id = Number(
        run(
          "INSERT INTO documents(patient_id,doctor_id,uploaded_by,payload,metadata) VALUES (?,?,?,?,?)",
          pid,
          did,
          req.user.id,
          pack({ content_base64: payload.content_base64 }),
          pack(
            Object.fromEntries(
              Object.entries(payload).filter(
                ([key]) => key !== "content_base64",
              ),
            ),
          ),
        ).lastInsertRowid,
      );
      notify(pid, `document:${id}`, {
        title: "Un document a été ajouté à votre dossier.",
        page: "clinical",
      });
      audit(req.user.id, `document.created:${id}`);
      res.status(201).json({
        data: documentMeta(one("SELECT * FROM documents WHERE id=?", id)),
      });
    }),
  );
  app.get(
    "/api/documents/:id",
    roles("doctor", "patient"),
    wrap((req, res) => {
      const d = documentAccess(req.user, req.params.id);
      audit(req.user.id, `document.read:${d.id}`);
      res.json({
        data: {
          ...documentMeta(d),
          content_base64: unpack(d.payload).content_base64,
        },
      });
    }),
  );
  app.get(
    "/api/templates",
    roles("doctor"),
    wrap((req, res) =>
      res.json({
        data: all(
          "SELECT * FROM report_templates WHERE doctor_id=? ORDER BY id DESC",
          req.user.id,
        ).map((t) => ({ id: t.id, kind: t.kind, ...unpack(t.payload) })),
      }),
    ),
  );
  app.post(
    "/api/templates",
    roles("doctor"),
    wrap((req, res) => {
      const kind = enumValue(req.body.kind, [
          "report",
          "certificate",
          "prescription",
          "lab",
          "imaging",
        ]),
        payload = {
          title: text(req.body.title, "Titre", 2, 150),
          body: text(req.body.body, "Modèle", 2, 15000),
        };
      const id = Number(
        run(
          "INSERT INTO report_templates(doctor_id,kind,payload) VALUES (?,?,?)",
          req.user.id,
          kind,
          pack(payload),
        ).lastInsertRowid,
      );
      audit(req.user.id, "template.created");
      res.status(201).json({ data: { id, kind, ...payload } });
    }),
  );
  app.delete(
    "/api/templates/:id",
    roles("doctor"),
    wrap((req, res) => {
      if (
        !run(
          "DELETE FROM report_templates WHERE id=? AND doctor_id=?",
          integer(req.params.id),
          req.user.id,
        ).changes
      )
        throw fail(404, "Modèle introuvable.");
      audit(req.user.id, "template.deleted");
      res.json({ message: "Modèle supprimé." });
    }),
  );
  app.get(
    "/api/schedule",
    wrap((req, res) => {
      const did =
        req.user.role === "patient"
          ? integer(req.query.doctor_id)
          : doctor(req.user);
      if (!did) throw fail(403, "Sélectionnez un médecin.");
      const from = date(req.query.from),
        to = date(req.query.to);
      if (to < from || (Date.parse(to) - Date.parse(from)) / 86400000 > 93)
        throw fail(400, "Période maximale : 93 jours.");
      let slots = all(
        `SELECT * FROM schedule_slots WHERE doctor_id=? AND slot_date BETWEEN ? AND ? ${req.user.role === "patient" ? "AND kind='available'" : ""} ORDER BY slot_date,slot_time`,
        did,
        from,
        to,
      );
      if (req.user.role === "patient") {
        const booked = all(
          "SELECT appointment_date,appointment_time,duration FROM appointments WHERE doctor_id=? AND appointment_date BETWEEN ? AND ? AND status!='cancelled'",
          did,
          from,
          to,
        );
        slots = slots.filter(
          (s) =>
            !booked.some(
              (a) =>
                a.appointment_date === s.slot_date &&
                minutes(a.appointment_time) <
                  minutes(s.slot_time) + s.duration &&
                minutes(a.appointment_time) + a.duration > minutes(s.slot_time),
            ),
        );
      }
      res.json({
        data: slots,
        published: !!one(
          "SELECT 1 FROM schedule_slots WHERE doctor_id=? AND kind='available'",
          did,
        ),
      });
    }),
  );
  app.post(
    "/api/schedule",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const did = doctor(req.user),
        day = date(req.body.slot_date),
        hour = time(req.body.slot_time),
        length = duration(req.body.duration),
        kind = enumValue(req.body.kind, ["available", "urgent", "blocked"]);
      if (minutes(hour) + length > 1440)
        throw fail(400, "Le créneau dépasse la journée.");
      if (
        all(
          "SELECT * FROM schedule_slots WHERE doctor_id=? AND slot_date=?",
          did,
          day,
        ).some(
          (s) =>
            minutes(hour) < minutes(s.slot_time) + s.duration &&
            minutes(hour) + length > minutes(s.slot_time),
        )
      )
        throw fail(409, "Un créneau existe déjà sur cette période.");
      if (kind !== "available")
        ensureSlot({ role: "doctor" }, did, day, hour, length);
      const id = Number(
        run(
          "INSERT INTO schedule_slots(doctor_id,slot_date,slot_time,duration,kind) VALUES (?,?,?,?,?)",
          did,
          day,
          hour,
          length,
          kind,
        ).lastInsertRowid,
      );
      audit(req.user.id, "schedule.created");
      res.status(201).json({ data: { id } });
    }),
  );
  app.delete(
    "/api/schedule/:id",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      if (
        !run(
          "DELETE FROM schedule_slots WHERE id=? AND doctor_id=?",
          integer(req.params.id),
          doctor(req.user),
        ).changes
      )
        throw fail(404, "Créneau introuvable.");
      audit(req.user.id, "schedule.deleted");
      res.json({ message: "Créneau supprimé." });
    }),
  );
  app.post(
    "/api/staff-appointments",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const { pid, did } = patientScope(req.user, req.body.patient_id),
        day = date(req.body.appointment_date),
        hour = time(req.body.appointment_time),
        length = duration(req.body.duration);
      if (Date.parse(`${day}T${hour}:00+01:00`) <= Date.now())
        throw fail(400, "Choisissez une date future.");
      const priority = enumValue(req.body.priority || "normal", [
        "normal",
        "urgent",
        "special",
      ]);
      ensureSlot(req.user, did, day, hour, length);
      const id = Number(
        run(
          "INSERT INTO appointments(patient_id,doctor_id,appointment_date,appointment_time,reason,duration,priority) VALUES (?,?,?,?,?,?,?)",
          pid,
          did,
          day,
          hour,
          vault.seal(str(req.body.reason, "Motif", 1000)),
          length,
          priority,
        ).lastInsertRowid,
      );
      audit(req.user.id, "appointment.created");
      notify(pid, `appointment:${id}`, {
        title: "Un rendez-vous a été ajouté à votre agenda.",
        page: "appointments",
      });
      res.status(201).json({
        data: revealAppointment(
          one("SELECT * FROM appointments WHERE id=?", id),
        ),
      });
    }),
  );
  app.patch(
    "/api/attendance/:id",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const a = one(
        "SELECT * FROM appointments WHERE id=? AND doctor_id=?",
        integer(req.params.id),
        doctor(req.user),
      );
      if (!a) throw fail(404, "Rendez-vous introuvable.");
      const attendance = enumValue(req.body.attendance, ["present", "absent"]);
      if (
        a.status === "cancelled" ||
        Date.parse(`${a.appointment_date}T${a.appointment_time}:00+01:00`) >
          Date.now()
      )
        throw fail(
          409,
          "Le rendez-vous doit avoir commencé et ne pas être annulé.",
        );
      run("UPDATE appointments SET attendance=? WHERE id=?", attendance, a.id);
      audit(req.user.id, `appointment.attendance:${attendance}`);
      res.json({ message: "Présence enregistrée." });
    }),
  );
  app.get(
    "/api/waiting-list",
    wrap((req, res) => {
      if (req.user.role === "superadmin")
        throw fail(403, "Accès réservé au cabinet.");
      const key = req.user.role === "patient" ? "patient_id" : "doctor_id";
      res.json({
        data: all(
          `SELECT w.*,u.name AS patient_name,d.name AS doctor_name FROM waiting_list w JOIN users u ON u.id=w.patient_id JOIN users d ON d.id=w.doctor_id WHERE w.${key}=? ORDER BY w.preferred_date,w.id`,
          req.user.role === "patient" ? req.user.id : doctor(req.user),
        ).map((w) => ({ ...w, payload: unpack(w.payload) })),
      });
    }),
  );
  app.post(
    "/api/waiting-list",
    roles("doctor", "secretariat", "patient"),
    wrap((req, res) => {
      let pid, did;
      if (req.user.role === "patient") {
        pid = req.user.id;
        did = integer(req.body.doctor_id);
        if (!one("SELECT id FROM users WHERE id=? AND role='doctor'", did))
          throw fail(404, "Médecin introuvable.");
      } else ({ pid, did } = patientScope(req.user, req.body.patient_id));
      const day = date(req.body.preferred_date);
      if (day < new Date().toISOString().slice(0, 10))
        throw fail(400, "Choisissez une date future.");
      const id = Number(
        run(
          "INSERT INTO waiting_list(patient_id,doctor_id,preferred_date,payload) VALUES (?,?,?,?)",
          pid,
          did,
          day,
          pack({ note: str(req.body.note, "Note", 1000) }),
        ).lastInsertRowid,
      );
      audit(req.user.id, "waiting_list.created");
      res.status(201).json({ data: { id } });
    }),
  );
  app.patch(
    "/api/waiting-list/:id",
    wrap((req, res) => {
      const w = one(
        "SELECT * FROM waiting_list WHERE id=?",
        integer(req.params.id),
      );
      if (
        !w ||
        !(req.user.role === "patient"
          ? w.patient_id === req.user.id
          : ["doctor", "secretariat"].includes(req.user.role) &&
            w.doctor_id === doctor(req.user))
      )
        throw fail(404, "Demande introuvable.");
      const status = enumValue(
        req.body.status,
        req.user.role === "patient"
          ? ["cancelled"]
          : ["contacted", "booked", "cancelled"],
      );
      run("UPDATE waiting_list SET status=? WHERE id=?", status, w.id);
      audit(req.user.id, "waiting_list.updated");
      res.json({ message: "Liste mise à jour." });
    }),
  );
  function invoiceAccess(user, id) {
    const item = one(
      "SELECT i.*,u.name AS patient_name,d.name AS doctor_name,d.clinic,d.cnom FROM invoices i JOIN users u ON u.id=i.patient_id JOIN users d ON d.id=i.doctor_id WHERE i.id=?",
      integer(id),
    );
    if (
      !item ||
      !(
        user.role === "superadmin" ||
        (user.role === "patient" && item.patient_id === user.id) ||
        (["doctor", "secretariat"].includes(user.role) &&
          item.doctor_id === doctor(user))
      )
    )
      throw fail(404, "Facture introuvable.");
    return item;
  }
  function invoiceData(i) {
    const receipts = all(
      "SELECT id,amount_millimes,method,created_at FROM invoice_payments WHERE invoice_id=? ORDER BY id",
      i.id,
    );
    const legacy = i.appointment_id
      ? one(
          "SELECT id,amount_millimes,method,created_at FROM payments WHERE appointment_id=?",
          i.appointment_id,
        )
      : null;
    if (legacy) receipts.unshift({ ...legacy, legacy: true });
    const paid = receipts.reduce((n, r) => n + r.amount_millimes, 0);
    const claim = one(
      "SELECT * FROM insurance_claims WHERE invoice_id=?",
      i.id,
    );
    return {
      ...i,
      ...unpack(i.payload),
      payload: undefined,
      paid_millimes: paid,
      balance_millimes: i.total_millimes - paid,
      receipts,
      claim: claim
        ? { id: claim.id, status: claim.status, ...unpack(claim.payload) }
        : null,
    };
  }
  app.get(
    "/api/invoices",
    wrap((req, res) => {
      const key = req.user.role === "patient" ? "patient_id" : "doctor_id",
        args =
          req.user.role === "superadmin"
            ? []
            : [req.user.role === "patient" ? req.user.id : doctor(req.user)];
      const items = all(
        `SELECT id FROM invoices ${args.length ? `WHERE ${key}=?` : ""} ORDER BY id DESC LIMIT 2000`,
        ...args,
      );
      audit(req.user.id, "invoices.read");
      res.json({
        data: items.map((i) => invoiceData(invoiceAccess(req.user, i.id))),
      });
    }),
  );
  app.post(
    "/api/invoices",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const { pid, did } = patientScope(req.user, req.body.patient_id);
      if (
        !Array.isArray(req.body.lines) ||
        !req.body.lines.length ||
        req.body.lines.length > 30
      )
        throw fail(400, "Ajoutez entre 1 et 30 lignes.");
      const lines = req.body.lines.map((l) => {
        const quantity = Number(l.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000)
          throw fail(400, "Quantité invalide.");
        return {
          label: text(l.label, "Désignation", 2, 300),
          quantity,
          unit_millimes: amount(l.unit_amount),
        };
      });
      const total = lines.reduce((n, l) => n + l.quantity * l.unit_millimes, 0);
      if (total > 100000000) throw fail(400, "Montant de facture trop élevé.");
      const aid = req.body.appointment_id
        ? integer(req.body.appointment_id)
        : null;
      if (
        aid &&
        !one(
          "SELECT 1 FROM appointments WHERE id=? AND patient_id=? AND doctor_id=? AND status!=?",
          aid,
          pid,
          did,
          "cancelled",
        )
      )
        throw fail(404, "Rendez-vous introuvable.");
      const legacy = aid
        ? one(
            "SELECT amount_millimes FROM payments WHERE appointment_id=?",
            aid,
          )
        : null;
      if (legacy && legacy.amount_millimes > total)
        throw fail(409, "Le règlement existant dépasse le total.");
      const id = Number(
        run(
          "INSERT INTO invoices(patient_id,doctor_id,appointment_id,total_millimes,payload) VALUES (?,?,?,?,?)",
          pid,
          did,
          aid,
          total,
          pack({
            lines,
            issuer_address: str(
              req.body.issuer_address,
              "Adresse du cabinet",
              1000,
            ),
            issuer_tax_id: str(
              req.body.issuer_tax_id,
              "Identifiant fiscal",
              100,
            ),
            note: str(req.body.note, "Note", 2000),
          }),
        ).lastInsertRowid,
      );
      audit(req.user.id, "invoice.created");
      res.status(201).json({ data: invoiceData(invoiceAccess(req.user, id)) });
    }),
  );
  app.post(
    "/api/invoices/:id/receipts",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const i = invoiceData(invoiceAccess(req.user, req.params.id)),
        paid = amount(req.body.amount),
        method = enumValue(req.body.method, methods);
      if (paid > i.balance_millimes)
        throw fail(409, "Le règlement dépasse le solde restant.");
      const id = Number(
        run(
          "INSERT INTO invoice_payments(invoice_id,amount_millimes,method,recorded_by) VALUES (?,?,?,?)",
          i.id,
          paid,
          method,
          req.user.id,
        ).lastInsertRowid,
      );
      audit(req.user.id, "receipt.created");
      notify(i.patient_id, `receipt:${id}`, {
        title: "Un règlement a été enregistré.",
        page: "billing",
      });
      res
        .status(201)
        .json({ data: invoiceData(invoiceAccess(req.user, i.id)) });
    }),
  );
  app.put(
    "/api/invoices/:id/claim",
    roles("doctor", "secretariat"),
    wrap((req, res) => {
      const i = invoiceAccess(req.user, req.params.id),
        status = enumValue(req.body.status, [
          "draft",
          "submitted",
          "accepted",
          "rejected",
          "reimbursed",
        ]),
        payload = {
          insurer: text(req.body.insurer, "Organisme", 2, 150),
          reference: str(req.body.reference, "Référence", 200),
          note: str(req.body.note, "Note", 2000),
        };
      run(
        "INSERT INTO insurance_claims(invoice_id,status,payload) VALUES (?,?,?) ON CONFLICT(invoice_id) DO UPDATE SET status=excluded.status,payload=excluded.payload,updated_at=datetime('now')",
        i.id,
        status,
        pack(payload),
      );
      audit(req.user.id, "insurance_claim.updated");
      res.json({ data: invoiceData(invoiceAccess(req.user, i.id)) });
    }),
  );
  app.get(
    "/api/contacts",
    roles("doctor", "patient"),
    wrap((req, res) => {
      const data =
        req.user.role === "doctor"
          ? all(
              "SELECT id,name,role,specialty FROM users WHERE role='doctor' AND id!=? OR role='patient' AND (EXISTS(SELECT 1 FROM appointments a WHERE a.patient_id=users.id AND a.doctor_id=?) OR EXISTS(SELECT 1 FROM patient_profiles p WHERE p.patient_id=users.id AND p.doctor_id=?)) ORDER BY name",
              req.user.id,
              req.user.id,
              req.user.id,
            )
          : all(
              "SELECT id,name,role,specialty FROM users WHERE role='doctor' AND (EXISTS(SELECT 1 FROM appointments a WHERE a.doctor_id=users.id AND a.patient_id=?) OR EXISTS(SELECT 1 FROM patient_profiles p WHERE p.doctor_id=users.id AND p.patient_id=?)) ORDER BY name",
              req.user.id,
              req.user.id,
            );
      res.json({ data });
    }),
  );
  app.get(
    "/api/messages",
    roles("doctor", "patient"),
    wrap((req, res) => {
      const data = all(
        "SELECT m.*,s.name AS sender_name,r.name AS recipient_name FROM messages m JOIN users s ON s.id=m.sender_id JOIN users r ON r.id=m.recipient_id WHERE sender_id=? OR recipient_id=? ORDER BY id DESC LIMIT 1000",
        req.user.id,
        req.user.id,
      ).map((m) => ({ ...m, ...unpack(m.payload), payload: undefined }));
      audit(req.user.id, "messages.read");
      res.json({ data });
    }),
  );
  app.post(
    "/api/messages",
    roles("doctor", "patient"),
    wrap((req, res) => {
      const recipient = one(
        "SELECT id,role FROM users WHERE id=? AND role IN ('doctor','patient')",
        integer(req.body.recipient_id),
      );
      if (!recipient || recipient.id === req.user.id)
        throw fail(404, "Destinataire introuvable.");
      let pid = null;
      if (req.user.role === "patient") {
        if (recipient.role !== "doctor")
          throw fail(403, "Destinataire non autorisé.");
        patientScope(req.user, req.user.id, recipient.id);
        pid = req.user.id;
      } else if (recipient.role === "patient") {
        patientScope(req.user, recipient.id);
        pid = recipient.id;
      } else if (req.body.patient_id) {
        patientScope(req.user, req.body.patient_id);
        pid = integer(req.body.patient_id);
      }
      let documentId = null;
      if (req.body.document_id) {
        if (req.user.role !== "doctor")
          throw fail(403, "Seul le médecin peut partager un document.");
        const d = documentAccess(req.user, req.body.document_id);
        if (d.doctor_id !== req.user.id || d.patient_id !== pid)
          throw fail(
            403,
            "Le document doit appartenir au dossier sélectionné.",
          );
        documentId = d.id;
      }
      const payload = {
        subject: text(req.body.subject, "Objet", 2, 200),
        body: text(req.body.body, "Message", 2, 15000),
      };
      const id = Number(
        run(
          "INSERT INTO messages(sender_id,recipient_id,patient_id,document_id,payload) VALUES (?,?,?,?,?)",
          req.user.id,
          recipient.id,
          pid,
          documentId,
          pack(payload),
        ).lastInsertRowid,
      );
      notify(recipient.id, `message:${id}`, {
        title: "Vous avez reçu un nouveau message.",
        page: "messaging",
      });
      audit(req.user.id, "message.sent");
      res.status(201).json({ data: { id } });
    }),
  );
  app.patch(
    "/api/messages/:id/read",
    roles("doctor", "patient"),
    wrap((req, res) => {
      if (
        !run(
          "UPDATE messages SET read_at=coalesce(read_at,datetime('now')) WHERE id=? AND recipient_id=?",
          integer(req.params.id),
          req.user.id,
        ).changes
      )
        throw fail(404, "Message introuvable.");
      res.json({ message: "Message marqué comme lu." });
    }),
  );
  const sendEmail = emailWorker({ db, vault });
  function reminders() {
    for (const a of all(
      "SELECT * FROM appointments WHERE status='confirmed' AND datetime(appointment_date||' '||appointment_time,'-1 hours') BETWEEN datetime('now') AND datetime('now','+24 hours')",
    )) {
      for (const id of [a.patient_id, a.doctor_id])
        notify(id, `reminder:${a.id}`, {
          title: "Vous avez un rendez-vous dans les prochaines 24 heures.",
          page: "appointments",
          appointment_id: a.id,
        });
    }
    for (const n of all(
      "SELECT n.user_id,n.reference FROM notifications n JOIN users u ON u.id=n.user_id JOIN appointments a ON n.reference='reminder:'||a.id WHERE n.reference LIKE 'reminder:%' AND u.email_reminders_opt_in=1 AND a.status='confirmed' AND datetime(a.appointment_date||' '||a.appointment_time,'-1 hours') BETWEEN datetime('now') AND datetime('now','+24 hours')",
    ))
      run(
        "INSERT OR IGNORE INTO email_queue(user_id,reference,payload) VALUES (?,?,?)",
        n.user_id,
        `${n.user_id}:${n.reference}`,
        pack({
          subject: "MediDesk · rappel de rendez-vous",
          text: "Vous avez un rendez-vous prochainement. Consultez votre espace MediDesk pour les détails. Aucun résultat médical n’est envoyé par email.",
        }),
      );
  }
  app.get(
    "/api/notification-preferences",
    wrap((req, res) =>
      res.json({
        data: {
          email_opt_in: !!req.user.email_reminders_opt_in,
          smtp_configured: smtpConfigured(),
        },
      }),
    ),
  );
  app.put(
    "/api/notification-preferences",
    roles("patient"),
    wrap((req, res) => {
      if (typeof req.body.email_opt_in !== "boolean")
        throw fail(400, "Choix invalide.");
      run(
        "UPDATE users SET email_reminders_opt_in=? WHERE id=?",
        req.body.email_opt_in ? 1 : 0,
        req.user.id,
      );
      audit(req.user.id, "email.consent_updated");
      res.json({ message: "Préférence enregistrée." });
    }),
  );
  app.get(
    "/api/notifications",
    wrap((req, res) => {
      reminders();
      res.json({
        data: all(
          "SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 200",
          req.user.id,
        ).map((n) => ({ ...n, ...unpack(n.payload), payload: undefined })),
      });
    }),
  );
  app.patch(
    "/api/notifications/:id/read",
    wrap((req, res) => {
      if (
        !run(
          "UPDATE notifications SET read_at=coalesce(read_at,datetime('now')) WHERE id=? AND user_id=?",
          integer(req.params.id),
          req.user.id,
        ).changes
      )
        throw fail(404, "Notification introuvable.");
      res.json({ message: "Notification lue." });
    }),
  );
  app.get(
    "/api/medicines",
    roles("doctor"),
    wrap((req, res) =>
      res.json({
        data: all(
          "SELECT * FROM medicines WHERE doctor_id=? ORDER BY id DESC",
          req.user.id,
        ).map((m) => ({ id: m.id, ...unpack(m.payload) })),
        decision_support: false,
      }),
    ),
  );
  app.post(
    "/api/medicines",
    roles("doctor"),
    wrap((req, res) => {
      const payload = {
        name: text(req.body.name, "Médicament", 2, 200),
        ingredient: str(req.body.ingredient, "DCI", 200),
        notes: str(req.body.notes, "Notes", 5000),
        source: str(req.body.source, "Source", 500),
        reviewed_on: date(req.body.reviewed_on),
      };
      const id = Number(
        run(
          "INSERT INTO medicines(doctor_id,payload) VALUES (?,?)",
          req.user.id,
          pack(payload),
        ).lastInsertRowid,
      );
      audit(req.user.id, "medicine.created");
      res.status(201).json({ data: { id, ...payload } });
    }),
  );
  app.post(
    "/api/appointments/:id/video",
    roles("doctor", "patient"),
    wrap((req, res) => {
      const a = one(
        "SELECT * FROM appointments WHERE id=?",
        integer(req.params.id),
      );
      if (
        !a ||
        !(req.user.role === "doctor"
          ? a.doctor_id === req.user.id
          : a.patient_id === req.user.id)
      )
        throw fail(404, "Rendez-vous introuvable.");
      if (
        !process.env.VIDEO_BASE_URL ||
        process.env.VIDEO_PRIVACY_APPROVED !== "true"
      )
        throw fail(
          503,
          "Le service de visioconférence sécurisé doit être configuré et validé.",
        );
      const base = new URL(process.env.VIDEO_BASE_URL);
      if (
        base.protocol !== "https:" ||
        base.username ||
        base.password ||
        base.search ||
        base.hash
      )
        throw fail(503, "Configuration vidéo invalide.");
      const timestamp = Date.parse(
        `${a.appointment_date}T${a.appointment_time}:00+01:00`,
      );
      if (
        a.status !== "confirmed" ||
        Date.now() < timestamp - 15 * 60000 ||
        Date.now() > timestamp + (a.duration + 30) * 60000
      )
        throw fail(
          409,
          "La salle est disponible uniquement autour du rendez-vous.",
        );
      if (req.body.consent !== true)
        throw fail(
          400,
          "Votre accord pour utiliser ce service vidéo est requis.",
        );
      run(
        "INSERT OR IGNORE INTO video_sessions(appointment_id,room_id) VALUES (?,?)",
        a.id,
        randomUUID(),
      );
      const room = one(
        "SELECT room_id FROM video_sessions WHERE appointment_id=?",
        a.id,
      );
      audit(req.user.id, "video.joined");
      res.json({
        data: { url: base.href.replace(/\/$/, "") + "/" + room.room_id },
      });
    }),
  );
  function report(user, from, to) {
    date(from);
    date(to);
    if (to < from || (Date.parse(to) - Date.parse(from)) / 86400000 > 366)
      throw fail(400, "Période maximale : 366 jours.");
    const admin = user.role === "superadmin",
      did = doctor(user);
    const a = all(
      `SELECT * FROM appointments WHERE appointment_date BETWEEN ? AND ? ${admin ? "" : "AND doctor_id=?"}`,
      from,
      to,
      ...(admin ? [] : [did]),
    );
    const c = all(
      `SELECT * FROM consultations WHERE date(created_at,'+1 hours') BETWEEN ? AND ? ${admin ? "" : "AND doctor_id=?"}`,
      from,
      to,
      ...(admin ? [] : [did]),
    );
    const receipts = all(
      `SELECT b.id,b.amount_millimes,b.method,b.created_at AS created_at FROM payments b JOIN appointments a ON a.id=b.appointment_id WHERE date(b.created_at,'+1 hours') BETWEEN ? AND ? ${admin ? "" : "AND a.doctor_id=?"} UNION ALL SELECT p.id,p.amount_millimes,p.method,p.created_at AS created_at FROM invoice_payments p JOIN invoices i ON i.id=p.invoice_id WHERE date(p.created_at,'+1 hours') BETWEEN ? AND ? ${admin ? "" : "AND i.doctor_id=?"} ORDER BY created_at`,
      from,
      to,
      ...(admin ? [] : [did]),
      from,
      to,
      ...(admin ? [] : [did]),
    );
    const slots = all(
      `SELECT * FROM schedule_slots WHERE slot_date BETWEEN ? AND ? AND kind IN ('available','urgent') ${admin ? "" : "AND doctor_id=?"}`,
      from,
      to,
      ...(admin ? [] : [did]),
    );
    const diagnoses = Object.create(null);
    if (user.role === "doctor")
      for (const row of c) {
        const value = unpack(row.clinical_payload).diagnosis?.trim();
        if (value) diagnoses[value] = (diagnoses[value] || 0) + 1;
      }
    const elapsed = a.filter(
        (x) =>
          x.status !== "cancelled" &&
          Date.parse(`${x.appointment_date}T${x.appointment_time}:00+01:00`) <
            Date.now(),
      ),
      absent = elapsed.filter((x) => x.attendance === "absent").length;
    const capacity = slots.reduce((n, s) => n + s.duration, 0);
    let occupied = 0;
    for (const s of slots) {
      const start = minutes(s.slot_time),
        end = start + s.duration;
      for (const x of a.filter(
        (x) =>
          x.doctor_id === s.doctor_id &&
          x.appointment_date === s.slot_date &&
          x.status !== "cancelled",
      ))
        occupied += Math.max(
          0,
          Math.min(end, minutes(x.appointment_time) + x.duration) -
            Math.max(start, minutes(x.appointment_time)),
        );
    }
    return {
      from,
      to,
      appointments: a.length,
      consultations: c.length,
      revenue_millimes: receipts.reduce((n, r) => n + r.amount_millimes, 0),
      absent,
      absence_rate: elapsed.length ? absent / elapsed.length : null,
      capacity_minutes: capacity,
      occupied_minutes: occupied,
      occupancy_rate: capacity ? occupied / capacity : null,
      diagnoses: Object.entries(diagnoses).map(([name, count]) => ({
        name,
        count,
      })),
      receipts,
    };
  }
  app.get(
    "/api/reports",
    roles("doctor", "secretariat", "superadmin"),
    wrap((req, res) => {
      const data = report(req.user, req.query.from, req.query.to);
      audit(req.user.id, "report.read");
      res.json({ data });
    }),
  );
  const csv = (value) =>
    '"' +
    String(value ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replace(/"/g, '""') +
    '"';
  app.get(
    "/api/reports/export",
    roles("doctor", "secretariat", "superadmin"),
    wrap(async (req, res) => {
      const r = report(req.user, req.query.from, req.query.to),
        rows = [
          ["Date UTC", "Référence", "Mode", "Montant TND"],
          ...r.receipts.map((x) => [
            x.created_at,
            x.id,
            x.method,
            (x.amount_millimes / 1000).toFixed(3),
          ]),
        ];
      audit(req.user.id, "report.exported");
      if (req.query.format === "xlsx") {
        const { default: ExcelJS } = await import("exceljs");
        const workbook = new ExcelJS.Workbook(),
          sheet = workbook.addWorksheet("Encaissements");
        rows.forEach((row, index) =>
          sheet.addRow(index ? [...row.slice(0, 3), Number(row[3])] : row),
        );
        sheet.getColumn(4).numFmt = "0.000";
        sheet.getRow(1).font = { bold: true };
        sheet.columns.forEach((column) => (column.width = 24));
        const buffer = await workbook.xlsx.writeBuffer();
        return res.json({
          data: {
            name: `journal-${r.from}-${r.to}.xlsx`,
            mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            content_base64: Buffer.from(buffer).toString("base64"),
          },
        });
      }
      res.json({
        data: {
          name: `journal-${r.from}-${r.to}.csv`,
          mime: "text/csv;charset=utf-8",
          content:
            "\ufeff" + rows.map((row) => row.map(csv).join(";")).join("\r\n"),
        },
      });
    }),
  );
  app.get(
    "/api/security-status",
    roles("superadmin"),
    wrap((req, res) =>
      res.json({
        data: {
          clinical_encryption: true,
          algorithm: "AES-256-GCM",
          full_disk_encryption: "À vérifier sur le serveur",
          external_backups: "À configurer et vérifier sur le serveur",
          legal_review: "Validation juridique et formalités INPDP requises",
          sms: false,
          email: smtpConfigured(),
          smtp_configured: smtpConfigured(),
        },
      }),
    ),
  );
  return {
    vault,
    sendEmail,
    ensureSlot,
    revealAppointment,
    revealConsultation,
    notify,
    reminders,
  };
}
