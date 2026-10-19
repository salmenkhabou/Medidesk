#!/usr/bin/env bash
# Upgrade the isolated manual deployment, including the encrypted schema migration.
set -euo pipefail
umask 077
root=${MEDIDESK_DEPLOY_ROOT:-/srv/medidesk}
root=$(cd "$root" && pwd -P)
source_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
[[ "$source_dir" == "$root/source" && -f "$root/.env" ]] || { echo 'Expected the existing manual deployment.' >&2; exit 1; }
exec 9>"$root/.practice-upgrade.lock"
flock -n 9 || { echo 'Another upgrade is active.' >&2; exit 1; }
if ! grep -q '^HEALTH_DATA_KEY=' "$root/.env"; then printf '\nHEALTH_DATA_KEY=%s\n' "$(openssl rand -hex 32)" >> "$root/.env"; fi
chmod 0600 "$root/.env"
python3 - "$root/.env" <<'PY'
import sys,re
value=next((line.rstrip('\n').split('=',1)[1] for line in open(sys.argv[1]) if line.startswith('HEALTH_DATA_KEY=')),'')
if not re.fullmatch('[a-fA-F0-9]{64}',value): raise SystemExit('HEALTH_DATA_KEY must be a retained independent 64-character hexadecimal key. Do not overwrite an existing key.')
PY
compose_for() { local backend=$1 frontend=$2; shift 2; sudo env BACKEND_IMAGE="$backend" FRONTEND_IMAGE="$frontend" docker compose --project-name medidesk --env-file "$root/.env" -f "$source_dir/deploy/compose.yml" -f "$source_dir/deploy/compose.build.yml" "$@"; }
backend_container=$(sudo docker ps --filter label=com.docker.compose.project=medidesk --filter label=com.docker.compose.service=backend --format '{{.ID}}')
frontend_container=$(sudo docker ps --filter label=com.docker.compose.project=medidesk --filter label=com.docker.compose.service=frontend --format '{{.ID}}')
[[ -n "$backend_container" && -n "$frontend_container" && "$backend_container$frontend_container" != *$'\n'* ]] || { echo 'Expected one running MediDesk backend and frontend.' >&2; exit 1; }
volume=$(sudo docker inspect --format '{{range .Mounts}}{{if eq .Destination "/home/node/app/data"}}{{if eq .Type "volume"}}{{.Name}}{{end}}{{end}}{{end}}' "$backend_container")
[[ "$volume" == medidesk_backend-data ]] || { echo 'Unexpected database volume; explicit adoption is required.' >&2; exit 1; }
stamp=$(date -u +%Y%m%d%H%M%S)
previous_backend="medidesk-backend:before-practice-$stamp"
previous_frontend="medidesk-frontend:before-practice-$stamp"
sudo docker tag "$(sudo docker inspect --format '{{.Image}}' "$backend_container")" "$previous_backend"
sudo docker tag "$(sudo docker inspect --format '{{.Image}}' "$frontend_container")" "$previous_frontend"
revision=$(git -C "$source_dir" rev-parse --short=12 HEAD)
next_backend="medidesk-backend:practice-$revision"
next_frontend="medidesk-frontend:practice-$revision"
backup_path="/home/node/app/data/backups/pre-practice-$stamp.sqlite"
compose_for "$next_backend" "$next_frontend" config --quiet
compose_for "$next_backend" "$next_frontend" build backend frontend
stopped=0
migration_started=0
successful=0
save_refs() {
 python3 - "$root/.env" "$1" "$2" <<'PY'
import sys,os,tempfile
from pathlib import Path
path=Path(sys.argv[1]);lines=path.read_text().splitlines()
values={'BACKEND_IMAGE':sys.argv[2],'FRONTEND_IMAGE':sys.argv[3]}
lines=[line for line in lines if line.split('=',1)[0] not in values]
fd,name=tempfile.mkstemp(prefix='.environment-',dir=path.parent)
try:
 with os.fdopen(fd,'w') as handle: handle.write('\n'.join(lines+[f'{k}={v}' for k,v in values.items()])+'\n')
 os.replace(name,path)
finally:
 if os.path.exists(name): os.unlink(name)
PY
}
recover() {
 local result=$?
 trap - EXIT
 if (( successful == 0 && stopped == 1 )); then
  echo 'Upgrade failed. Recovering only the MediDesk stack.' >&2
  if (( migration_started == 1 )); then
   compose_for "$next_backend" "$next_frontend" down || { echo 'Could not stop MediDesk; no live database files will be replaced.' >&2; exit 1; }
   sudo docker run --rm --network none --env-file "$root/.env" -e RESTORE_CONFIRMED_BACKEND_STOPPED=YES -v "$volume:/home/node/app/data" "$next_backend" node src/restore.js "$backup_path.enc" --restore || { echo 'Automatic database restore failed. Keep MediDesk stopped and use the retained encrypted backup.' >&2; exit 1; }
  fi
  save_refs "$previous_backend" "$previous_frontend"
  compose_for "$previous_backend" "$previous_frontend" up -d --force-recreate --wait --wait-timeout 180 || { echo 'Previous images could not restart; operator recovery is required.' >&2; exit 1; }
 fi
 exit "$result"
}
trap recover EXIT
# Build first, then stop only our API and gateway while taking the consistent snapshot.
compose_for "$previous_backend" "$previous_frontend" stop gateway backend
stopped=1
sudo docker run --rm --network none -e BACKUP_TARGET="$backup_path" -v "$volume:/home/node/app/data" "$previous_backend" node --input-type=module -e 'import {DatabaseSync,backup} from "node:sqlite";import {mkdirSync,chmodSync} from "node:fs";mkdirSync("./data/backups",{recursive:true,mode:0o700});const db=new DatabaseSync("./data/medidesk.sqlite",{readOnly:true});try{await backup(db,process.env.BACKUP_TARGET);chmodSync(process.env.BACKUP_TARGET,0o600);}finally{db.close();}'
sudo docker run --rm --network none --env-file "$root/.env" -e BACKUP_TARGET="$backup_path" -v "$volume:/home/node/app/data" "$next_backend" node --input-type=module -e 'import {encryptBackup} from "./src/backup-codec.js";import {unlinkSync} from "node:fs";await encryptBackup(process.env.BACKUP_TARGET,process.env.BACKUP_TARGET+".enc");unlinkSync(process.env.BACKUP_TARGET);'
save_refs "$next_backend" "$next_frontend"
migration_started=1
compose_for "$next_backend" "$next_frontend" up -d --force-recreate --wait --wait-timeout 180
curl --noproxy '*' --fail --silent --show-error --retry 10 --retry-delay 2 --retry-all-errors --max-time 10 https://medidesk.57.131.145.168.sslip.io:8443/api/health |
 python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("status")=="online" and d.get("database")=="connected"'
successful=1
# Retain the independent encryption key in a secure off-server recovery location.
sudo install -o root -g root -m 0750 "$source_dir/deploy/backup-on-host.sh" /usr/local/sbin/medidesk-backup
sudo install -o root -g root -m 0750 "$source_dir/deploy/backup-offsite.py" /usr/local/sbin/medidesk-backup-offsite
sudo install -o root -g root -m 0644 "$source_dir/deploy/medidesk-backup.service" /etc/systemd/system/medidesk-backup.service
sudo install -o root -g root -m 0644 "$source_dir/deploy/medidesk-backup.timer" /etc/systemd/system/medidesk-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now medidesk-backup.timer
echo 'Upgrade and HTTPS/database checks passed. Daily encrypted backups enabled. Configure and test off-server copies separately.'
echo 'Gmail SMTP and video remain disabled until their secure server configuration is supplied.'
