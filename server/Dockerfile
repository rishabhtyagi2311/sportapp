# --- Stage 1: build --------------------------------------------------------
# Installs full deps (incl. devDependencies needed for tsc), generates the
# Prisma client against the schema, and compiles TypeScript to dist/.
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 2: runtime --------------------------------------------------------
# Production-only deps, a fresh Prisma client generation (schema.prisma is
# copied in, no build tools needed), and the compiled output. Runs as a
# non-root user.
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

RUN chown -R node:node /app
USER node

EXPOSE 3000

# Applies any pending migrations before starting the server — safe to run
# on every boot since Prisma migrations are idempotent (already-applied
# migrations are skipped).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
