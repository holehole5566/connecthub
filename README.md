# ConnectHub - Dating & Social Platform

A modern, full-stack dating application built with React, FastAPI, PostgreSQL, and Redis. Features real-time chat, location-based matching, and a swipe-based discovery system.

## ✨ Features

- 🔐 **User Authentication**: Secure registration and login system
- 👤 **User Profiles**: Comprehensive profile management with photo uploads
- 💫 **Smart Discovery**: Swipe-based user discovery with filtering
- 💬 **Real-time Chat**: Instant messaging with Socket.IO
- 📍 **Location Matching**: Distance-based user matching
- ⚙️ **Customizable Settings**: Age range, distance, and preference controls

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Redux Toolkit
- **Backend**: FastAPI + Python 3.12
- **Database**: PostgreSQL 15
- **Cache/Sessions**: Redis 7
- **Real-time**: Socket.IO
- **Deployment**: Docker + Nginx + Let's Encrypt

## 🚀 Quick Start

### Development Mode

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd connecthub
   ```

2. **Setup Backend**
   ```bash
   cd connecthub-backend
   cp .env.example .env
   # Edit .env with your configuration
   uv sync
   uv run python main.py
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd connecthub-frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm install
   npm run dev
   ```

4. **Start Chat Server** (in new terminal)
   ```bash
   cd connecthub-backend
   uv run python chatserver.py
   ```

### Production Deployment

See [SETUP.md](SETUP.md) for detailed production deployment instructions.

## 📁 Project Structure

```
connecthub/
├── connecthub-backend/     # FastAPI backend
│   ├── api/               # API routes
│   ├── auth/              # Authentication logic
│   ├── schemas/           # Pydantic models
│   └── mock_data/         # Development data
├── connecthub-frontend/    # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── types/         # TypeScript types
└── connecthub-infra/      # Docker & deployment
    ├── nginx.conf         # Nginx configuration
    └── docker-compose.yml # Docker services
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `REDIS_HOST`: Redis hostname
- `CORS_ORIGINS`: Allowed frontend origins

**Frontend (.env.local)**
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_MOCK_USER`: Development mock user

**Infrastructure (.env)**
- `VITE_API_URL`: Production API URL
- `VITE_CHAT_URL`: Production WebSocket URL

## 🐳 Docker Services

- **postgres**: PostgreSQL database
- **redis**: Redis cache and sessions
- **httpserver**: FastAPI backend
- **chatserver**: Socket.IO chat server
- **frontend**: React application
- **nginx**: Reverse proxy and SSL termination
- **certbot**: SSL certificate management

## 🔒 Security Features

- Password hashing with bcrypt
- CORS protection
- SSL/TLS encryption
- Input validation and sanitization
- Session management with Redis

## 📱 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `GET /api/discover` - Get discovery cards
- `POST /api/matches/like` - Like/pass on users
- `GET /api/matches` - Get user matches
- `GET /api/chat/messages` - Get chat messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular dating applications
- Community-driven development
- **AI-Assisted Development**: Major portions of this codebase were generated and optimized using Amazon Q Developer, demonstrating the power of AI in modern software development