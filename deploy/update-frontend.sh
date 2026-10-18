#!/usr/bin/env bash
# Frontend-only update of the first manual deployment. No DB/backend changes.
set -euo pipefail
root=${MEDIDESK_DEPLOY_ROOT:-/srv/medidesk}
root=$(cd "$root" && pwd -P)
source_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
[[ "$source_dir" == "$root/source" ]] || { echo 'Run from the managed source folder.' >&2; exit 1; }
compose() { sudo docker compose --project-name medidesk --env-file "$root/.env" -f "$source_dir/deploy/compose.yml" -f "$source_dir/deploy/compose.build.yml" "$@"; }
[[ "$(sed -n 's/^FRONTEND_IMAGE=//p' "$root/.env")" == medidesk-frontend:first-version ]] || { echo 'This helper is only for the first manual deployment.' >&2; exit 1; }
compose config --quiet
container=$(compose ps -q frontend)
[[ -n "$container" ]] || { echo 'No running MediDesk frontend found.' >&2; exit 1; }
previous=$(sudo docker inspect --format '{{.Image}}' "$container")
backup="medidesk-frontend:before-update-$(date -u +%Y%m%d%H%M%S)"
sudo docker tag "$previous" "$backup"
printf 'Previous frontend retained as %s\n' "$backup"
compose build frontend
rollback() {
    echo 'Frontend checks failed; restoring previous frontend image.' >&2
    sudo docker tag "$previous" medidesk-frontend:first-version
    compose up -d --no-deps --wait --wait-timeout 180 frontend
}
if ! compose up -d --no-deps --wait --wait-timeout 180 frontend; then rollback; exit 1; fi
if ! curl --noproxy '*' --fail --silent --show-error --retry 6 --retry-delay 2 --retry-all-errors --max-time 10 https://medidesk.57.131.145.168.sslip.io:8443/api/health |
  python3 -c 'import json,sys; d=json.load(sys.stdin); assert d.get("status")=="online" and d.get("database")=="connected"'; then
    rollback; exit 1
fi
echo 'Frontend update passed. Reload MediDesk on your phone to see the new layout.'
