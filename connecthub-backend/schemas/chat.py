from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatMessageBase(BaseModel):
    text: str

class ChatMessageCreate(ChatMessageBase):
    match_id: str

class ChatMessage(ChatMessageBase):
    id: str
    match_id: str
    from_user_id: int
    is_from_current_user: Optional[bool] = None
    sent_at: datetime
    status: Optional[str] = "sent"

    class Config:
        from_attributes = True