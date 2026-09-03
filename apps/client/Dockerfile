FROM node:26-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
RUN npm ci --workspace=apps/client
COPY . .
RUN npm run build --workspace=apps/client

FROM nginx:1.27-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/apps/client/dist/browser/ /usr/share/nginx/html/
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]