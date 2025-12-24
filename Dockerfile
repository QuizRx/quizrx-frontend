# Get pnpm packages
FROM node:18-alpine AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

# Use production env for build
COPY .env.production .env.local

RUN npm install -g pnpm && \
    echo "🔨 Building Next.js application..." && \
    pnpm build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN npm install -g pnpm
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
USER nextjs
EXPOSE 8080
CMD ["pnpm", "next", "start", "-p", "8080"]
