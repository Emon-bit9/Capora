"""
Content-related Pydantic schemas for API validation.
"""

from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.models.content import ContentStatus, Platform, ContentTone, ContentNiche


class ContentBase(BaseModel):
    """Base content schema with common fields."""
    title: str
    caption: Optional[str] = None
    hashtags: List[str] = []
    platforms: List[Platform] = []
    niche: ContentNiche
    tone: ContentTone


class ContentCreate(ContentBase):
    """Schema for content creation."""
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class ContentCreateRequest(BaseModel):
    """Schema for content creation request."""
    title: str
    caption: Optional[str] = None
    hashtags: List[str] = []
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    niche: Optional[str] = None
    tone: Optional[str] = None


class ContentUpdateRequest(BaseModel):
    """Schema for content updates."""
    title: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[List[str]] = None
    niche: Optional[str] = None
    tone: Optional[str] = None
    status: Optional[str] = None


class ContentResponse(BaseModel):
    """Schema for content response."""
    id: str
    title: str
    caption: Optional[str] = None
    hashtags: List[str] = []
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: str
    platforms: List[str] = []
    niche: Optional[str] = None
    tone: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    variants: List[Dict[str, Any]] = []
    
    class Config:
        from_attributes = True


class ContentListResponse(BaseModel):
    """Schema for paginated content list response."""
    items: List[ContentResponse]
    total: int
    skip: int
    limit: int


class ContentAnalytics(BaseModel):
    """Schema for content analytics."""
    content_id: str
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    engagement_rate: float = 0.0
    reach: int = 0
    impressions: int = 0
    platform_breakdown: Dict[str, Dict[str, int]] = {}
    performance_score: int = 0


class CaptionGenerationRequest(BaseModel):
    """Schema for AI caption generation request."""
    video_description: str
    tone: str = "casual"
    niche: str = "lifestyle"
    include_hashtags: bool = True
    max_length: Optional[int] = 2200  # Instagram limit
    platforms: List[str] = []
    
    @field_validator('video_description')
    def validate_description(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Video description must be at least 10 characters long')
        return v.strip()


class CaptionGenerationResponse(BaseModel):
    """Schema for AI caption generation response."""
    caption: str
    hashtags: List[str]
    word_count: int
    character_count: int
    estimated_engagement: str  # "high", "medium", "low"


class VideoUploadRequest(BaseModel):
    """Schema for video upload request."""
    platforms: List[str]
    title: Optional[str] = None
    description: Optional[str] = None


class VideoProcessingResponse(BaseModel):
    """Schema for video processing response."""
    content_id: str
    original_video_url: str
    thumbnail_url: str
    status: str
    variants: dict  # Platform-specific variants 