# ==========================================
# Multi-Stage Dockerfile for Backend API
# ==========================================

# ------------------------------------------
# Stage 1: Dependencies
# ------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies if needed (e.g. python/make for native modules)
RUN apk add --no-cache libc6-compat

# Copy dependency manifests
COPY package.json package-lock.json* ./
RUN npm install

# ------------------------------------------
# Stage 2: Builder
# ------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Remove development dependencies to keep production footprint minimal
RUN npm prune --production

# ------------------------------------------
# Stage 3: Production Runner
# ------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install curl for container health check
RUN apk add --no-cache curl

# Create non-root system group and user for security
USER node

# Copy compiled files and production node_modules from builder
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
