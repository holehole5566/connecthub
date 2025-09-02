#!/bin/bash

# Renew certificates
docker-compose run --rm certbot renew

# Reload nginx
docker-compose exec nginx nginx -s reload