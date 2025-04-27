FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

RUN npm ci

COPY . .

# Generate Prisma client
RUN npm run prisma:generate

EXPOSE 3001

# Use development mode instead of trying to build
CMD ["npm", "run", "start:dev"] 