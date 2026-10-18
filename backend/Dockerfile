FROM node:22.23.3-alpine
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
# Optional CA trust for a managed build proxy; the certificate is not retained.
RUN --mount=type=secret,id=npm_ca \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --omit=dev --no-audit --no-fund --fetch-retries=1 --fetch-timeout=30000 && mkdir data && chown node:node data
COPY --chown=node:node src ./src
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5000
EXPOSE 5000
CMD ["node", "src/server.js"]
