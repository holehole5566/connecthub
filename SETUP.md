# ConnectHub Setup Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.12+ (for local development)
- uv (Python package manager)

## Environment Setup

### 1. Backend Configuration

Copy the example environment file and configure your settings:

```bash
cd connecthub-backend
cp .env.example .env
```

Edit `.env` and update the following values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `SECRET_KEY`: A secure secret key for JWT tokens
- `CORS_ORIGINS`: Your frontend URLs

### 2. Frontend Configuration

```bash
cd connecthub-frontend
cp .env.example .env.local
```

Edit `.env.local` and update:
- `VITE_API_BASE_URL`: Your backend API URL

### 3. Infrastructure Configuration

```bash
cd connecthub-infra
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL`: PostgreSQL connection for Docker
- `VITE_API_URL`: Your production domain
- `VITE_CHAT_URL`: Your WebSocket domain

## Development Setup

### Backend
```bash
cd connecthub-backend
uv sync
uv run python main.py
# In another terminal:
uv run python chatserver.py
```

### Frontend
```bash
cd connecthub-frontend
npm install
npm run dev
```

## Production Deployment

### 1. Update Domain Configuration

Before deploying, update the following files with your actual domain:

- `connecthub-infra/nginx.conf`: Replace `your-domain.com`
- `connecthub-infra/init-letsencrypt.sh`: Replace domain and email
- `connecthub-infra/docker-compose.yml`: Replace email in certbot service

### 2. Deploy with Docker

```bash
cd connecthub-infra
docker-compose up -d nginx
```

### 3. Setup SSL Certificates

```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
docker-compose restart nginx
```

### 4. Setup SSL Auto-renewal

```bash
chmod +x renew-ssl.sh
crontab -e
# Add: 0 12 * * * /path/to/connecthub-infra/renew-ssl.sh
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for database users
- Generate secure JWT secret keys
- Keep SSL certificates updated
- Regularly update dependencies

## Services

- Frontend: http://localhost (port 80/443)
- API: http://localhost/api
- Chat: ws://localhost/socket.io
- Database: PostgreSQL on port 5432
- Redis: Redis on port 6379