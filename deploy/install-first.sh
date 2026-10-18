#!/usr/bin/env bash
# Run as ubuntu: bash /srv/medidesk/source/deploy/install-first.sh
set -euo pipefail
umask 077
root=/srv/medidesk
source_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
[[ "$source_dir" == "$root/source" ]] || { echo 'Extract the bundle into /srv/medidesk/source first.' >&2; exit 1; }
[[ -f /etc/letsencrypt/live/medidesk.57.131.145.168.sslip.io/fullchain.pem ]] || sudo test -f /etc/letsencrypt/live/medidesk.57.131.145.168.sslip.io/fullchain.pem
sudo install -d -m 0755 /etc/letsencrypt/renewal-hooks/deploy
sudo install -o root -g root -m 0750 "$source_dir/deploy/renew-certificate.sh" /etc/letsencrypt/renewal-hooks/deploy/medidesk
sudo env RENEWED_LINEAGE=/etc/letsencrypt/live/medidesk.57.131.145.168.sslip.io /etc/letsencrypt/renewal-hooks/deploy/medidesk
if [[ ! -e "$root/.env" ]]; then
    secret=$(openssl rand -hex 48)
    (set -o noclobber; printf 'JWT_SECRET=%s\nSITE_URL=https://medidesk.57.131.145.168.sslip.io:8443\nSITE_HOST=medidesk.57.131.145.168.sslip.io\nBACKEND_IMAGE=medidesk-backend:first-version\nFRONTEND_IMAGE=medidesk-frontend:first-version\nPRIVACY_POLICY_REVIEWED=false\n' "$secret" > "$root/.env")
    unset secret
fi
chmod 0600 "$root/.env"
compose() { sudo docker compose --project-name medidesk --env-file "$root/.env" -f "$source_dir/deploy/compose.yml" -f "$source_dir/deploy/compose.build.yml" "$@"; }
[[ -z "$(compose ps -aq)" ]] || { echo 'A MediDesk deployment already exists; use a reviewed upgrade procedure instead.' >&2; exit 1; }
compose config --quiet
compose build --pull
# Only the known MediDesk bootstrap container is stopped, and only after builds pass.
sudo docker stop medidesk-acme-bootstrap
if ! compose up -d --wait --wait-timeout 180; then
    compose down
    sudo docker start medidesk-acme-bootstrap
    echo 'Launch failed; challenge service restored. Existing website untouched.' >&2
    exit 1
fi
curl --noproxy '*' --fail --silent --show-error --retry 10 --retry-delay 2 --retry-all-errors --max-time 10 https://medidesk.57.131.145.168.sslip.io:8443/api/health |
    python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("status")=="online" and d.get("database")=="connected"; print("HTTPS, API and database health checks passed.")'
echo 'Local launch passed. Verify public port 8443 before sharing the URL.'
