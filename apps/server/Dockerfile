FROM node:26-alpine AS builder
WORKDIR /app
COPY ../../package*.json ./
COPY package.json ./package.json
RUN npm ci --workspace=server
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY config/.env .env
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]