# Build the Vite app
FROM node:18-alpine
WORKDIR /app

# Accept build-time args (provided by GitHub Actions) and expose as env vars
ARG VITE_GEMINI_API_KEY
ARG VITE_GOOGLE_CLOUD_API_KEY
ARG VITE_MAPS_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GOOGLE_CLOUD_API_KEY=$VITE_GOOGLE_CLOUD_API_KEY
ENV VITE_MAPS_API_KEY=$VITE_MAPS_API_KEY

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
