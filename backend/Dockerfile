FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

# -------------------------------

FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/dist ./dist

RUN npm ci --only=production && \
    npm run prisma:generate

EXPOSE 3001

CMD ["node", "dist/main"] 