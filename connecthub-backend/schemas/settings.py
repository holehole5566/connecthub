from pydantic import BaseModel
from typing import Optional

class AgeRange(BaseModel):
    min: int
    max: int

class UserSettingsBase(BaseModel):
    max_distance: int = 50
    age_range: AgeRange = AgeRange(min=18, max=35)
    show_me_in_discovery: bool = True
    is_paused: bool = False

class UserSettingsUpdate(BaseModel):
    max_distance: Optional[int] = None
    age_range: Optional[AgeRange] = None
    show_me_in_discovery: Optional[bool] = None

class UserSettings(UserSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True