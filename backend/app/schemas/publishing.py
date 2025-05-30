"""
Publishing-related Pydantic schemas for API validation.
"""

from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class PublishRequest(BaseModel):
    """Schema for content publishing request."""
    platforms: List[str]
    caption_override: Optional[str] = None
    schedule_time: Optional[datetime] = None
    
    @field_validator('platforms')
    def validate_platforms(cls, v):
        allowed_platforms = ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter']
        invalid = [p for p in v if p not in allowed_platforms]
        if invalid:
            raise ValueError(f'Invalid platforms: {invalid}. Allowed: {allowed_platforms}')
        return v


class PublishResponse(BaseModel):
    """Schema for publishing response."""
    content_id: str
    title: str
    platforms: List[str]
    results: List[Dict[str, Any]]
    overall_status: str
    published_at: str


class ScheduleRequest(BaseModel):
    """Schema for content scheduling request."""
    platforms: List[str]
    schedule_time: datetime
    caption_override: Optional[str] = None
    
    @field_validator('schedule_time')
    def validate_schedule_time(cls, v):
        if v <= datetime.utcnow():
            raise ValueError('Schedule time must be in the future')
        return v


class ScheduleResponse(BaseModel):
    """Schema for scheduling response."""
    content_id: str
    title: str
    scheduled_for: str
    platforms: List[str]
    status: str
    schedule_id: str


class PublishingAccountResponse(BaseModel):
    """Schema for connected social media account."""
    platform: str
    username: str
    is_connected: bool
    connection_status: str
    last_sync: Optional[datetime] = None
    account_type: str
    follower_count: int


class PublishingStatus(BaseModel):
    """Schema for overall publishing status."""
    publishing_enabled: bool
    connected_platforms: List[str]
    available_platforms: List[str]
    features: Dict[str, str]
    limitations: Dict[str, Any]


class ScheduledPost(BaseModel):
    """Schema for scheduled post."""
    schedule_id: str
    content_id: str
    title: str
    platforms: List[str]
    scheduled_time: datetime
    status: str
    created_at: datetime


class PublishingAnalytics(BaseModel):
    """Schema for publishing analytics."""
    platform: str
    total_posts: int
    successful_posts: int
    failed_posts: int
    scheduled_posts: int
    last_post_date: Optional[datetime] = None
    average_engagement: float


class SocialMediaConnection(BaseModel):
    """Schema for social media connection request."""
    platform: str
    auth_code: Optional[str] = None
    redirect_uri: Optional[str] = None 