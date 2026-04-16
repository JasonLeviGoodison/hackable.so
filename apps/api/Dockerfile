# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache git bash

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/

RUN npm run build

# Generate the fake .git directory (VULN 7)
COPY scripts/ ./scripts/
RUN chmod +x scripts/generate-git-dir.sh && bash scripts/generate-git-dir.sh

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/public ./public

EXPOSE 4000

CMD ["npm", "run", "start"]
