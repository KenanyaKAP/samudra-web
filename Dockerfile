# Build stage
FROM node:22.12.0-alpine AS build
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Fix permissions for nginx to read all files
RUN chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Ensure nginx user owns the files
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
