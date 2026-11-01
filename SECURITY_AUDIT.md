# MediDesk security audit — 31 October 2026

## Outcome and scope

Local source review, dependency advisory checks, isolated HTTP security tests, frontend build verification, and deployment configuration review have been completed. Critical authentication bypasses and anonymous access to protected APIs were corrected. This is a prototype with unfinished clinical workflows; it is **not approved for real patient data or a production healthcare launch**.

Scope: `backend/src`, `frontend/src`, package manifests and lockfiles, Dockerfiles, Compose, Nginx, GitLab CI, and existing test entry points. Design exports are static references, not the deployed application. No live deployment, cloud account, historical Git secret scan, external penetration test, or healthcare compliance assessment was performed.

## Corrected findings

| Severity | Finding | Correction |
| --- | --- | --- |
| Critical | Any sample-token prefix authenticated as superadmin | Removed the bypass. JWT verification restricts algorithm, issuer, audience, expiry and session version; accounts and roles are looked up on every request. |
| Critical | A universal password bypassed all stored password hashes | Removed the override and all automatic demo accounts/default passwords. Login compares bcrypt hashes and gives identical errors for unknown accounts and wrong passwords. |
| Critical | Medical, patient, doctor, secretariat and administration APIs lacked authentication | Added authentication and explicit roles. Superadmin no longer bypasses clinical roles. Shared mock workflows require explicit nonproduction demo mode. |
| High | Appointment/prescription lookup allowed access across patients | Scope appointments by server-owned `patient_id` or assigned `practitionerId`. Prescriptions require patient/practice ownership. CIN, phone and caller-supplied role cannot grant ownership. Unassigned legacy records are withheld. |
| High | Queue mutation was public | Restrict writes to authenticated doctor/secretariat accounts assigned to the requested practice. Public queue reads no longer create data. |
| High | Public JWT secret in code and Compose | Removed fallback secret; production refuses missing, short and known placeholder secrets. Compose requires an externally supplied secret. Existing leaked secrets must be rotated. CI sends registry passwords over SSH standard input instead of embedding them in remote shell commands. |
| High | Fake MFA/reset/password-change operations reported success | Reset and TOTP return 503 until implemented. Password change verifies the current password, enforces policy, persists a bcrypt hash, and invalidates sessions. Browser recovery/MFA flows no longer treat errors as success. |
| High | Tokens persisted in localStorage; logout only cleared browser state | Use HttpOnly, SameSite=Strict cookies, with Secure and `__Host-` prefix in production. Browser no longer receives or stores a JWT. Logout increments the stored session version. Cookie-authenticated writes require a CSRF header. |
| High | Predictable onboarding codes and partial CNOM matching exposed applications | Generate 192-bit random codes, require exact full-code lookup, and return only status/reference on public lookup. Older short codes are deliberately inaccessible. |
| High | Vulnerable dependencies and CI ignored audit failures | Patched backend body-parser, ip-address and qs; upgraded Vite/React plugin and patched frontend dependencies. CI now fails on moderate or higher advisories. Docker build jobs use Docker 29.9.2 with TLS to the daemon. |
| Medium | Request parsing before limits, oversized/compressed bodies, weak input validation | Rate limit before parsing; require JSON writes; limit bodies to 256 KiB; reject compressed bodies and nested public form input; validate password length and account fields. |
| Medium | Unconditional proxy trust enabled spoofed client IPs | Default proxy trust off. Compose enables one proxy hop, removes the published backend port, and Nginx replaces incoming forwarded IPs. |
| Medium | Credentials vanished on restart; corrupt database could silently reset | Persist user hashes/session versions separately with restricted file permissions. Atomic writes and configured paths are used. Corruption/write errors fail instead of silently resetting data. Destructive demo seeding is prohibited in production. |
| Medium | Container builds included runtime data/secrets; volume mounted over application source | Exclude local environments/data/dependencies from build context. Backend copies source explicitly and persists `/home/node/app/data`. Backend drops capabilities and disallows privilege escalation. |
| Medium | Missing frontend security policy and misleading health claims | Add CSP, frame denial, MIME protection, no-referrer, permissions policy and HSTS. API responses use no-store. Remove unverified compliance/TLS claims from health output and label UI data as demonstration data. |
| Medium | Generated packages and old bundles were versioned | Removed 7,484 dependency/build files from the Git index while retaining local files. Lockfiles remain versioned. Those removals are staged; application edits are left unstaged. |

## Verification

- `cd backend; npm test`: **17/17 security test groups passed** against a temporary HTTP server and isolated synthetic data. Tests cover private-route rejection, forged/unsigned/expired tokens, roles, mock guards, universal-password regression, cookie/CSRF/session behavior, patient isolation, queue ownership, registration privilege injection, onboarding references, password changes, disabled accounts, headers/CORS, malformed/oversized input, production configuration, secure production-cookie settings, and forwarded-IP rate-limit bypass.
- `npm audit --json` in both directories: **0 known vulnerabilities** on the final dependency lockfiles, including development dependencies, on the audit date. This is an advisory-database result, not proof of absence of vulnerabilities.
- `cd frontend; npm test`: **3/3 client security tests passed**, covering cookie/CSRF request configuration, destination restrictions and query-parameter injection.
- `cd frontend; npm run build`: passed with Vite 7.3.7. Existing large-bundle warning remains (approximately 791 KiB JavaScript before gzip); this is a performance issue.
- Compose configuration validation and GitLab YAML parsing passed. These are syntax/configuration checks, not deployed pipeline execution.
- `git diff --check`: passed for application/configuration changes.
- Docker CLI is installed, but the daemon is stopped. Images, runtime permissions, Nginx startup, container vulnerability scans and end-to-end TLS behavior were **not verified**. No deployment was made.
- Test HTTP access required running outside the network-restricted sandbox. Fixtures were confined to disposable `backend/security-test-*` directories; project medical data was not modified.

Relevant advisory: [body-parser compressed-request process crash](https://github.com/advisories/GHSA-27r3-jxmh-p828). The parser is patched and compression is disabled as additional protection. CI Docker 29.9.2 follows the [Docker release notes](https://docs.docker.com/engine/release-notes/29/); runner compatibility remains unverified. Vite's [runtime requirements](https://vite.dev/guide/) require a supported Node version; this audit used Node 22.12.0.

## Required configuration and behavior changes

1. Generate a new random signing key; do not reuse any previously committed value. All previous JWTs and sample credentials are invalid. Set `JWT_SECRET`, exact HTTPS `FRONTEND_URL` origins, `DB_PATH` and `USERS_PATH` for production. See `backend/.env.example`.
2. Production must sit behind a verified HTTPS terminator. Nginx in this repository listens on HTTP for the internal hop; it does not provision certificates. Secure cookies require the public HTTPS origin. The browser and API should share an origin through `/api`.
3. Start with an empty runtime users file. Provision the first administrator locally using `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters, at most 72 UTF-8 bytes) and optionally `ADMIN_NAME`, then run `npm run admin:create` in `backend`. Remove provisioning variables afterward. There is no automatic administrator.
4. Set `TRUST_PROXY=1` only when direct backend access is blocked and every request goes through the trusted single proxy. Default is off. More complex load-balancer chains need a reviewed configuration.
5. Clinical dashboard, secretariat, mock administration/team workflows, fake uploads and other shared fixture endpoints return 503 by default. `ENABLE_DEMO_DATA=true` exposes these only outside production, for synthetic demonstrations. Reset and MFA always return 503 until real implementations exist. No mock clinical record should be used for care.
6. Existing patient/practitioner ownership must be verified and migrated explicitly. Do not infer ownership from self-reported CIN, phone or email. Public guest appointments remain unassigned until a verified admission workflow links them. Do not assign old medical records automatically.
7. Persist the data volume and back it up before changing deployment paths. The previous Compose volume mounted over source code and did not match the actual JSON database path; recover and verify any old runtime files before migration. No old data was automatically moved or deleted.
8. GitLab requires a nonempty, independently verified `SSH_KNOWN_HOSTS`; deployment no longer attempts trust-on-first-use key discovery. Configure registry/deployment credentials as protected CI secrets. The Docker build runner must share `/certs/client` between the job and Docker-in-Docker service and isolate privileged builds from untrusted workloads; see [GitLab TLS setup](https://docs.gitlab.com/ci/docker/docker_in_docker/).

## Release blockers and work beyond this local audit

- **Clinical implementation:** Replace shared in-memory fixtures and frontend sample content with persistent patient/practice-scoped workflows, including authorized document storage, real medical record ownership, admissions, prescriptions, consultation writes and billing. Production currently withholds these features rather than serving another patient's fixtures. The repository's JSON SQL-like adapter is not a transactional SQL database.
- **Durable security infrastructure:** JSON user/data storage and in-process rate limits support a single application process only. Before scaling, use a transactional database, shared session revocation and rate-limit stores, backups with restore tests, least-privilege access, encryption at rest and managed key rotation. OS file modes alone do not establish encrypted storage or Windows ACL security.
- **Identity and account lifecycle:** Implement verified email/phone enrollment, secure invitation/provisioning for staff, recovery delivery and single-use reset tokens, real TOTP enrollment/replay protection, account disablement tooling and session management. These integrations are absent, so simulated security success was disabled.
- **Auditability:** Add durable access/change audit events without clinical payloads or credentials, retention controls, alerting and incident response. Existing demo security-log screens are not an audit trail.
- **Deployment assurance:** Start Docker and validate images/Nginx/volume permissions; scan base images; verify TLS, backup security, network firewall rules, trusted-proxy topology and production headers. Review the GitLab Docker-in-Docker runner, its TLS certificate sharing, privileged isolation and deployment credentials before enabling publishing/deployment jobs.
- **Data provenance and history:** Classify the legacy JSON database and design/source fixtures before sharing. If any records describe real people, handle removal/retention through the appropriate data process. The old JWT key and demo passwords remain in Git history; rotate deployed credentials, and perform an authorized historical secret scan. Removing generated artifacts from the current index does not purge history.
- **Independent assessment:** Run deployment-specific penetration testing and the applicable privacy/healthcare compliance review before processing real patient information. HDS/INPDP claims cannot be established from this code review.
