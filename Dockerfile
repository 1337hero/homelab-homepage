FROM oven/bun:alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
COPY --from=build /app/api ./api
COPY --from=build /app/data ./data
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./
RUN bun install --frozen-lockfile --production
EXPOSE 4000
CMD ["bun", "server.js"]
