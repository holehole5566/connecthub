#!/bin/bash

# Replace with your domain and email
DOMAIN="your-domain.com"
EMAIL="your-email@example.com"

# Create directories
mkdir -p certbot/conf certbot/www

# Get initial certificate
docker-compose run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  --email $EMAIL \
  -d $DOMAIN \
  --agree-tos \
  --no-eff-email

# Reload nginx
docker-compose exec nginx nginx -s reload