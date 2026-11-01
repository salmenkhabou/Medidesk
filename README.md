# Medidesk

Healthcare application prototype with a React/Vite frontend and Express API.

Read [SECURITY_AUDIT.md](SECURITY_AUDIT.md) before running or deploying. Clinical/demo workflows are disabled by default and are not ready for real patient data.

Use Node 22.12 or newer in the Node 22 line. Run `npm ci` in `backend` and `frontend`. Start the API with `npm run dev` in `backend` and Vite with `npm run dev` in `frontend`. There are no default accounts; register a patient or provision an administrator as documented in the audit. To view synthetic demo endpoints locally, explicitly set `ENABLE_DEMO_DATA=true` outside production.

Run `npm test` in `backend`, `npm test` and `npm run build` in `frontend`, and `npm audit` in both directories. Production requires new secrets, HTTPS and explicit persistent data paths; see `backend/.env.example` and the audit's release blockers.
