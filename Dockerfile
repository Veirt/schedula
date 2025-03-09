FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS client-builder
COPY client/package.json client/bun.lockb ./
RUN bun install --frozen-lockfile --no-cache
COPY client .
RUN bun run build

FROM base AS server-builder

COPY server/package.json server/bun.lockb  ./
RUN bun install --production --frozen-lockfile --no-cache
COPY server .

FROM base AS runner

COPY --from=server-builder /app .
COPY --from=client-builder /app/build ./frontend

CMD ["/bin/sh", "-c", "bun run migrate && bun run start"]
