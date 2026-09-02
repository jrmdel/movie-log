FROM node:26-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
RUN npm ci --workspace=apps/client
COPY . .
RUN npm run build --workspace=apps/client
RUN ls -la /app/apps/client/dist

FROM nginx:1.27-alpine
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html