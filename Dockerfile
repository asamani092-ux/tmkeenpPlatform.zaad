# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/generated ./generated
COPY . .
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=3072
RUN npm run build

# Lean runtime — standalone only (not full node_modules) to keep export under disk limits
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# entrypoint يعمل كـ root أولاً لـ chown على Volume كوليفاي ثم ينتقل إلى nextjs
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs \
  && apk add --no-cache util-linux su-exec \
  && npm install -g prisma@7.8.0 \
  && mkdir -p /app/uploads/evidence /app/uploads/cv /app/uploads/certificates /app/uploads/data \
  && mkdir -p /app/storage/evidence /app/storage/cv /app/storage/certificates /app/storage/data \
  && mkdir -p /app/scripts \
  && chown -R nextjs:nodejs /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY scripts/check-storage-persistence.sh /app/check-storage-persistence.sh
COPY scripts/check-storage-persistence.sh /app/scripts/check-storage-persistence.sh
RUN chmod +x /app/docker-entrypoint.sh \
  /app/check-storage-persistence.sh \
  /app/scripts/check-storage-persistence.sh

# لا USER nextjs هنا — entrypoint يعمل chown ثم su-exec nextjs
EXPOSE 3000

# Coolify Persistent Storage (Destination يجب أن يطابق UPLOAD_DIR):
#   Source: /data/tmkeen/storage
#   Destination: /app/uploads
ENV APP_STORAGE=/app/uploads
ENV UPLOAD_DIR=/app/uploads
VOLUME ["/app/uploads"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
