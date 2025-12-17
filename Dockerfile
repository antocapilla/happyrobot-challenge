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

# Copiar app standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar prisma schema y cliente generado
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar package.json para poder usar npm/npx
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

EXPOSE 3000

# Ejecutar prisma directamente con node, luego iniciar servidor
CMD ["sh", "-c", "node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss && node server.js"]
