FROM oven/bun:1-alpine as base
WORKDIR /usr/src/app

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease

COPY package.json bun.lockb  ./
RUN bun install --frozen-lockfile --no-cache
COPY . .
RUN bun run build && rm -rf node_modules

# setup nginx
FROM nginx:1-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=prerelease /usr/src/app/build /etc/nginx/html
