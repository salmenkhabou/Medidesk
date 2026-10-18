#!/usr/bin/env bash
# Runs on the deployment host. Runtime secrets stay in /srv/medidesk/.env.
set -euo pipefail
umask 077
revision=${1:?Usage: release.sh FULL_GIT_SHA}
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || { echo 'A full source SHA is required.' >&2; exit 1; }
root=${MEDIDESK_DEPLOY_ROOT:-/srv/medidesk}
root=$(cd "$root" && pwd -P)
candidate="$root/releases/$revision"
script_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
[[ "$script_root" == "$candidate" ]] || { echo 'Run the script from the matching uploaded release.' >&2; exit 1; }
[[ -f "$root/.env" && -f "$candidate/images.env" && -f "$candidate/deploy/compose.yml" && -f "$candidate/deploy/nginx.conf.template" ]] || { echo 'Provision the server environment and upload a complete release first.' >&2; exit 1; }
[[ ! -e "$root/current" || -L "$root/current" ]] || { echo 'Refusing to overwrite an existing non-symlink current path.' >&2; exit 1; }
exec 9>"$root/.deploy.lock"
flock -n 9 || { echo 'Another deployment is active.' >&2; exit 1; }
site_url=$(sed -n 's/^SITE_URL=//p' "$candidate/images.env")
[[ "$site_url" =~ ^https://[a-zA-Z0-9][a-zA-Z0-9.-]*:8443$ ]] || { echo 'Release metadata needs an HTTPS origin on isolated port 8443.' >&2; exit 1; }
[[ "$(sed -n 's/^RELEASE_SHA=//p' "$candidate/images.env")" == "$revision" ]] || { echo 'Release metadata revision mismatch.' >&2; exit 1; }
for key in BACKEND_IMAGE FRONTEND_IMAGE; do
  image=$(sed -n "s/^$key=//p" "$candidate/images.env")
  [[ "$image" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || { echo 'Immutable image digests are required.' >&2; exit 1; }
done
compose() {
  local release=$1; shift
  docker compose --project-name medidesk --env-file "$root/.env" --env-file "$release/images.env" -f "$release/deploy/compose.yml" "$@"
}
previous=''
if [[ -L "$root/current" ]]; then
  previous=$(readlink -f "$root/current")
  [[ "$previous" == "$root/releases/"* && -f "$previous/images.env" ]] || { echo 'Existing release link is not a valid managed release.' >&2; exit 1; }
else
  [[ -z "$(compose "$candidate" ps -q)" ]] || { echo 'Unmanaged existing MediDesk containers found. Adopt them explicitly before deploying.' >&2; exit 1; }
fi
compose "$candidate" config --quiet
compose "$candidate" pull --quiet
if [[ -n "$previous" ]]; then
  # SQLite's online backup API, not a raw copy of a live WAL database.
  compose "$previous" exec -T backend node src/backup.js
fi
rollback() {
  if [[ -n "$previous" ]]; then
    echo 'Release checks failed; restoring the previous container images.' >&2
    compose "$previous" up -d --wait --wait-timeout 180 || { echo 'Rollback health checks failed; operator intervention is required.' >&2; return 1; }
  else
    echo 'First-release checks failed; removing only this stack while retaining its volumes.' >&2
    compose "$candidate" down
  fi
}
if ! compose "$candidate" up -d --wait --wait-timeout 180; then rollback; exit 1; fi
if ! curl --fail --silent --show-error --retry 12 --retry-delay 5 --retry-all-errors --max-time 10 "$site_url/api/health" |
  python3 -c 'import json,sys; result=json.load(sys.stdin); sys.exit(0 if result.get("status")=="online" and result.get("database")=="connected" else 1)'; then
  rollback; exit 1
fi
next_link="$root/.current.$revision.$$"
trap 'rm -f "$next_link"' EXIT
ln -s "$candidate" "$next_link"
mv -Tf "$next_link" "$root/current"
printf 'Deployed source revision %s; public HTTPS API and database checks passed.\n' "$revision"
