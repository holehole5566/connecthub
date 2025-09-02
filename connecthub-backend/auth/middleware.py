from fastapi import Request, HTTPException, status, Depends, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import os
from .session import get_session, refresh_session

security = HTTPBearer(auto_error=False)

def load_user_by_id(user_id: int):
    """Load user from database by ID"""
    from api.routes.users import get_user_by_id_internal
    return get_user_by_id_internal(user_id)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session_token: Optional[str] = Cookie(None)
) -> Dict[str, Any]:
    """Middleware to validate user session"""
    
    # Get session token from Authorization header or cookie
    token = None
    if credentials:
        token = credentials.credentials
    elif session_token:
        token = session_token
    else:
        # Try to get from cookies directly
        token = request.cookies.get("session_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing session token"
        )
    
    # Validate session
    session_data = get_session(token)
    
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
    
    user_id = session_data["user_id"]
    
    # Refresh session
    refresh_session(token)
    
    # Load full user data
    user = load_user_by_id(user_id)
    if user:
        return user.dict()
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )