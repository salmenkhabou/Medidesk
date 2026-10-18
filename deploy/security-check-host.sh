#!/usr/bin/env bash
# Read-only checks for the dedicated MediDesk deployment. Never inspect other projects.
set -euo pipefail
root=${MEDIDESK_DEPLOY_ROOT:-/srv/medidesk}
site=https://medidesk.57.131.145.168.sslip.io:8443
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
printf 'MediDesk: read-only HTTPS and deployment checks\n'
[[ -f "$root/.env" ]] || { echo 'Missing deployment environment file.' >&2; exit 1; }
mode=$(stat -c '%a' "$root/.env")
[[ "$mode" == 600 ]] || { echo 'The deployment .env must have mode 600.' >&2; exit 1; }
# Never print or source environment secrets.
curl --noproxy '*' --proto '=https' --tlsv1.2 --fail --silent --show-error --max-time 20 -D "$tmp/site.headers" -o /dev/null "$site/"
curl --noproxy '*' --proto '=https' --tlsv1.2 --fail --silent --show-error --max-time 20 -D "$tmp/api.headers" -o "$tmp/health.json" "$site/api/health"
python3 - "$tmp" <<'PY'
import sys,json,pathlib
folder=pathlib.Path(sys.argv[1])
headers=(folder/'site.headers').read_text().lower()
for header in ['content-security-policy:', 'x-content-type-options: nosniff', 'x-frame-options: deny', 'referrer-policy:']:
 if header not in headers: raise SystemExit('Missing site protection: '+header)
if 'no-store' not in (folder/'api.headers').read_text().lower(): raise SystemExit('Missing API no-store cache policy.')
data=json.loads((folder/'health.json').read_text())
if data.get('status')!='online' or data.get('database')!='connected': raise SystemExit('API/database health failed.')
print('PASS: HTTPS certificate validation, site headers, API cache policy, database health, .env permissions.')
PY
for service in backend frontend; do
 container=$(sudo docker ps --filter label=com.docker.compose.project=medidesk --filter "label=com.docker.compose.service=$service" --format '{{.ID}}')
 [[ -n "$container" && "$container" != *$'\n'* ]] || { echo "Expected exactly one MediDesk $service container." >&2; exit 1; }
 sudo docker inspect --format '{{json .HostConfig.PortBindings}}' "$container" |
   python3 -c 'import json,sys; assert not json.load(sys.stdin), "Internal service unexpectedly published to the host"'
done
printf 'PASS: MediDesk backend and frontend have no direct published host ports.\n'
sudo docker ps --filter label=com.docker.compose.project=medidesk --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
for timer in certbot.timer medidesk-backup.timer; do
 if systemctl is-active --quiet "$timer"; then printf 'Active: %s\n' "$timer"; else printf 'TO VERIFY: %s inactive or renewal scheduled by another mechanism.\n' "$timer"; fi
done
printf 'These checks do not assess OVH firewall rules, SSH access, off-server backups or legal compliance.\n'
