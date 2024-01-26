# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .

RUN bun run build

# setup nginx
FROM nginx:1-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=prerelease /usr/src/app/build /etc/nginx/html
