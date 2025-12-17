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

# Install production dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copy standalone app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema, migrations, config, and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun server.js"]
