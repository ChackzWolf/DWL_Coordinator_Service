FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including TypeScript
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript code using local tsc
RUN ./node_modules/.bin/tsc

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=4001

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled JavaScript
COPY --from=builder /usr/src/app/dist ./dist

RUN chown -R node:node /usr/src/app
USER node

EXPOSE ${PORT}
CMD ["node", "dist/server.js"]