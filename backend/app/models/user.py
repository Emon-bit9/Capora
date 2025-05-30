"""
User model for authentication and user management.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class ContentNiche(str, enum.Enum):
    """Content niche enumeration."""
    FITNESS = "fitness"
    FOOD = "food"
    EDUCATION = "education"
    LIFESTYLE = "lifestyle"
    BUSINESS = "business"
    TECH = "tech"


class SubscriptionPlan(str, enum.Enum):
    """Subscription plan enumeration."""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class User(Base):
    """User model for authentication and profile management."""
    
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    avatar = Column(String(500), nullable=True)  # URL to avatar image
    niche = Column(String(50), default=ContentNiche.LIFESTYLE.value)
    
    # Subscription and billing
    subscription_plan = Column(String(20), default=SubscriptionPlan.FREE.value)
    subscription_ends_at = Column(DateTime(timezone=True), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    
    # Usage tracking for limits
    captions_used_this_month = Column(Integer, default=0)
    videos_processed_this_month = Column(Integer, default=0)
    usage_reset_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Settings (JSON stored as text for simplicity)
    preferences = Column(Text, nullable=True)  # JSON string for user preferences
    
    # Relationships
    contents = relationship("Content", back_populates="user", cascade="all, delete-orphan")
    templates = relationship("Template", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"
    
    @property
    def display_name(self) -> str:
        """Return display name for the user."""
        return self.name or self.email.split("@")[0]
    
    @property
    def is_pro_or_higher(self) -> bool:
        """Check if user has Pro or Enterprise plan."""
        return self.subscription_plan in [SubscriptionPlan.PRO.value, SubscriptionPlan.ENTERPRISE.value]
    
    @property
    def caption_limit(self) -> int:
        """Get monthly caption limit based on plan."""
        limits = {
            SubscriptionPlan.FREE.value: 10,
            SubscriptionPlan.PRO.value: 1000,
            SubscriptionPlan.ENTERPRISE.value: 10000
        }
        return limits.get(self.subscription_plan, 10)
    
    @property
    def video_limit(self) -> int:
        """Get monthly video processing limit based on plan."""
        limits = {
            SubscriptionPlan.FREE.value: 5,
            SubscriptionPlan.PRO.value: 100,
            SubscriptionPlan.ENTERPRISE.value: 1000
        }
        return limits.get(self.subscription_plan, 5)
    
    def can_use_captions(self) -> bool:
        """Check if user can generate more captions this month."""
        return self.captions_used_this_month < self.caption_limit
    
    def can_generate_captions(self) -> bool:
        """Check if user can generate more captions this month (alias for can_use_captions)."""
        return self.can_use_captions()
    
    def can_process_videos(self) -> bool:
        """Check if user can process more videos this month."""
        return self.videos_processed_this_month < self.video_limit
    
    def increment_caption_usage(self):
        """Increment caption usage count."""
        self.captions_used_this_month += 1
    
    def increment_video_usage(self):
        """Increment video processing usage count."""
        self.videos_processed_this_month += 1 