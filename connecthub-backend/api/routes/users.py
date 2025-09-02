from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from schemas.user import User, UserCreate, UserUpdate
from schemas.settings import UserSettings, AgeRange
from auth.middleware import get_current_user
from database import get_db
from datetime import datetime

router = APIRouter()

# Database functions
def get_user_by_id_internal(user_id: int):
    with get_db() as cursor:
        cursor.execute("""
            SELECT id, username, first_name, last_name, email, birthday, 
                   gender, age, bio, interests, photos, photo_url, distance, 
                   latitude, longitude, city, is_active, last_seen, created_at, 
                   updated_at, is_verified, report_count, is_premium
            FROM users WHERE id = %s
        """, (user_id,))
        row = cursor.fetchone()
        if row:
            user_dict = dict(row)
            if user_dict['latitude'] and user_dict['longitude']:
                user_dict['location'] = {
                    'latitude': user_dict['latitude'],
                    'longitude': user_dict['longitude'], 
                    'city': user_dict['city']
                }
            return User(**user_dict)
        return None

@router.get("/{user_id}")
async def get_user(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user by ID"""
    user = get_user_by_id_internal(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "data": user}

@router.put("/{user_id}")
async def update_user(user_id: int, user_data: UserUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Update user profile"""
    # Only allow users to update their own profile
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Can only update your own profile")
    
    with get_db() as cursor:
        # Build update query
        update_data = user_data.dict(exclude_unset=True)
        if 'location' in update_data:
            loc = update_data.pop('location')
            update_data.update({
                'latitude': loc['latitude'],
                'longitude': loc['longitude'],
                'city': loc['city']
            })
        
        if update_data:
            set_clause = ', '.join([f"{k} = %s" for k in update_data.keys()])
            values = list(update_data.values()) + [user_id]
            cursor.execute(f"""
                UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            """, values)
    
    return {"success": True, "data": get_user_by_id_internal(user_id)}

@router.delete("/{user_id}")
async def delete_user(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Delete user account"""
    # Only allow users to delete their own account
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Can only delete your own account")
    
    with get_db() as cursor:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}