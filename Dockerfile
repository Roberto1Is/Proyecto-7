# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@10.12.3

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build según el argumento BUILD_ENV (dev, qa, prod)
ARG BUILD_ENV=prod
RUN pnpm run build:pack:${BUILD_ENV}

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar nginx para servir la aplicación
RUN apk add --no-cache nginx

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados del stage anterior según el ambiente
ARG BUILD_ENV=prod
COPY --from=builder /app/dist/${BUILD_ENV} /usr/share/nginx/html

# Crear carpeta de logs de nginx
RUN mkdir -p /var/log/nginx && \
    mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
