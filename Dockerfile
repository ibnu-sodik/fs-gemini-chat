# Multi-stage Dockerfile for Nuxt 3 + Prisma on Fly.io
# 1. Base dependencies
FROM node:20 AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# Install OS deps for Prisma + openssl
# Full image already includes build toolchain; just refresh certs
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
# Copy package manifests first for better layer caching
COPY package.json package-lock.json* ./
# Environment tweaks to reduce native/peer conflicts
ENV NUXT_NO_OXC=1 \
  NPM_CONFIG_FUND=false \
  NPM_CONFIG_AUDIT=false \
  NPM_CONFIG_LEGACY_PEER_DEPS=true
# Use npm install (not ci) to avoid strict lock sync issues observed in remote build
RUN npm install --no-audit --no-fund
COPY prisma ./prisma
COPY nuxt.config.ts ./

# 3. Build stage
FROM base AS build
ENV NUXT_NO_OXC=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure prisma client is generated before build (script already does, but explicit is fine)
RUN npm run build

# 4. Production runtime
FROM node:20-slim AS runtime
ENV NODE_ENV=production
ENV NUXT_NO_OXC=1
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl libc6 libssl3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy only what we need
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

# Prisma needs the generated client inside node_modules (already there) and schema for migrations

EXPOSE 3000

# Fly will provide DATABASE_URL, LOGTO vars, GOOGLE_API_KEY, etc.
# Run migrations then start server
CMD ["sh", "-c", "npm run migrate:deploy && npm run start"]
