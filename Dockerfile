# Build the Vite app
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Cloud Run uses the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Run the backend HTTP server, which serves both /api/* and the built SPA from dist/
CMD ["node", "backend/server.js"]
