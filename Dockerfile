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

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Instalar dependencias de producción
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copiar app standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar prisma schema y migraciones
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun server.js"]
