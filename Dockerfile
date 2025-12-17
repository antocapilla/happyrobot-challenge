FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate && bun run build

FROM oven/bun:1-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Install wget for healthcheck
RUN apk add --no-cache wget

# Install dependencies (including dev dependencies for seed/clean scripts)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy standalone app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema, migrations, config, and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated
# Copy source files needed for seed/clean scripts
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/lib ./src/lib

EXPOSE 3000

CMD ["sh", "-c", "yes | bunx prisma migrate reset --skip-seed && bunx tsx prisma/seed.ts && bun server.js"]
