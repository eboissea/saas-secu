# ============================
# Stage 1: Dependencies
# ============================
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ============================
# Stage 2: Production
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER worker

ENV NODE_ENV=production

CMD ["node", "index.js"]
