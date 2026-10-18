#!/usr/bin/env bash
set -euo pipefail
: "${GITHUB_SHA:?Missing source revision}"
: "${DEPLOY_HOST:?Set DEPLOY_HOST}"
: "${DEPLOY_USER:?Set DEPLOY_USER}"
: "${DEPLOY_SSH_KEY:?Set the production SSH key in environment secrets}"
: "${DEPLOY_KNOWN_HOSTS:?Supply independently verified host keys}"
: "${RUNNER_TEMP:?Expected a GitHub Actions runner temporary directory}"
: "${BACKEND_IMAGE:?Missing backend digest}"
: "${FRONTEND_IMAGE:?Missing frontend digest}"
: "${SITE_URL:?Missing public origin}"
DEPLOY_PORT=${DEPLOY_PORT:-22}
[[ "$GITHUB_SHA" =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid source SHA.' >&2; exit 1; }
[[ "$DEPLOY_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo 'Invalid deployment hostname.' >&2; exit 1; }
[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || { echo 'Invalid deployment user.' >&2; exit 1; }
[[ "$DEPLOY_PORT" =~ ^[0-9]{1,5}$ ]] && ((10#$DEPLOY_PORT >= 1 && 10#$DEPLOY_PORT <= 65535)) || { echo 'Invalid SSH port.' >&2; exit 1; }
for image in "$BACKEND_IMAGE" "$FRONTEND_IMAGE"; do
  [[ "$image" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || { echo 'An immutable GHCR image digest is required.' >&2; exit 1; }
done
umask 077
ssh_dir=$(mktemp -d "$RUNNER_TEMP/medidesk-ssh.XXXXXX")
bundle_dir=$(mktemp -d "$RUNNER_TEMP/medidesk-release.XXXXXX")
trap 'rm -rf "$ssh_dir" "$bundle_dir"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$ssh_dir/key"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
ssh-keygen -y -f "$ssh_dir/key" >/dev/null
lookup=$DEPLOY_HOST
if [[ "$DEPLOY_PORT" != 22 ]]; then lookup="[$DEPLOY_HOST]:$DEPLOY_PORT"; fi
ssh-keygen -F "$lookup" -f "$ssh_dir/known_hosts" >/dev/null || { echo 'No independently verified host key exists for this host/port.' >&2; exit 1; }
cp -R deploy "$bundle_dir/deploy"
export RELEASE_ENV_PATH="$bundle_dir/images.env"
node --input-type=module <<'JS'
import {writeFileSync} from 'node:fs';
import {buildPublicConfig} from './frontend/src/site.js';
const c=buildPublicConfig(process.env);
if(!c.siteUrl || new URL(c.siteUrl).port !== "8443") throw Error('SITE_URL must be the final HTTPS origin on isolated port 8443.');
// The file intentionally contains public release references only, never runtime credentials.
writeFileSync(process.env.RELEASE_ENV_PATH,`RELEASE_SHA=${process.env.GITHUB_SHA}\nBACKEND_IMAGE=${process.env.BACKEND_IMAGE}\nFRONTEND_IMAGE=${process.env.FRONTEND_IMAGE}\nSITE_URL=${c.siteUrl}\nSITE_HOST=${new URL(c.siteUrl).hostname}\n`,{mode:0o600});
JS
tar -C "$bundle_dir" -czf "$bundle_dir/release.tgz" deploy images.env
ssh_options=(-i "$ssh_dir/key" -o BatchMode=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$ssh_dir/known_hosts" -p "$DEPLOY_PORT")
destination="$DEPLOY_USER@$DEPLOY_HOST"
# The only remote interpolation is a validated full hexadecimal SHA; no credentials enter a command string.
ssh "${ssh_options[@]}" "$destination" "umask 077; mkdir -p /srv/medidesk/releases/$GITHUB_SHA; tar -xzf - -C /srv/medidesk/releases/$GITHUB_SHA" < "$bundle_dir/release.tgz"
ssh "${ssh_options[@]}" "$destination" "bash /srv/medidesk/releases/$GITHUB_SHA/deploy/release.sh $GITHUB_SHA"
