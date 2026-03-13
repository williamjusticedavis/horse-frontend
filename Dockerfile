# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source and build
# Bake a placeholder — replaced at runtime by docker-entrypoint.sh
COPY . .
ARG VITE_API_URL=VITE_API_URL_PLACEHOLDER
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config (SPA routing + gzip + caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint replaces the placeholder with $VITE_API_URL at container start
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
