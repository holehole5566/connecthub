from fastapi import APIRouter, Query, Depends
from typing import List, Optional, Dict, Any
from schemas.user import User
from auth.middleware import get_current_user
from database import get_db
from datetime import datetime
import math

router = APIRouter()

def get_discovery_users(current_user_id: int, age_min: int, age_max: int, max_distance: int, current_lat: float, current_lon: float, limit: int = None):
    with get_db() as cursor:
        # Get matched user IDs
        cursor.execute("""
            SELECT CASE WHEN user_id = %s THEN matched_user_id ELSE user_id END as matched_id
            FROM matches WHERE user_id = %s OR matched_user_id = %s
        """, (current_user_id, current_user_id, current_user_id))
        matched_ids = [row['matched_id'] for row in cursor.fetchall()]
        
        # Get liked user IDs
        cursor.execute("""
            SELECT to_user_id FROM likes WHERE from_user_id = %s
        """, (current_user_id,))
        liked_ids = [row['to_user_id'] for row in cursor.fetchall()]
        
        # Get users for discovery
        excluded_ids = matched_ids + liked_ids + [current_user_id]
        cursor.execute("""
            SELECT * FROM (
                SELECT u.*, 
                       6371 * acos(cos(radians(%s)) * cos(radians(u.latitude)) * 
                       cos(radians(u.longitude) - radians(%s)) + sin(radians(%s)) * 
                       sin(radians(u.latitude))) as calculated_distance
                FROM users u
                JOIN user_settings us ON u.id = us.user_id
                WHERE u.id != ALL(%s) AND u.age BETWEEN %s AND %s 
                      AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL
                      AND us.is_paused = false
            ) u WHERE u.calculated_distance <= %s
            ORDER BY u.calculated_distance
        """ + (f" LIMIT {limit}" if limit else ""), 
        (current_lat, current_lon, current_lat, excluded_ids, age_min, age_max, max_distance))
        
        users = []
        for row in cursor.fetchall():
            user_dict = dict(row)
            # Update distance with calculated value
            user_dict['distance'] = user_dict['calculated_distance']
            if user_dict['latitude'] and user_dict['longitude']:
                user_dict['location'] = {
                    'latitude': user_dict['latitude'],
                    'longitude': user_dict['longitude'],
                    'city': user_dict['city']
                }
            users.append(User(**user_dict))
        return users

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

@router.get("/")
async def discover_users(
    age_min: int = Query(18, ge=18, le=100),
    age_max: int = Query(35, ge=18, le=100),
    max_distance: int = Query(50, ge=1, le=100),
    limit: Optional[int] = Query(10, ge=1, le=50),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get users for discovery based on preferences"""
    
    # Get current user location
    current_user_location = current_user.get("location")
    if not current_user_location:
        return {"success": False, "error": "User location required"}
    
    # Get discovery users from database
    filtered_users = get_discovery_users(
        current_user["id"],
        age_min,
        age_max, 
        max_distance,
        current_user_location["latitude"],
        current_user_location["longitude"],
        limit
    )
    
    return {"success": True, "data": {"users": filtered_users}}