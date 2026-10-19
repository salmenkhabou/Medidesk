#!/usr/bin/env bash
set -euo pipefail
umask 077
# Run via a root-owned timer. Only MediDesk is addressed.
container=$(docker ps --filter label=com.docker.compose.project=medidesk --filter label=com.docker.compose.service=backend --format '{{.ID}}')
[[ -n "$container" && "$container" != *$'\n'* ]] || { echo 'Expected exactly one MediDesk backend.' >&2; exit 1; }
name="medidesk-$(date -u +%Y%m%dT%H%M%S)-$$.sqlite.enc"
path="/home/node/app/data/backups/$name"
docker exec -e BACKUP_TARGET="$path" "$container" node --input-type=module -e 'import {backupDatabase} from "./src/backup.js";import {encryptBackup} from "./src/backup-codec.js";import {rmSync} from "node:fs";const target=process.env.BACKUP_TARGET;const plain=target.slice(0,-4);await backupDatabase(undefined,plain);try{await encryptBackup(plain,target);}finally{rmSync(plain,{force:true});}'
echo 'Encrypted local backup completed.'
if [[ -f /srv/medidesk/backup-offsite.json ]]; then
 temporary=$(mktemp -d)
 trap 'rm -rf "$temporary"' EXIT
 docker cp "$container:$path" "$temporary/$name"
 chmod 600 "$temporary/$name"
 /usr/local/sbin/medidesk-backup-offsite "$temporary/$name"
else
 echo 'Off-site backup is NOT configured. The encrypted copy is only on this server.' >&2
fi
