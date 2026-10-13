# ==========================================
# MediDesk Frontend Multi-Stage Dockerfile
# Stage 1: Build production bundle with Vite
# Stage 2: Serve statically with Nginx Alpine
# ==========================================

# Stage 1: Build Vite React Application
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Lightweight Nginx Alpine Web Server
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
