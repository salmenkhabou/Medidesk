import nodemailer from "nodemailer";
export const smtpConfigured = () =>
  !!(
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  );
export function emailWorker({ db, vault, transport } = {}) {
  let running = false;
  const mailer =
    transport ||
    (smtpConfigured()
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
          tls: { minVersion: "TLSv1.2" },
          connectionTimeout: 10000,
          socketTimeout: 15000,
        })
      : null);
  return async () => {
    if (running || !mailer) return;
    running = true;
    try {
      const jobs = db
        .prepare(
          "SELECT q.*,u.email,u.email_reminders_opt_in FROM email_queue q JOIN users u ON u.id=q.user_id WHERE q.status='pending' AND q.attempts<3 ORDER BY q.id LIMIT 20",
        )
        .all();
      for (const job of jobs) {
        const appointmentId = Number(job.reference.split(":").at(-1));
        const appointment = db
          .prepare(
            "SELECT status,appointment_date,appointment_time FROM appointments WHERE id=?",
          )
          .get(appointmentId);
        if (
          !appointment ||
          appointment.status !== "confirmed" ||
          Date.parse(
            `${appointment.appointment_date}T${appointment.appointment_time}:00+01:00`,
          ) <= Date.now() ||
          !job.email_reminders_opt_in ||
          job.email.endsWith("@patients.invalid")
        ) {
          db.prepare(
            "UPDATE email_queue SET status='cancelled' WHERE id=?",
          ).run(job.id);
          continue;
        }
        db.prepare("UPDATE email_queue SET attempts=attempts+1 WHERE id=?").run(
          job.id,
        );
        try {
          const content = vault.unpack(job.payload);
          await mailer.sendMail({
            from: process.env.SMTP_FROM,
            to: job.email,
            subject: content.subject,
            text: content.text,
            disableFileAccess: true,
            disableUrlAccess: true,
          });
          db.prepare(
            "UPDATE email_queue SET status='sent',sent_at=datetime('now') WHERE id=?",
          ).run(job.id);
        } catch {
          db.prepare(
            "UPDATE email_queue SET status=CASE WHEN attempts>=3 THEN 'failed' ELSE 'pending' END WHERE id=?",
          ).run(job.id);
        }
      }
    } finally {
      running = false;
    }
  };
}
