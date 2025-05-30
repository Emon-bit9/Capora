"""
User-related Pydantic schemas for API validation.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

from app.models.user import ContentNiche, SubscriptionPlan


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    name: str
    niche: ContentNiche = ContentNiche.LIFESTYLE


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str
    
    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    """Schema for user profile updates."""
    name: Optional[str] = None
    niche: Optional[ContentNiche] = None
    avatar: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response (without sensitive data)."""
    id: int
    avatar: Optional[str] = None
    subscription_plan: str = SubscriptionPlan.FREE.value
    subscription_ends_at: Optional[datetime] = None
    captions_used_this_month: int = 0
    videos_processed_this_month: int = 0
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class UserUsageResponse(BaseModel):
    """Schema for user usage statistics."""
    captions_used_this_month: int
    caption_limit: int
    videos_processed_this_month: int
    video_limit: int
    subscription_plan: str
    subscription_ends_at: Optional[datetime] = None
    can_use_captions: bool
    can_process_videos: bool


class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: Optional[str] = None


class PasswordReset(BaseModel):
    """Schema for password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""
    token: str
    new_password: str
    
    @field_validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class SubscriptionUpgrade(BaseModel):
    """Schema for subscription upgrade request."""
    plan: SubscriptionPlan
    payment_method_id: Optional[str] = None 