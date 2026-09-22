# syntax=docker/dockerfile:1
# ┌────────────────────────────────────────────────────┐
# │ Imagen de la API (NestJS + TypeORM + Postgres).    │
# └────────────────────────────────────────────────────┘
# El contexto de build es ESTA carpeta, no la raíz del monorepo: las dos apps
# son proyectos de pnpm independientes, cada una con su lockfile, así que no
# hace falta arrastrar el repo entero.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# El package.json de esta app no declara "packageManager" —el que lo declara es
# el de la raíz del monorepo, que no entra en este contexto—, así que corepack
# no puede deducir la versión y hay que fijarla a mano.
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate

# --- Dependencias completas: hacen falta para compilar ---
FROM base AS deps
WORKDIR /app
# pnpm-workspace.yaml va sí o sí: ahí vive 'allowBuilds', y sin él pnpm 12 no
# deja correr los scripts de instalación de los paquetes que los necesitan.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Compilación ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- Dependencias de producción: las mismas menos las de desarrollo ---
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# --- Imagen final ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Sin root. El UID no importa mientras no escriba en volúmenes montados, y
# esta app no escribe en disco: todo su estado vive en Postgres.
RUN addgroup -S nodejs && adduser -S nest -G nodejs

COPY --from=prod-deps --chown=nest:nodejs /app/node_modules ./node_modules
COPY --from=build     --chown=nest:nodejs /app/dist         ./dist
COPY --chown=nest:nodejs package.json ./

USER nest
EXPOSE 3000

# /api es la UI de Swagger, la misma ruta que usaba healthCheckPath en Render.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api" > /dev/null 2>&1 || exit 1

# Las migraciones corren en cada arranque, igual que el startCommand de
# render.yaml: es idempotente, aplica solo las que falten.
#
# Se invoca el binario 'typeorm' pelado contra el data-source COMPILADO, no el
# script migration:run de desarrollo: ese usa typeorm-ts-node-commonjs, que
# necesita ts-node y los fuentes .ts, y ninguno de los dos existe acá.
CMD ["sh", "-c", "node_modules/.bin/typeorm migration:run -d dist/database/data-source.js && node dist/main"]
