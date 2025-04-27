FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the files
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev"] 