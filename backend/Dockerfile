# Use Node 18 Alpine as base image for backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (Backend typically runs on 5000 in this project based on hints)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
