# Budget Tracker Web - React + Vite + Tailwind CSS
# Stage 1: Build the Vite/React app
# Stage 2: Serve with nginx
# Build context: repo root (docker build -f apps/web/Dockerfile .)

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/package.json
COPY pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# Copy source files needed for the build
COPY tsconfig.base.json ./
COPY apps/web ./apps/web

# Build the web app
RUN pnpm --filter @budget-tracker/web run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Vite build output
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
