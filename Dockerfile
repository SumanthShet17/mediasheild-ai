# Build the Vite app
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Cloud Run uses the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Serve the 'dist' folder on the specified port
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
