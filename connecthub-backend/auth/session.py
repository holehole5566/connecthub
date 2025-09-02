import secrets
import bcrypt
import redis
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import json
import os

# Redis connection
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

SESSION_EXPIRE_HOURS = 24 * 7  # 7 days

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_session(user_id: int) -> str:
    """Create a new session for a user"""
    session_token = secrets.token_urlsafe(32)
    session_data = {
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(hours=SESSION_EXPIRE_HOURS)).isoformat()
    }
    
    # Store in Redis with expiration
    redis_client.setex(
        f"session:{session_token}",
        timedelta(hours=SESSION_EXPIRE_HOURS),
        json.dumps(session_data)
    )
    
    return session_token

def get_session(session_token: str) -> Optional[Dict[str, Any]]:
    """Get session data from Redis"""
    try:
        session_data = redis_client.get(f"session:{session_token}")
        if session_data:
            return json.loads(session_data)
        return None
    except Exception as e:
        return None

def delete_session(session_token: str) -> bool:
    """Delete a session from Redis"""
    return redis_client.delete(f"session:{session_token}") > 0

def refresh_session(session_token: str) -> bool:
    """Refresh session expiration"""
    session_data = get_session(session_token)
    if session_data:
        session_data["expires_at"] = (datetime.now() + timedelta(hours=SESSION_EXPIRE_HOURS)).isoformat()
        redis_client.setex(
            f"session:{session_token}",
            timedelta(hours=SESSION_EXPIRE_HOURS),
            json.dumps(session_data)
        )
        return True
    return False