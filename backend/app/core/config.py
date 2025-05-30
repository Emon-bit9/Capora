"""
Application configuration settings for free tier cloud deployment.
"""

from typing import List, Optional, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator
import os


class Settings(BaseSettings):
    """Application settings optimized for free tier cloud deployment."""
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-12345")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database - Use environment variable for production, SQLite for local
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./capora.db")
    
    # Redis - Not needed for free tier deployment
    REDIS_URL: Optional[str] = None
    
    # CORS - Updated for cloud deployment
    ALLOWED_ORIGINS: List[str] = [
        "https://capora.vercel.app",
        "https://*.vercel.app",
        "http://localhost:3000", 
        "http://localhost:3001"
    ]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # AI Services (FREE Tier) - SECURE: Get from environment only
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    
    # File Storage - Local storage for free tier
    UPLOAD_DIR: str = "/tmp/uploads" if os.getenv("ENVIRONMENT") == "production" else "uploads"
    PROCESSED_DIR: str = "/tmp/processed" if os.getenv("ENVIRONMENT") == "production" else "processed"
    THUMBNAILS_DIR: str = "/tmp/thumbnails" if os.getenv("ENVIRONMENT") == "production" else "thumbnails"
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB for free tier
    ALLOWED_VIDEO_TYPES: List[str] = ["video/mp4", "video/avi", "video/mov", "video/webm"]
    
    # Rate Limiting (Conservative for free tier)
    RATE_LIMIT_PER_MINUTE: int = 10
    RATE_LIMIT_PER_HOUR: int = 100

    @field_validator("ALLOWED_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from environment variable."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @field_validator("ALLOWED_HOSTS", mode="before")
    def assemble_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse allowed hosts from environment variable."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


# Global settings instance
settings = Settings()


# Platform-specific video specifications (optimized for free tier)
PLATFORM_SPECS = {
    "tiktok": {
        "width": 1080,
        "height": 1920,
        "aspect_ratio": "9:16",
        "max_duration": 60,
        "max_size": 25 * 1024 * 1024,  # 25MB for free tier
    },
    "instagram": {
        "width": 1080,
        "height": 1920,
        "aspect_ratio": "9:16",
        "max_duration": 60,
        "max_size": 25 * 1024 * 1024,  # 25MB
    },
    "youtube_shorts": {
        "width": 1080,
        "height": 1920,
        "aspect_ratio": "9:16",
        "max_duration": 60,
        "max_size": 25 * 1024 * 1024,  # 25MB
    },
    "facebook": {
        "width": 1280,
        "height": 720,
        "aspect_ratio": "16:9",
        "max_duration": 120,
        "max_size": 25 * 1024 * 1024,  # 25MB
    },
    "twitter": {
        "width": 1280,
        "height": 720,
        "aspect_ratio": "16:9",
        "max_duration": 120,
        "max_size": 25 * 1024 * 1024,  # 25MB
    },
}


# Content niches and tones
CONTENT_NICHES = [
    "fitness",
    "food",
    "education",
    "lifestyle",
    "business",
    "tech",
]

CONTENT_TONES = [
    "casual",
    "professional",
    "fun",
    "motivational",
    "educational",
    "trendy",
] 