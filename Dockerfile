# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ .

# Build the application with a placeholder for the API key
# This placeholder will be replaced at runtime by the entrypoint script
ENV VITE_TMDB_API_KEY=__TMDB_API_KEY__
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom entrypoint script
COPY entrypoint.sh /docker-entrypoint.d/99-inject-env.sh
RUN chmod +x /docker-entrypoint.d/99-inject-env.sh

# Expose port 80
EXPOSE 80

# The default nginx CMD will run after the entrypoint scripts
CMD ["nginx", "-g", "daemon off;"]
