FROM node:26-alpine AS builder
WORKDIR /app
COPY ../../package*.json ./
COPY package.json ./package.json
RUN npm ci --workspace=client
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=builder /app/dist/client /usr/share/nginx/html
