FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Instalar dependencias de producción (incluye todas las de Prisma)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copiar app standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar prisma schema y migraciones (el cliente ya está en node_modules)
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Ejecutar migraciones y luego iniciar servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
