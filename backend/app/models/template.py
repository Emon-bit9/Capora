"""
Template model for storing reusable content templates.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Template(Base):
    """Template model for reusable content templates."""
    
    __tablename__ = "templates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Template content
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)  # The actual template text with placeholders
    
    # Categorization
    tone = Column(String(50), nullable=False)  # casual, professional, fun, motivational
    niche = Column(String(50), nullable=False)  # fitness, food, lifestyle, business, etc.
    platforms = Column(JSON, nullable=True)  # List of platforms this template works for
    
    # Usage and favorites
    usage_count = Column(Integer, default=0)
    is_favorite = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)  # Whether other users can see this template
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="templates")

    def __repr__(self):
        return f"<Template(id={self.id}, title='{self.title}', tone='{self.tone}', niche='{self.niche}')>"
    
    @property
    def platform_list(self):
        """Return platforms as a list, handling None values."""
        return self.platforms if self.platforms else []
    
    @property
    def is_user_template(self):
        """Check if this is a user-created template (not a system template)."""
        return self.user_id is not None

    def increment_usage(self):
        """Increment usage count."""
        self.usage_count += 1 