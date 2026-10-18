import "dotenv/config";
import { createApp } from "./app.js";
const app = createApp();
const server = app.listen(
  Number(process.env.PORT || 5000),
  process.env.HOST || "127.0.0.1",
  () => console.log(`MediDesk API ready on port ${server.address().port}`),
);
const jobs = setInterval(() => {
  try {
    app.locals.practice.reminders();
    void app.locals.practice
      .sendEmail()
      .catch(() => console.error("Email worker failed."));
  } catch {
    console.error("Reminder worker failed.");
  }
}, 60000);
jobs.unref();
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    clearInterval(jobs);
    server.close(() => process.exit(0));
  });
