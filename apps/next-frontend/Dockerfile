# syntax=docker/dockerfile:1
# ┌────────────────────────────────────────────────────┐
# │ Imagen del frontend (Next.js, App Router).         │
# └────────────────────────────────────────────────────┘
# Patrón BFF: a la API solo la llama el servidor de Next, nunca el navegador.
# BACKEND_URL es una variable de RUNTIME y no entra en el build: todas las
# páginas que la usan tocan cookies() o headers(), lo que las vuelve dinámicas,
# así que 'next build' no hace ninguna petición al backend.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate

# --- Dependencias ---
FROM base AS deps
WORKDIR /app
# libc6-compat: algunos binarios que usa el toolchain de Next esperan glibc.
RUN apk add --no-cache libc6-compat
# pnpm-workspace.yaml lleva 'allowBuilds' (unrs-resolver): sin él, pnpm 12 no
# deja que ese paquete corra su script de instalación.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Compilación ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- Imagen final ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Sin esto el servidor de standalone escucha solo en localhost y Traefik no
# llega nunca al contenedor.
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# El bundle de standalone ya trae dentro las dependencias que necesita, así que
# no hace falta una etapa de dependencias de producción. Lo único que queda
# fuera son los estáticos, que van aparte por diseño de Next.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/login" > /dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
