# First production release

Target: Ubuntu server `57.131.145.168`, user `ubuntu`, directory `/srv/medidesk`.
No release has been uploaded or deployed yet. SSH port 22 refused the connection
from the cloud environment. Confirm SSH access before provisioning anything.

## Delivery pipeline

GitHub Actions is the primary pipeline. `ci.yml` validates pull requests and main/develop
pushes with locked dependencies, dependency audits, API/SEO/browser tests, frontend
builds and both container builds. `release.yml` is manually dispatched from main:
it runs CI, publishes commit-tagged GHCR images and optionally deploys their exact
digests. The GitLab file provides mirror validation only.

These working-tree changes must reach GitHub main before these workflows exist on
the remote. A successful local check does not establish a successful GitHub run.

## Isolated Nginx and public address

The selected deployment uses a dedicated Nginx container on host TCP ports **8080**
and **8443**, an independent Compose network and its own SQLite volume. It does not
join `azayez_website_default`, recreate `mtc_nginx`, or route application traffic through that container.
The owner has authorized only an additional HTTP ACME challenge server block in
the existing mounted Nginx config; its existing site blocks remain unchanged.
The existing application keeps all of its ports, networks and certificates.

The intended URL is `https://medidesk.57.131.145.168.sslip.io:8443`.
This is an intended address, not a live deployment. Set SITE_URL to the exact HTTPS
origin including :8443 for frontend metadata, API CORS and release health checks.
HTTP port 8080 redirects to that origin once a valid certificate is provisioned.

## Certificate bootstrap (authorized challenge route only)

1. Start a temporary dedicated Nginx on 8080 using `acme-bootstrap.conf` and mount
   `/srv/medidesk/acme` read-only at `/var/www/medidesk-acme`. It serves only the
   `/.well-known/acme-challenge/` path; all other paths return 404.
2. Inspect the gateway of `azayez_website_default`. Test from `mtc_nginx` that
   `http://GATEWAY:8080/.well-known/acme-challenge/medidesk-check` returns a probe.
3. Back up the existing mounted file. Append the hostname-specific block from
   `mtc-acme-route.conf`, substituting the tested gateway address. Because the
   existing file is individually bind-mounted, write in place rather than replacing
   its inode. Run `docker exec mtc_nginx nginx -t` before reloading; if validation
   fails restore the backup in place and validate again, without reloading.
4. Verify the probe through public HTTP on the exact hostname. Only then run
   `certbot certonly --webroot -w /srv/medidesk/acme` for that hostname, retaining
   existing certificate lineages. Do not stop either existing application or proxy.
5. Copy the new certificate and private key to the separate certificate directory.
   Stop only the temporary challenge container to free 8080; launch MediDesk's
   production gateway, which continues serving that same challenge directory.
6. Configure and verify a renewal deploy hook restricted to the MediDesk lineage:
   copy renewed files to its certificate directory, validate the dedicated gateway
   configuration and gracefully reload only that gateway. Keep the public challenge
   route active. Rehearse renewal using Certbot's dry run.

DNS must resolve to this server and public HTTP must reach its existing Nginx.
Certificate issuance is not complete until verified on the server. Do not use
`curl -k` to pass a release check. The intended HTTPS URL includes **:8443**.

Install the resulting `fullchain.pem` and `privkey.pem` under `/srv/medidesk/certs`,
with a protected directory and private key. Nginx mounts only this directory, not
the existing application's certificates. Configure automated renewal and reload
only the medidesk gateway after successful renewal. The stack intentionally fails
startup without certificates. Allow inbound TCP 8080/8443 when ready to launch.

## First manual upload

The reviewed source bundle extracts into `/srv/medidesk/source`. It contains no
credentials, database files or installed node_modules. After verifying its SHA256,
run `bash /srv/medidesk/source/deploy/install-first.sh` as ubuntu. This builds both
images on the server, generates a host-only JWT secret if no .env exists, installs
a lineage-specific certificate renewal hook, and replaces only the MediDesk
bootstrap container with the production stack. If container startup fails, it
restores the bootstrap service and retains data volumes. The original application
is not stopped. The public HTTPS API/database check must pass before declaring
launch successful. The source is an upload of the working tree, not a GitHub
release; the CI workflows still need to be pushed and run remotely.

This manual stack uses local image tags and is not automatically adopted by the
immutable-digest release script. Before switching to CI deployment, explicitly
record a compatible previous release and preserve the `medidesk_backend-data`
volume; do not delete volumes to bypass the unmanaged-stack guard.

## One-time server provisioning

Using the server console or an independently verified SSH connection:

1. Inspect running services and occupied ports before installing or changing anything.
2. Install Docker Engine and the Compose v2 plugin using Docker's official Ubuntu
   instructions. The deployment user needs permission to run Docker (root-equivalent).
3. Create `/srv/medidesk/releases` owned by the deployment user; restrict access to
   the parent directory. Keep runtime configuration outside Git and release bundles.
4. Copy `deploy/server.env.example` to `/srv/medidesk/.env`, mode 600. Generate a
   unique JWT secret on the host (`openssl rand -hex 48`) and keep it on the server. Do not paste secrets into issue comments, logs or chat.
5. Authorize a dedicated deployment public key for the deployment user. Verify the
   server host-key fingerprint through the provider console before trusting it.
6. Ensure the server can pull both GHCR images. For private packages, log Docker in
   on the server using a read-only packages credential and stdin; never put the
   credential in release metadata. Public packages need no registry login.

## GitHub configuration

Repository Actions variables:

- `SITE_URL`: the chosen `https://hostname:8443`, without a path.
- `PRIVACY_OPERATOR`, `PRIVACY_EMAIL`: the actual service operator and privacy contact.
- `PRIVACY_POLICY_REVIEWED`: set `true` only after reviewing the published policy.

Create the `production` environment. Its variables are `DEPLOY_HOST=57.131.145.168`,
`DEPLOY_USER=ubuntu`, and `DEPLOY_PORT` (22 unless the server uses another port).
Its secrets are `DEPLOY_SSH_KEY` (dedicated private key) and `DEPLOY_KNOWN_HOSTS`
(independently verified OpenSSH known-hosts entry, including port when nonstandard).
Restrict production deployments to main; add environment reviewers if desired.
GitHub's built-in token publishes packages; no separate registry publishing token
is required in the workflow.

Run **Release MediDesk** from main with deployment disabled first to validate and
publish. Then run with deployment enabled. The server health check must confirm
both API availability and database connectivity through public HTTPS before the
release is marked current. Create the first administrator using the documented
backend CLI through an interactive server terminal; there are no default accounts.

## Storage and recovery

SQLite uses a persistent Compose volume; Nginx certificates live in the protected host directory. Upgrades take an online
SQLite backup inside the backend data volume before replacing containers.
Backups on the same disk are not disaster recovery: arrange encrypted off-server
copies and retention before storing patient data.

A failed upgrade restores previous container images; a failed first deployment
removes containers while retaining volumes. Database changes are not automatically
reversed. Before an incompatible schema change, plan and rehearse a database
restore. The release script never prunes Docker resources or removes data volumes.

To restore a previous compatible release, invoke its `deploy/release.sh` with its
full SHA on the server. Keep previous bundles/images available. A single-server
Compose update may briefly interrupt service; this is not a zero-downtime setup.

## Local validation

`node --test deploy/test/release.test.mjs` covers successful deployment, rollback,
failed public health checks, failed pulls, unmanaged stacks and mutable-tag rejection.
`bash -n deploy/release.sh deploy/ssh-release.sh` checks shell syntax.
Run application checks through the cloud setup runtime described in `cloud-setup.md`.
