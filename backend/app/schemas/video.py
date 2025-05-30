"""
Video-related Pydantic schemas for API validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class PlatformEnum(str, Enum):
    """Supported social media platforms."""
    tiktok = "tiktok"
    instagram = "instagram"
    youtube_shorts = "youtube_shorts"
    facebook = "facebook"
    twitter = "twitter"


class VideoUploadResponse(BaseModel):
    """Response model for video upload."""
    content_id: str
    video_url: str
    thumbnail_url: Optional[str] = None
    status: str
    message: str


class VideoProcessingRequest(BaseModel):
    """Request model for video processing."""
    platforms: List[str] = Field(..., min_items=1, description="List of platforms to process video for")
    
    class Config:
        schema_extra = {
            "example": {
                "platforms": ["tiktok", "instagram", "youtube_shorts"]
            }
        }


class VideoVariant(BaseModel):
    """Video variant model for different platforms."""
    id: str
    platform: str
    video_url: str
    thumbnail_url: Optional[str] = None
    width: int
    height: int
    file_size: int
    duration: Optional[float] = None
    
    class Config:
        from_attributes = True


class VideoVariantSchema(BaseModel):
    """Schema for video variant responses."""
    id: str
    platform: str
    video_url: str
    thumbnail_url: Optional[str] = None
    width: int
    height: int
    file_size: int
    duration: Optional[float] = None
    status: str = "completed"
    
    class Config:
        from_attributes = True


class VideoAnalytics(BaseModel):
    """Video analytics model."""
    content_id: str
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    engagement_rate: float = 0.0
    platform: str
    
    class Config:
        from_attributes = True


class VideoUploadRequest(BaseModel):
    """Request model for video upload metadata."""
    title: Optional[str] = None
    description: Optional[str] = None
    niche: Optional[str] = "lifestyle"
    tags: List[str] = []


class PlatformSpecs(BaseModel):
    """Platform specification model."""
    width: int
    height: int
    aspect_ratio: str
    max_duration: int
    max_size: int


class VideoProcessingStatus(BaseModel):
    """Video processing status model."""
    content_id: str
    status: str
    progress: int = 0
    error_message: Optional[str] = None
    estimated_completion: Optional[str] = None


class BulkVideoProcessingRequest(BaseModel):
    """Request model for bulk video processing."""
    content_ids: List[str] = Field(..., min_items=1, max_items=10)
    platforms: List[str] = Field(..., min_items=1)
    
    class Config:
        schema_extra = {
            "example": {
                "content_ids": ["123e4567-e89b-12d3-a456-426614174000"],
                "platforms": ["tiktok", "instagram"]
            }
        } 