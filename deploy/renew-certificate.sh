#!/usr/bin/env bash
# Install as /etc/letsencrypt/renewal-hooks/deploy/medidesk with root ownership.
set -euo pipefail
expected=/etc/letsencrypt/live/medidesk.57.131.145.168.sslip.io
[[ "${RENEWED_LINEAGE:-}" == "$expected" ]] || exit 0
openssl x509 -in "$expected/fullchain.pem" -noout -checkend 3600 >/dev/null
openssl x509 -in "$expected/fullchain.pem" -noout -checkhost medidesk.57.131.145.168.sslip.io >/dev/null
install -d -m 0700 /srv/medidesk/certs
install -m 0644 "$expected/fullchain.pem" /srv/medidesk/certs/fullchain.pem
install -m 0600 "$expected/privkey.pem" /srv/medidesk/certs/privkey.pem
mapfile -t gateways < <(docker ps --filter label=com.docker.compose.project=medidesk --filter label=com.docker.compose.service=gateway --format '{{.ID}}')
for gateway in "${gateways[@]}"; do
    docker exec "$gateway" nginx -t
    docker exec "$gateway" nginx -s reload
done
