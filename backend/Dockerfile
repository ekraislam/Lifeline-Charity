# Stage 1: Build (install all dependencies)
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production (keep it lightweight)
FROM node:22-slim
WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code and SQL scripts from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./
COPY --from=builder /app/schema.sql ./
COPY --from=builder /app/init-admin.sql ./

# Create uploads directory (will be mounted as a volume)
RUN mkdir -p uploads

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
