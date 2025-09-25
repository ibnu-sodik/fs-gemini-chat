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
# Copy only package.json to avoid Windows-generated lockfile blocking linux optional deps
COPY package.json ./
COPY prisma ./prisma
# Environment tweaks to reduce peer conflicts; DO NOT disable scripts so native bindings (oxc, esbuild, etc.) install.
ENV NPM_CONFIG_FUND=false \
  NPM_CONFIG_AUDIT=false \
  NPM_CONFIG_LEGACY_PEER_DEPS=true
# Upgrade npm to latest to avoid known optional dependency bug referenced in oxc error message
RUN npm install -g npm@latest
# Install dependencies (allow scripts so native binaries download). If a transient network error happens, retry once.
# Remove any lock (if present) then install so linux-specific optional deps (rollup, oxc) are fetched
RUN rm -f package-lock.json && npm install --no-audit --no-fund || npm install --no-audit --no-fund
COPY prisma ./prisma
COPY nuxt.config.ts ./

# 3. Build stage
FROM base AS build
# Cache buster ARG to force reinstall if we change build logic
ARG BUILD_TS
ENV BUILD_TS=${BUILD_TS}
# Allow Nuxt to use its default parser (oxc) now that native bindings should exist.
ENV NUXT_NO_OXC=0
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Attempt to rebuild optional native bindings (ignore failures to avoid hard stops if already present)
RUN npm rebuild oxc-parser || true && npm rebuild oxc-transform || true
# Rebuild oxc-parser just in case optional native dependency was skipped; ignore failure so build can attempt legacy fallback.
# Ensure prisma client is generated before build (script already does via build script, but explicit additional safety not needed)
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
