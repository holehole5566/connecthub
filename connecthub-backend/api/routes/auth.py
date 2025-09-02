from fastapi import APIRouter, HTTPException, Depends, Response, status
from fastapi.security import HTTPBearer
from typing import Dict, Any
from schemas.user import UserLogin, UserRegister, UserCreate
from auth.session import hash_password, verify_password, create_session, delete_session
from auth.middleware import get_current_user
from database import get_db
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

def get_user_by_username(username: str):
    """Get user by username"""
    with get_db() as cursor:
        cursor.execute("""
            SELECT id, username, password_hash, first_name, last_name, email, birthday, 
                   gender, age, bio, interests, photos, photo_url, distance, 
                   latitude, longitude, city, is_active, last_seen, created_at, 
                   updated_at, is_verified, report_count, is_premium
            FROM users WHERE username = %s
        """, (username,))
        return cursor.fetchone()

@router.post("/register")
async def register(user_data: UserRegister, response: Response):
    """Register a new user"""
    with get_db() as cursor:
        # Check if username or email already exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", 
                      (user_data.username, user_data.email))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists"
            )
        
        # Calculate age from birthday
        if isinstance(user_data.birthday, str):
            birth_date = datetime.fromisoformat(user_data.birthday.replace('Z', '+00:00'))
        else:
            birth_date = user_data.birthday
        age = datetime.now().year - birth_date.year
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Handle location data
        location_data = {}
        if user_data.location:
            location_data = {
                'latitude': user_data.location.latitude,
                'longitude': user_data.location.longitude,
                'city': user_data.location.city
            }
        
        # Insert user
        cursor.execute("""
            INSERT INTO users (username, password_hash, first_name, last_name, email, 
                             birthday, gender, age, bio, interests, photos, latitude, longitude, city)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            user_data.username, password_hash, user_data.first_name, user_data.last_name,
            user_data.email, user_data.birthday, user_data.gender,
            age, user_data.bio, user_data.interests, user_data.photos,
            location_data.get('latitude'), location_data.get('longitude'), location_data.get('city')
        ))
        
        user_id = cursor.fetchone()['id']
        
        # Create default settings
        cursor.execute("""
            INSERT INTO user_settings (user_id, max_distance, age_min, age_max)
            VALUES (%s, %s, %s, %s)
        """, (user_id, 50, 18, 35))
        
        # Create session
        session_token = create_session(user_id)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )
        
        return {
            "success": True, 
            "message": "User registered successfully",
            "session_token": session_token
        }

@router.post("/login")
async def login(credentials: UserLogin, response: Response):
    """Login user"""
    user = get_user_by_username(credentials.username)
    
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create session
    session_token = create_session(user['id'])
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/"
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "session_token": session_token
    }

@router.post("/logout")
async def logout(
    response: Response,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Logout user"""
    # Get session token from request (this would need to be extracted from the middleware)
    # For now, we'll clear the cookie
    response.delete_cookie("session_token")
    
    return {"success": True, "message": "Logout successful"}

@router.get("/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information"""
    return {"success": True, "data": current_user}