from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from schemas.user import User
from auth.middleware import get_current_user
from database import get_db
from datetime import datetime
import uuid

router = APIRouter()

def create_like(from_user_id: int, to_user_id: int, like_type: str):
    with get_db() as cursor:
        cursor.execute("""
            INSERT INTO likes (from_user_id, to_user_id, type) 
            VALUES (%s, %s, %s) RETURNING id
        """, (from_user_id, to_user_id, like_type))
        return cursor.fetchone()['id']

def check_mutual_like(from_user_id: int, to_user_id: int):
    with get_db() as cursor:
        cursor.execute("""
            SELECT id FROM likes 
            WHERE from_user_id = %s AND to_user_id = %s
        """, (to_user_id, from_user_id))
        return cursor.fetchone() is not None

def create_match(user_id: int, matched_user_id: int):
    with get_db() as cursor:
        cursor.execute("""
            INSERT INTO matches (user_id, matched_user_id) 
            VALUES (%s, %s) RETURNING id
        """, (user_id, matched_user_id))
        return cursor.fetchone()['id']

def get_user_matches(user_id: int):
    with get_db() as cursor:
        cursor.execute("""
            SELECT m.*, u.*, m.id as match_id, msg.text as last_message_text, 
                   msg.sent_at as last_message_sent_at, msg.from_user_id as last_message_from_user_id,
                   CASE WHEN m.user_id = %s THEN m.matched_user_id ELSE m.user_id END as other_user_id
            FROM matches m
            JOIN users u ON (CASE WHEN m.user_id = %s THEN m.matched_user_id ELSE m.user_id END) = u.id
            LEFT JOIN messages msg ON m.last_message_id = msg.id
            WHERE m.user_id = %s OR m.matched_user_id = %s
            ORDER BY msg.sent_at DESC NULLS LAST, m.matched_at DESC
        """, (user_id, user_id, user_id, user_id))
        
        matches = []
        for row in cursor.fetchall():
            match_dict = dict(row)
            user_dict = {k: v for k, v in match_dict.items() if k not in ['match_id', 'other_user_id', 'matched_at', 'is_new_match', 'last_message_id', 'last_message_text', 'last_message_sent_at', 'last_message_from_user_id']}
            if user_dict['latitude'] and user_dict['longitude']:
                user_dict['location'] = {
                    'latitude': user_dict['latitude'],
                    'longitude': user_dict['longitude'],
                    'city': user_dict['city']
                }
            
            last_message = None
            if match_dict['last_message_text']:
                last_message = {
                    'text': match_dict['last_message_text'],
                    'sent_at': match_dict['last_message_sent_at'],
                    'is_from_current_user': match_dict['last_message_from_user_id'] == user_id
                }
            
            matches.append({
                'id': match_dict['match_id'],
                'user_id': match_dict['user_id'],
                'matched_user_id': match_dict['matched_user_id'],
                'user': User(**user_dict),
                'matched_at': match_dict['matched_at'],
                'is_new_match': match_dict['is_new_match'],
                'last_message': last_message
            })
        return matches

@router.post("/like")
async def send_like(like_data: dict, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Send a like to another user"""
    
    target_user_id = like_data.get("target_user_id") or like_data.get("to_user_id")
    like_type = like_data.get("like_type") or like_data.get("type", "like")
    
    # Create the like
    create_like(current_user["id"], target_user_id, like_type)
    
    # Check if it's a mutual like (match)
    if check_mutual_like(current_user["id"], target_user_id):
        # Create match
        match_id = create_match(current_user["id"], target_user_id)
        new_match = {
            "id": match_id,
            "user_id": current_user["id"],
            "matched_user_id": target_user_id,
            "matched_at": datetime.now().isoformat(),
            "is_new_match": True
        }
        return {"success": True, "data": {"is_match": True, "match": new_match}}
    
    return {"success": True, "data": {"is_match": False, "likes_remaining": 10, "super_likes_remaining": 1}}

@router.get("/")
async def get_matches(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user's matches"""
    user_matches = get_user_matches(current_user["id"])
    return {"success": True, "data": user_matches}