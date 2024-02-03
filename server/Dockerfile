FROM oven/bun:1-alpine as base
WORKDIR /app

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease

COPY package.json bun.lockb  ./
RUN bun install --production --frozen-lockfile --no-cache
COPY . .

CMD ["/bin/sh", "-c", "bun run migrate && bun run start"]
