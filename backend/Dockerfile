# ==========================================
# MediDesk Backend Production Dockerfile
# Node.js LTS (Alpine for minimal attack surface)
# ==========================================
FROM node:22-alpine AS production

# Set security non-root user
USER node
WORKDIR /home/node/app

# Install dependencies first for Docker layer caching
COPY --chown=node:node package*.json ./
RUN npm ci --only=production

# Copy source code with non-root ownership
COPY --chown=node:node . .

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Health check container status
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["node", "src/server.js"]
