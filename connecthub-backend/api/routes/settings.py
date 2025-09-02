from fastapi import APIRouter, HTTPException, Depends
from schemas.settings import UserSettings, UserSettingsUpdate, AgeRange
from auth.middleware import get_current_user
from database import get_db
from typing import Dict, Any

router = APIRouter()

def get_user_settings_from_db(user_id: int):
    with get_db() as cursor:
        cursor.execute("""
            SELECT id, user_id, max_distance, age_min, age_max, 
                   show_me_in_discovery, is_paused
            FROM user_settings WHERE user_id = %s
        """, (user_id,))
        row = cursor.fetchone()
        if row:
            return UserSettings(
                id=row['id'],
                user_id=row['user_id'],
                max_distance=row['max_distance'],
                age_range=AgeRange(min=row['age_min'], max=row['age_max']),
                show_me_in_discovery=row['show_me_in_discovery'],
                is_paused=row['is_paused']
            )
        return None

@router.get("/{user_id}")
async def get_user_settings(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user settings"""
    settings = get_user_settings_from_db(user_id)
    if not settings:
        # Create default settings
        with get_db() as cursor:
            cursor.execute("""
                INSERT INTO user_settings (user_id, max_distance, age_min, age_max)
                VALUES (%s, %s, %s, %s) RETURNING id
            """, (user_id, 50, 18, 35))
            settings_id = cursor.fetchone()['id']
            settings = UserSettings(
                id=settings_id,
                user_id=user_id,
                max_distance=50,
                age_range=AgeRange(min=18, max=35),
                show_me_in_discovery=True,
                is_paused=False
            )
    
    return {"success": True, "data": settings}

@router.put("/{user_id}")
async def update_user_settings(user_id: int, settings_data: UserSettingsUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Update user settings"""
    with get_db() as cursor:
        update_data = settings_data.dict(exclude_unset=True)
        if 'age_range' in update_data:
            age_range = update_data.pop('age_range')
            update_data['age_min'] = age_range['min']
            update_data['age_max'] = age_range['max']
        
        if update_data:
            set_clause = ', '.join([f"{k} = %s" for k in update_data.keys()])
            values = list(update_data.values()) + [user_id]
            cursor.execute(f"""
                UPDATE user_settings SET {set_clause}
                WHERE user_id = %s
            """, values)
    
    settings = get_user_settings_from_db(user_id)
    return {"success": True, "data": settings}

@router.post("/{user_id}/pause")
async def pause_account(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Pause user account"""
    with get_db() as cursor:
        cursor.execute("""
            UPDATE user_settings SET is_paused = %s WHERE user_id = %s
        """, (True, user_id))
    return {"message": "Account paused"}

@router.post("/{user_id}/reactivate")
async def reactivate_account(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Reactivate user account"""
    with get_db() as cursor:
        cursor.execute("""
            UPDATE user_settings SET is_paused = %s WHERE user_id = %s
        """, (False, user_id))
    return {"message": "Account reactivated"}