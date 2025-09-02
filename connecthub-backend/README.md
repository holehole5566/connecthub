# Tinder Backend API

FastAPI backend for the Tinder React application.

## Features

- User management (CRUD operations)
- Discovery system for finding potential matches
- Like/Match system
- Real-time chat messaging
- User settings and preferences
- CORS enabled for React frontend

## Quick Start

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Run the development server:**
   ```bash
   uv run python run.py
   ```

3. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Users
- `POST /api/users/` - Create user
- `GET /api/users/{user_id}` - Get user
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Discovery
- `GET /api/discover/` - Get users for discovery

### Matches
- `POST /api/matches/like` - Send like
- `GET /api/matches/` - Get matches

### Chat
- `GET /api/chat/{match_id}/messages` - Get chat history
- `POST /api/chat/{match_id}/messages` - Send message

### Settings
- `GET /api/settings/{user_id}` - Get settings
- `PUT /api/settings/{user_id}` - Update settings
- `POST /api/settings/{user_id}/pause` - Pause account
- `POST /api/settings/{user_id}/reactivate` - Reactivate account

## Frontend Integration

Update your React app's API service to point to `http://localhost:8000/api`

## Development

The API uses mock data for development. In production, replace with actual database operations.