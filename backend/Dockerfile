# Stage 1: Build NestJS typescript source
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Deploy lean server image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache cairo pango jpeg giflib
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["/bin/sh", "-c", "npx prisma db push && node dist/main"]
