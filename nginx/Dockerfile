# Production-ready, minimal Nginx image
FROM nginx:1.25-alpine

# Remove default nginx website configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom reverse proxy configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 80

# Health check using curl (installed in alpine or wget)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/nginx-health || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
