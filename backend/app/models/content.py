"""
Content model for storing user-generated social media content.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class ContentStatus(str, enum.Enum):
    """Content status enumeration."""
    DRAFT = "draft"
    PROCESSING = "processing"
    READY = "ready"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    ARCHIVED = "archived"


class Platform(str, enum.Enum):
    """Social media platform enumeration."""
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    YOUTUBE_SHORTS = "youtube_shorts"
    FACEBOOK = "facebook"
    TWITTER = "twitter"


class ContentTone(str, enum.Enum):
    """Content tone enumeration."""
    CASUAL = "casual"
    PROFESSIONAL = "professional"
    FUN = "fun"
    MOTIVATIONAL = "motivational"
    EDUCATIONAL = "educational"
    TRENDY = "trendy"


class ContentNiche(str, enum.Enum):
    """Content niche enumeration."""
    FITNESS = "fitness"
    FOOD = "food"
    EDUCATION = "education"
    LIFESTYLE = "lifestyle"
    BUSINESS = "business"
    TECH = "tech"


class Content(Base):
    """Content model for storing user-generated social media content."""
    
    __tablename__ = "contents"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Content details
    title = Column(String(255), nullable=False)
    caption = Column(Text, nullable=True)
    hashtags = Column(JSON, default=[])  # Store as JSON array
    
    # Content metadata
    status = Column(String(50), default="draft")  # Use string value directly
    platforms = Column(JSON, default=[])  # Store as JSON array of platforms
    niche = Column(String(50), nullable=False)
    tone = Column(String(50), nullable=False)
    
    # Media URLs
    video_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    
    # Analytics (basic)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Scheduling
    scheduled_publish_time = Column(DateTime(timezone=True), nullable=True)
    platform_post_ids = Column(JSON, default={})  # Store platform-specific post IDs
    publish_results = Column(JSON, default={})  # Store publishing results/errors
    
    # Relationships
    user = relationship("User", back_populates="contents")
    video_variants = relationship("VideoVariant", back_populates="content", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Content(id={self.id}, title='{self.title}', status='{self.status}')>"
    
    @property
    def engagement_rate(self) -> float:
        """Calculate basic engagement rate."""
        if self.views == 0:
            return 0.0
        return ((self.likes + self.shares) / self.views) * 100
    
    @property
    def platform_list(self) -> list:
        """Return platforms as a list."""
        return self.platforms if isinstance(self.platforms, list) else []
    
    @property
    def hashtag_list(self) -> list:
        """Return hashtags as a list."""
        return self.hashtags if isinstance(self.hashtags, list) else []
    
    @property
    def is_scheduled(self) -> bool:
        """Check if content is scheduled for publishing."""
        return self.status == "scheduled" and self.scheduled_publish_time is not None
    
    @property
    def is_published(self) -> bool:
        """Check if content has been published."""
        return self.status == "published" and self.published_at is not None
    
    def mark_as_scheduled(self, publish_time):
        """Mark content as scheduled for publishing."""
        self.status = "scheduled"
        self.scheduled_publish_time = publish_time
    
    def mark_as_published(self, platform_results: dict = None):
        """Mark content as published with optional platform results."""
        self.status = "published"
        self.published_at = func.now()
        if platform_results:
            self.publish_results = platform_results 