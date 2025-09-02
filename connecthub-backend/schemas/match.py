from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import User

class MatchBase(BaseModel):
    user_id: int
    matched_user_id: int

class MatchCreate(MatchBase):
    pass

class LastMessage(BaseModel):
    text: str
    sent_at: datetime
    is_from_current_user: bool

class Match(MatchBase):
    id: str
    user: User
    matched_at: datetime
    last_message: Optional[LastMessage] = None
    is_new_match: bool = True

    class Config:
        from_attributes = True