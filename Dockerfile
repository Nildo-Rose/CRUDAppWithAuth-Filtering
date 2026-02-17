# For Fly.io GitHub deploy: repo root has no backend/ in context path,
# so this file builds the backend so Fly finds a Dockerfile at root.
# Local deploys can still use: cd backend && fly deploy

FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
