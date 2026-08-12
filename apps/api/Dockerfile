# Budget Tracker API - Express + TypeScript + Drizzle
# Build context: repo root (docker build -f apps/api/Dockerfile .)

FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace manifests for dependency installation
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/package.json

# Copy lockfile if it exists
COPY pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# Copy source files
COPY tsconfig.base.json ./
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/drizzle.config.ts ./apps/api/drizzle.config.ts

# Create data directory for SQLite
RUN mkdir -p /data

EXPOSE 3000

# Run with tsx to execute TypeScript directly
CMD ["node_modules/.bin/tsx", "apps/api/src/index.ts"]
