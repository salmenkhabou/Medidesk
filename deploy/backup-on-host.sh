#!/usr/bin/env bash
set -euo pipefail
# Run via a root-owned systemd timer. Only this project's backend is addressed.
container=$(docker ps --filter label=com.docker.compose.project=medidesk --filter label=com.docker.compose.service=backend --format '{{.ID}}')
[[ -n "$container" && "$container" != *$'\n'* ]] || { echo 'Expected exactly one MediDesk backend.' >&2; exit 1; }
docker exec "$container" node src/backup.js
# An encrypted backup remains on the data volume. Off-server copies need a chosen destination.
