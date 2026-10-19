#!/usr/bin/env bash
# Run interactively on the VPS; never send a password through chat or command arguments.
set -euo pipefail
umask 077
root=${MEDIDESK_DEPLOY_ROOT:-/srv/medidesk}
[[ -t 0 && -f "$root/.env" && -f "$root/source/deploy/compose.yml" ]] || { echo 'Run this in the MediDesk server terminal.' >&2; exit 1; }
exec 9>"$root/.practice-upgrade.lock"
flock -n 9 || { echo 'Another MediDesk operation is active.' >&2; exit 1; }
read -rp 'Adresse Gmail qui enverra les emails : ' MEDIDESK_GMAIL_USER
read -rsp 'Mot de passe APPLICATION Google (16 lettres, saisie masquée) : ' MEDIDESK_GMAIL_APP_PASSWORD
printf '\n'
export MEDIDESK_GMAIL_USER MEDIDESK_GMAIL_APP_PASSWORD
python3 - "$root/.env" <<'PY'
import os,re,sys,tempfile
from pathlib import Path
user=os.environ['MEDIDESK_GMAIL_USER'].strip().lower()
password=''.join(os.environ['MEDIDESK_GMAIL_APP_PASSWORD'].split())
if not re.fullmatch(r'[a-z0-9._%+\-]+@(?:gmail\.com|googlemail\.com)',user): raise SystemExit('Une adresse Gmail est requise pour cet assistant.')
if not re.fullmatch(r'[a-zA-Z]{16}',password): raise SystemExit('Utilisez un mot de passe APPLICATION Google de 16 lettres, pas votre mot de passe Gmail.')
path=Path(sys.argv[1]); lines=path.read_text().splitlines()
values={'SMTP_HOST':'smtp.gmail.com','SMTP_USER':user,'SMTP_FROM':user,'SMTP_PASSWORD':password}
lines=[line for line in lines if line.split('=',1)[0] not in values]
fd,name=tempfile.mkstemp(prefix='.gmail-config-',dir=path.parent)
try:
 with os.fdopen(fd,'w') as f: f.write('\n'.join(lines)+'\n'+'\n'.join(k+'='+v for k,v in values.items())+'\n')
 os.chmod(name,0o600);os.replace(name,path)
finally:
 if os.path.exists(name):os.unlink(name)
print('Configuration enregistrée sans affichage des identifiants.')
PY
unset MEDIDESK_GMAIL_USER MEDIDESK_GMAIL_APP_PASSWORD
sudo docker compose --project-name medidesk --env-file "$root/.env" -f "$root/source/deploy/compose.yml" up -d --no-deps --force-recreate --wait --wait-timeout 180 backend
backend=$(sudo docker ps --filter label=com.docker.compose.project=medidesk --filter label=com.docker.compose.service=backend --format '{{.ID}}')
frontend=$(sudo docker ps --filter label=com.docker.compose.project=medidesk --filter label=com.docker.compose.service=frontend --format '{{.ID}}')
[[ -n "$backend" && -n "$frontend" && "$backend$frontend" != *$'\n'* ]] || { echo 'Expected one MediDesk backend and frontend.' >&2; exit 1; }
# Refresh the private upstream after the backend was recreated.
sudo docker exec "$frontend" nginx -t
sudo docker exec "$frontend" nginx -s reload
sudo docker exec "$backend" node src/smtp-verify.js
echo 'Demandez ensuite un code de vérification dans Paramètres > Sécurité et vérifiez sa réception (y compris les spams).'
