import "dotenv/config";
import { createApp } from "./app.js";
const app = createApp();
const server = app.listen(
  Number(process.env.PORT || 5000),
  process.env.HOST || "127.0.0.1",
  () => console.log(`MediDesk API ready on port ${server.address().port}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.close(() => process.exit(0)));
