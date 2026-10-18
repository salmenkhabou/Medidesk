# ==========================================
# MediDesk Frontend Multi-Stage Dockerfile
# Stage 1: Build production bundle with Vite
# Stage 2: Serve statically with Nginx Alpine
# ==========================================

# Stage 1: Build Vite React Application
FROM node:22.23.3-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=npm_ca \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --no-audit --no-fund --fetch-retries=1 --fetch-timeout=30000
COPY . .
# Public deployment metadata, never credentials.
ARG SITE_URL
ARG PRIVACY_OPERATOR
ARG PRIVACY_EMAIL
ARG PRIVACY_POLICY_REVIEWED=false
RUN npm run build

# Stage 2: Lightweight Nginx Alpine Web Server
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
# The worker must be able to read public assets even when the checkout has restrictive modes.
RUN chmod -R a+rX /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
