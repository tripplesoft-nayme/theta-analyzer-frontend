# ==========================================
# Stage 1: Build the Vite React App
# ==========================================
FROM node:22.18.0-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy remaining source code and build project
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve static files with Nginx
# ==========================================
FROM nginx:alpine

# Copy custom nginx config if needed, or use default public dir
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3000 (or 80)
EXPOSE 3000

# Configure Nginx to listen on port 3000 instead of default 80
RUN sed -i 's/listen       80;/listen       3000;/g' /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
