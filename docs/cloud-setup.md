# Codex cloud development

Use the existing `/workspace/Medidesk` checkout; each cloud task is isolated. Do not create a worktree unless explicitly requested.

The repository historically tracks Windows dependency files. Cloud installation therefore keeps Linux dependencies, generated output, and SQLite data outside the checkout:

- Node: `/workspace/.medidesk-tools/node_modules/.bin/node` (22.23.3).
- Backend/frontend: `/workspace/.medidesk-runtime/{backend,frontend}`.
- Database by default: `/workspace/.medidesk-runtime/backend/data/medidesk.sqlite`.

Begin shells with `export PATH=/workspace/.medidesk-tools/node_modules/.bin:$PATH`.

Edit the checkout. Stop only development servers you started before refreshing their runtime source. Source under the runtime `src` directories is disposable; persist changes in the checkout. Sync each component without overwriting its dependencies, database or local environment:

```sh
for component in backend frontend; do
  target="/workspace/.medidesk-runtime/$component"
  mkdir -p "$target"
  rm -rf "$target/src"
  tar -C "/workspace/Medidesk/$component" \
    --exclude='./node_modules' --exclude='./data' --exclude='./.env' \
    --exclude='./.env.*' --exclude='./dist' -cf - . | tar -C "$target" -xf -
done
```

Run `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` inside each runtime component after dependency changes. Start backend with `npm run dev` in its runtime directory and frontend with `npm run dev -- --host 127.0.0.1 --strictPort` in its runtime directory. Do not assume processes survive a new task or environment publication.

Create the first administrator in the backend runtime directory using the secure password prompt documented in the root README. No default account is generated during setup.

Validate `GET /api/health` both directly on port 5000 and through Vite on port 5173. Expect `status: online` and `database: connected`. The empty public directory is a correct initial state. Run backend `npm test` and frontend `npm run build` in their respective runtime directories. Browser tests start their own isolated database and servers.

Saved environment `install_script` and `start_skill` reproduce these steps. Saving a draft does not publish an environment or restart its services. Do not expose localhost preview links from onboarding.

## Optional Docker builds behind the managed cloud proxy

Both images were built successfully and tested together through Nginx. SQLite volume persistence was verified after restarting the backend container. BuildKit in this cloud machine does not automatically resolve the managed proxy hostname; that initially caused npm `EAI_AGAIN` errors even though native installs and regular containers worked.

When the platform already supplies `HTTPS_PROXY` and `NODE_EXTRA_CA_CERTS`, the following temporary build configuration reuses its route and trusted certificate without changing TLS verification or saving proxy values:

```sh
set -e
cd /workspace/Medidesk
medidesk_proxy_host=$(python3 -c 'import os,urllib.parse; print(urllib.parse.urlparse(os.environ["HTTPS_PROXY"]).hostname)')
medidesk_proxy_ip=$(python3 -c 'import os,socket,urllib.parse; print(socket.gethostbyname(urllib.parse.urlparse(os.environ["HTTPS_PROXY"]).hostname))')
for component in backend frontend; do
  BUILDX_CONFIG=/workspace/.medidesk-buildx docker build --network host \
    --add-host "$medidesk_proxy_host:$medidesk_proxy_ip" \
    --build-arg HTTP_PROXY --build-arg HTTPS_PROXY \
    --build-arg http_proxy --build-arg https_proxy \
    --build-arg NO_PROXY --build-arg no_proxy \
    --secret id=npm_ca,src="$NODE_EXTRA_CA_CERTS" \
    -t "medidesk-$component:local-review" "$component"
done
```

The optional `npm_ca` build secret is mounted only during dependency installation and is not retained in the images. Outside this managed proxy environment, ordinary Docker builds need none of these platform-specific flags. These are local image and container checks, not a deployment.
