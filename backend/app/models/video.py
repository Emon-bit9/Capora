"""
Video model for storing platform-optimized video variants.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class VideoVariant(Base):
    """Video variant model for platform-optimized videos."""
    
    __tablename__ = "video_variants"

    id = Column(String(36), primary_key=True, index=True)
    content_id = Column(String(36), ForeignKey("contents.id"), nullable=False)
    
    # Platform and format details
    platform = Column(String(50), nullable=False)  # tiktok, instagram, etc.
    video_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)  # Thumbnail URL
    
    # Video specifications
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    duration = Column(Float, nullable=False)  # Duration in seconds
    file_size = Column(Integer, nullable=False)  # File size in bytes
    format = Column(String(10), default="mp4")  # Video format
    
    # Processing status
    status = Column(String(50), default="processing")  # processing, completed, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    content = relationship("Content", back_populates="video_variants")

    def __repr__(self):
        return f"<VideoVariant(id={self.id}, platform='{self.platform}', status='{self.status}')>"
    
    @property
    def aspect_ratio(self) -> str:
        """Calculate and return aspect ratio as string."""
        if self.width == 0 or self.height == 0:
            return "unknown"
        
        # Calculate GCD for simplification
        def gcd(a, b):
            while b:
                a, b = b, a % b
            return a
        
        divisor = gcd(self.width, self.height)
        w = self.width // divisor
        h = self.height // divisor
        return f"{w}:{h}"
    
    @property
    def file_size_mb(self) -> float:
        """Return file size in MB."""
        return round(self.file_size / (1024 * 1024), 2)
    
    @property
    def duration_formatted(self) -> str:
        """Return duration in MM:SS format."""
        minutes = int(self.duration // 60)
        seconds = int(self.duration % 60)
        return f"{minutes:02d}:{seconds:02d}" 