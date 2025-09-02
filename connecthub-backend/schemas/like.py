from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .match import Match

class LikeBase(BaseModel):
    target_user_id: int
    like_type: str = "like"  # "like" or "super"

class LikeCreate(LikeBase):
    pass

class Like(BaseModel):
    id: str
    from_user_id: int
    to_user_id: int
    type: str
    created_at: datetime

    class Config:
        from_attributes = True

class LikeResponse(BaseModel):
    is_match: bool
    match: Optional[Match] = None
    likes_remaining: Optional[int] = None
    super_likes_remaining: Optional[int] = None