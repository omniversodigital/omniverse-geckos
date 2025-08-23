# Dockerfile for Omniverse Geckos
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build arguments
ARG NODE_ENV=production
ARG NEXT_PUBLIC_APP_URL=https://omniversegeckos.com
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_CHAIN_ID=1
ARG NEXT_PUBLIC_WEB3_PROJECT_ID
ARG NEXT_PUBLIC_CONTRACT_ADDRESS
ARG NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
ARG NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CHAIN_ID=${NEXT_PUBLIC_CHAIN_ID}
ENV NEXT_PUBLIC_WEB3_PROJECT_ID=${NEXT_PUBLIC_WEB3_PROJECT_ID}
ENV NEXT_PUBLIC_CONTRACT_ADDRESS=${NEXT_PUBLIC_CONTRACT_ADDRESS}
ENV NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}
ENV NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=${NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS}

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built files with correct permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy node_modules if needed
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]