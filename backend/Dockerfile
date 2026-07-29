# Stage 1: Build (install all dependencies)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production (keep it lightweight)
FROM node:18-alpine
WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./

# Create uploads directory (will be mounted as a volume)
RUN mkdir -p uploads

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
