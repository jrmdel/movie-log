FROM node:26-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
RUN npm ci
COPY . .
RUN npm run build --workspace=apps/server

FROM node:26-alpine AS runner
WORKDIR /app
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
RUN npm ci --omit=dev --workspace=apps/server
COPY --from=builder /app/apps/server/dist ./apps/server/dist
EXPOSE 3000
ENV NODE_ENV=production

WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]