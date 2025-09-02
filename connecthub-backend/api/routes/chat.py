from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from schemas.chat import ChatMessage, ChatMessageCreate
from auth.middleware import get_current_user
from database import get_db
from datetime import datetime
import uuid

router = APIRouter()

def get_chat_messages(match_id: str, limit: int = None, before: str = None):
    with get_db() as cursor:
        query = "SELECT * FROM messages WHERE match_id = %s"
        params = [match_id]
        
        if before:
            query += " AND sent_at < (SELECT sent_at FROM messages WHERE id = %s)"
            params.append(before)
        
        query += " ORDER BY sent_at DESC"
        
        if limit:
            query += f" LIMIT {limit}"
        
        cursor.execute(query, params)
        messages = []
        for row in cursor.fetchall():
            msg_dict = dict(row)
            messages.append(ChatMessage(**msg_dict))
        return list(reversed(messages))

def create_message(match_id: str, from_user_id: int, text: str):
    with get_db() as cursor:
        cursor.execute("""
            INSERT INTO messages (match_id, from_user_id, text) 
            VALUES (%s, %s, %s) RETURNING *
        """, (match_id, from_user_id, text))
        row = cursor.fetchone()
        msg_dict = dict(row)
        return ChatMessage(**msg_dict)

def update_match_last_message(match_id: str, message_id: str):
    with get_db() as cursor:
        cursor.execute("""
            UPDATE matches SET last_message_id = %s WHERE id = %s
        """, (message_id, match_id))

@router.get("/{match_id}/messages")
async def get_chat_history(
    match_id: str,
    limit: Optional[int] = 50,
    before: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get chat history for a match"""
    messages = get_chat_messages(match_id, limit, before)
    # Set is_from_current_user for each message
    for message in messages:
        message.is_from_current_user = message.from_user_id == current_user["id"]
    return {"success": True, "data": messages}

@router.post("/{match_id}/messages")
async def send_message(
    match_id: str, 
    message_data: ChatMessageCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Send a message in a chat"""
    
    # Create message
    new_message = create_message(match_id, current_user["id"], message_data.text)
    
    # Set is_from_current_user for the new message
    new_message.is_from_current_user = True
    
    # Update match last_message_id
    update_match_last_message(match_id, new_message.id)
    
    return {"success": True, "data": new_message}