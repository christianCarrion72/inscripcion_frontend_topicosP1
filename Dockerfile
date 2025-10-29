# Etapa de construcción
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Argumento para la URL del gateway (solo en build)
ARG NEXT_PUBLIC_GATEWAY_URL
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL

# Establecer variable para ignorar errores de ESLint durante la compilación
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_LINT_IGNORE_ERRORS=true

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Establecer variables de entorno para producción
ENV NODE_ENV=production

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Exponer el puerto que utiliza Next.js
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]