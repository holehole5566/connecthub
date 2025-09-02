from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Location(BaseModel):
    latitude: float
    longitude: float
    city: str

class UserBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: str
    birthday: datetime
    gender: str
    bio: str
    interests: List[str]
    location: Optional[Location] = None

class UserRegister(UserBase):
    username: str
    password: str
    photos: List[str]

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserBase):
    username: str
    password_hash: str
    photos: List[str]

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    location: Optional[Location] = None

class User(UserBase):
    id: int
    username: str
    age: int
    photos: List[str]
    photo_url: Optional[str] = None
    distance: float = 0
    is_active: bool = True
    last_seen: datetime
    created_at: datetime
    updated_at: datetime
    is_verified: bool = False
    report_count: int = 0
    is_premium: Optional[bool] = False

    class Config:
        from_attributes = True