"""
Template-related Pydantic schemas for API validation.
"""

from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class TemplateBase(BaseModel):
    """Base template schema with common fields."""
    title: str
    content: str
    tone: str
    niche: str
    platforms: List[str] = []
    is_public: bool = False


class TemplateCreate(TemplateBase):
    """Schema for template creation."""
    
    @field_validator('title')
    def validate_title(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Title must be at least 3 characters long')
        return v.strip()
    
    @field_validator('content')
    def validate_content(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Content must be at least 10 characters long')
        return v.strip()
    
    @field_validator('tone')
    def validate_tone(cls, v):
        allowed_tones = ['casual', 'professional', 'fun', 'motivational', 'educational']
        if v not in allowed_tones:
            raise ValueError(f'Tone must be one of: {", ".join(allowed_tones)}')
        return v
    
    @field_validator('niche')
    def validate_niche(cls, v):
        allowed_niches = ['fitness', 'food', 'lifestyle', 'business', 'tech', 'education']
        if v not in allowed_niches:
            raise ValueError(f'Niche must be one of: {", ".join(allowed_niches)}')
        return v


class TemplateUpdate(BaseModel):
    """Schema for template updates."""
    title: Optional[str] = None
    content: Optional[str] = None
    tone: Optional[str] = None
    niche: Optional[str] = None
    platforms: Optional[List[str]] = None
    is_public: Optional[bool] = None
    
    @field_validator('title')
    def validate_title(cls, v):
        if v is not None and len(v.strip()) < 3:
            raise ValueError('Title must be at least 3 characters long')
        return v.strip() if v else v
    
    @field_validator('content')
    def validate_content(cls, v):
        if v is not None and len(v.strip()) < 10:
            raise ValueError('Content must be at least 10 characters long')
        return v.strip() if v else v


class TemplateResponse(BaseModel):
    """Schema for template response."""
    id: str
    title: str
    content: str
    tone: str
    niche: str
    platforms: List[str] = []
    usage_count: int
    is_favorite: bool
    is_public: bool
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    """Schema for paginated template list response."""
    items: List[TemplateResponse]
    total: int
    skip: int
    limit: int


class TemplateUsageResponse(BaseModel):
    """Schema for template usage response."""
    template_id: str
    usage_count: int
    message: str


class TemplateSearchRequest(BaseModel):
    """Schema for template search request."""
    query: Optional[str] = None
    niche: Optional[str] = None
    tone: Optional[str] = None
    platforms: Optional[List[str]] = None
    is_public: Optional[bool] = None 