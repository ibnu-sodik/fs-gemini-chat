# Multi-stage Dockerfile for Nuxt 3 + Prisma on Fly.io
# 1. Base dependencies
FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# Install OS deps for Prisma + openssl
RUN apt-get update && apt-get install -y --no-install-recommends \
  openssl libc6 libssl3 ca-certificates curl git build-essential python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Dependencies stage
FROM base AS deps
# Copy package manifests first for better layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Copy minimal files needed by postinstall (nuxt prepare & prisma generate) to avoid failures
COPY nuxt.config.ts ./
COPY prisma ./prisma
# Install dependencies (avoid npm ci strictness since lock & manifest mismatch triggered earlier)
RUN npm install --no-audit --no-fund

# 3. Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure prisma client is generated before build (script already does, but explicit is fine)
RUN npm run build

# 4. Production runtime
FROM node:20-slim AS runtime
ENV NODE_ENV=production
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
