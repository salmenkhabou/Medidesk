import "dotenv/config";
import nodemailer from "nodemailer";
import { smtpConfigured } from "./mail.js";
if (!smtpConfigured())
  throw Error(
    "Configure SMTP_USER, SMTP_PASSWORD and SMTP_FROM securely on the server.",
  );
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  tls: { minVersion: "TLSv1.2" },
  connectionTimeout: 10000,
  socketTimeout: 15000,
});
try {
  await transport.verify();
  console.log(
    "SMTP authentication and TLS verified. A real opted-in reminder is still needed to verify delivery.",
  );
} catch {
  console.error(
    "SMTP verification failed. Check the server configuration and Gmail app-password settings.",
  );
  process.exitCode = 1;
} finally {
  transport.close();
}
