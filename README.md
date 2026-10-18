# MediDesk

French-language practice management and patient portal for Tunisia. The active application uses React/Vite, an Express API, and a persistent SQLite database. It starts with **no demo accounts, patients, doctors, prescriptions, financial records, or telemetry**.

## Development

Use Node **22.23.3** (`.nvmrc`), which provides `node:sqlite` without an external database service. Node currently marks this API experimental. Keep this runtime pinned and validate migrations before upgrading.

```sh
cd backend
npm ci
npm run dev
```

In another terminal:

```sh
cd frontend
npm ci
npm run dev
```

The frontend uses port 5173 and proxies `/api` to port 5000. `MEDIDESK_API_TARGET` can override that target. The API binds to loopback by default. API health is `GET /api/health`; it performs a database query.

**Historical checkouts may contain tracked `node_modules`; the deployment snapshot excludes them.** On Codex cloud, use the retained Linux dependencies and source copies in `/workspace/.medidesk-runtime/{backend,frontend}`. Edit source in `/workspace/Medidesk`, sync it to the runtime copy, and run commands there. See [cloud setup](docs/cloud-setup.md). A separate cleanup of historical dependency/vendor and design archives can reduce repository size.

## Create the first administrator

There are no default passwords. Public registration always creates a patient; it cannot grant a professional or administrator role. From `backend` (or its cloud runtime copy), create the first administrator against the same `DB_PATH` used by the server:

```sh
# Enter your own password without echoing it or saving it in shell history.
read -rsp 'Administrator password (8+ characters, uppercase, lowercase, digit, symbol): ' ADMIN_PASSWORD; echo
export ADMIN_PASSWORD
npm run admin:create
unset ADMIN_PASSWORD
```

The command prompts for the name and email. `ADMIN_NAME` and `ADMIN_EMAIL` may also be supplied to the process. It refuses to run if an administrator already exists. Sign in with the account you created. Use **Équipe** to create verified practitioner accounts and assign secretariats to their responsible doctor. Practitioners can create their own secretary accounts. Verify professional identity/CNOM independently; the application does not perform a registry lookup or invent registration numbers.

## Supported workflows

- Patients register, browse actual practitioners, book future appointments, cancel their own reservations, and read their own recorded consultations/prescriptions.
- Doctors see their appointments, write consultation notes/prescriptions, and record payments. A recorded consultation atomically completes its appointment.
- Secretariats see the appointments and payments of their assigned doctor. They cannot read clinical notes.
- Administrators manage professional accounts, review practitioner requests, reply to suggestions, and view actual audit events. They have no clinical-record endpoint.
- All signed-in users can submit suggestions and see their own replies. Administrators can update their status and respond.
- Profiles and passwords can be updated. Password changes and explicit logout revoke existing tokens for that account. Tokens otherwise expire after eight hours and are stored in browser session storage.
- All active screens use the same theme tokens. Settings support light/dark/system appearance, larger text, higher contrast, reduced motion, and compact/comfortable spacing. System theme changes are observed live. Preferences persist on the device. Keyboard focus, skip navigation, dialog focus management, and responsive layouts are provided.

The cabinet extension adds patient records, document storage, structured clinical observations, vital-sign trends, scheduling and waiting lists, invoices and insurance tracking, secure messages, opt-in reminders, XLSX/CSV exports and encrypted backup/restore tools. See the [feature and role matrix](docs/fonctionnalites-cabinet.md) for exact behavior and remaining integrations.

Gmail SMTP requires secure server configuration and patient consent. SMS and video remain disabled until configured and reviewed. The personal medicine catalogue is not a validated drug-interaction engine. CNAM transmissions, official forms, payment processing and certified electronic signatures are not simulated.

## Data and configuration

`backend/.env.example` documents settings. Development defaults to `backend/data/medidesk.sqlite` relative to the backend working directory. `DB_PATH` is honored, data directories are created, and database files are restricted to the process owner. SQLite uses foreign keys, WAL, a busy timeout, constraints, and transactions for coupled clinical writes. Schema initialization and the version-2 additive migration are idempotent. The former tracked prototype JSON file is not imported.

Production requires a separately generated `JWT_SECRET` of at least 32 characters and an independent retained `HEALTH_DATA_KEY` of 64 hexadecimal characters. Clinical fields use AES-256-GCM. Development keeps a private key file beside its database so restarting or changing the JWT key does not lose access to encrypted data. Development generates an ephemeral key when none is provided, so restarting invalidates existing sessions. `FRONTEND_URL` specifies exact comma-separated allowed browser origins. Set `HOST=0.0.0.0` for containers; `TRUST_PROXY=1` is appropriate only behind the controlled reverse proxy. Do not expose the backend directly when enabling proxy trust.

Do not use real clinical data until hosting, HTTPS, encryption at rest, backups and restore testing, retention, professional identity verification, access review, and relevant healthcare requirements have been implemented and reviewed for the deployment. Local SQLite storage and application access control do not establish a compliance certification. No deployment or compliance claim is made by this change.

## Validation

```sh
cd backend && npm test
cd ../frontend && npm run build
```

The Node integration suite uses isolated temporary databases and exits nonzero on failures. It checks registration privilege boundaries, removal of prototype authentication bypasses, cross-account/cabinet isolation, duplicate slots, malformed values, consultation/payment flow, persistence across restart, team creation, application review, suggestions, password changes, and production secret requirements.

Browser checks (requires frontend and backend dependencies installed):

```sh
cd frontend
npx playwright install chromium
npm run test:e2e
```

The browser runner starts isolated services on ports **5009 / 5180**, creates temporary fixture accounts, and removes its database afterward. It exercises booking, consultation, payment, suggestions/replies, patient record retrieval, role screens, mobile layout, theme persistence/system changes, text/contrast/motion settings, and axe accessibility checks. Fixture identities never seed development or production databases. Set `BROWSER_EXECUTABLE_PATH` to use an installed Chromium and `E2E_ARTIFACTS` to retain screenshots outside the temporary test directory.

## Containers

Set `JWT_SECRET`, `HEALTH_DATA_KEY` and `FRONTEND_URL` securely, then `docker compose up --build -d`. Nginx serves the frontend and proxies the API; the backend is not published directly. The persistent volume is mounted at `/home/node/app/data`, preserving application source. Create the first administrator inside the backend container using the same command and a securely supplied `ADMIN_PASSWORD`. Configure HTTPS at your ingress before external use. Publication/deployment is not performed by development setup.

## Public pages, SEO and privacy

Navigation now uses real URLs, including `/connexion`, `/inscription`, `/rejoindre`, `/confidentialite` and the account routes. Unknown paths display the custom 404 page. Nginx returns **HTTP 404**, and Vite development/preview use the same behavior. Browser back/forward and direct loading are supported.

Every route has a unique title and description, generic Open Graph/Twitter metadata, and a canonical URL when a public origin is configured. Builds generate one HTML document per route so crawlers and link-preview clients can read the metadata without JavaScript. The privacy text is also present in the generated HTML. Account pages always use `noindex, nofollow`; their descriptions contain no account or clinical information. `robots.txt` is advisory, not access control — API authentication and role checks still protect private data.

Configure the following **public build-time values**, documented in `frontend/.env.example`:

- `SITE_URL`: the final HTTPS origin, without a path (for example `https://your-owned-domain.example`).
- `PRIVACY_OPERATOR`: the actual legal operator, not a placeholder.
- `PRIVACY_EMAIL`: the operator’s monitored privacy contact.
- `PRIVACY_POLICY_REVIEWED=true`: set only after completing and reviewing the policy against actual hosting, legal basis, retention, processors and applicable rights. The supplied policy is explicitly a working draft while this remains false.

No domain or operator has been invented. With no `SITE_URL`, builds deliberately emit `Disallow: /`, an empty valid sitemap, and `noindex` metadata. Set the real origin and rebuild before enabling production indexing. A reviewed privacy page is included in the public sitemap; unreviewed drafts and all private/authentication/settings pages are excluded. Docker Compose passes these values as frontend build arguments; changing them requires rebuilding the frontend image. Never put secrets in these public values.

Sharing and icon assets live in `frontend/public`: a **1200×630 PNG** Open Graph image, its SVG source, SVG/ICO browser favicons, 16/32-pixel PNGs, an Apple touch icon, Android 192/512-pixel icons, and a web manifest. Open Graph and Twitter image descriptions are included in every page’s metadata. Current on-screen illustrations are decorative SVG icons with adjacent text rather than unnamed image elements; browser checks reject any rendered `<img>` without an `alt` attribute. Regenerate assets with `npm run assets:generate` after installing Playwright Chromium, or set `BROWSER_EXECUTABLE_PATH` to an existing browser.

The public directory has a primary account CTA above the fold on desktop and mobile. API reads show an accessible loading status; form submissions disable their fields and submit button until the actual response arrives, and retain errors when a request fails.

### Analytics

First-party analytics is installed and operational without a third-party key or external script. It is **opt-in**: use **Confidentialité & mesure d’audience** in the footer or the comfort settings to allow, refuse or withdraw permission. The browser’s Do Not Track / Global Privacy Control signal takes precedence. No event is sent before permission or for private/authentication pages.

`POST /api/analytics/events` accepts only `{ "page": "directory" | "application" | "privacy", "consent": true }`, rejects extra fields, and increments a `(UTC day, page)` counter. The client sends no authorization header, cookies, referrer, query parameters, IDs, names or form contents. The statistics table contains only `day`, `page` and `views`. Counters are retained for 90 days and purged during ingestion/reporting. Rate limiting uses the existing in-memory request controls; network intermediaries can retain their own logs as described in the privacy draft.

Administrators can see the last 30 days at **Statistiques** (`/statistiques`); other roles receive no report access. Counts represent opted-in page views, not unique people or verified human visits. The application does not run GA4, advertising pixels, session replay, clinical-event tracking or cross-site analytics.

Run `npm test` in the frontend for route/metadata/crawler/asset checks, `npm test` in the backend for analytics consent/payload/access/retention checks, and `npm run test:e2e` in the frontend for direct URLs, history, 404 status, consent withdrawal, page titles, CTA visibility and delayed-request loading states alongside the existing workflows.

Revue de sécurité et contrôles de production : [rapport du 19 octobre 2026](docs/security-review.md).
