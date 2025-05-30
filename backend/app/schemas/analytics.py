"""
Analytics-related Pydantic schemas for API validation and responses.
"""

from pydantic import BaseModel
from typing import Dict, Optional, Any, List
from datetime import datetime, date


class AnalyticsOverview(BaseModel):
    """Schema for analytics overview response."""
    total_views: int
    total_likes: int
    total_shares: int
    total_comments: int
    engagement_rate: float
    reach: int
    content_count: int
    growth_rate: float


class PlatformPerformance(BaseModel):
    """Schema for platform performance metrics."""
    views: int
    likes: int
    shares: int
    comments: int
    engagement_rate: float


class ContentPerformance(BaseModel):
    """Schema for individual content performance."""
    id: str
    title: str
    platform: str
    views: int
    likes: int
    engagement_rate: float
    created_at: str


class EngagementTrend(BaseModel):
    """Schema for engagement trend data points."""
    date: str
    views: int
    likes: int
    shares: int


class AnalyticsResponse(BaseModel):
    """Schema for comprehensive analytics response."""
    overview: AnalyticsOverview
    platform_performance: Dict[str, PlatformPerformance]
    content_performance: List[ContentPerformance]
    engagement_trend: List[EngagementTrend]


class InsightItem(BaseModel):
    """Schema for individual insight item."""
    type: str  # recommendation, achievement, insight, reminder
    title: str
    message: str
    priority: str  # high, medium, low


class InsightsResponse(BaseModel):
    """Schema for insights response."""
    insights: List[InsightItem]
    summary: Dict[str, Any]


class ExportRequest(BaseModel):
    """Schema for analytics export request."""
    format: str = "json"  # json, csv
    timeframe: str = "30d"  # 7d, 30d, 90d, 1y
    include_content_details: bool = True
    include_platform_breakdown: bool = True


class PlatformAnalytics(BaseModel):
    """Schema for platform-specific analytics."""
    platform: str
    content_count: int
    total_views: int
    total_likes: int
    total_shares: int
    engagement_rate: float
    average_views: int
    best_performing_content_id: Optional[str] = None


class TopPerformingContent(BaseModel):
    """Schema for top performing content."""
    content_id: str
    title: str
    views: int
    likes: int
    engagement_rate: float
    platform_count: int
    created_at: datetime


class UserGrowthMetrics(BaseModel):
    """Schema for user growth metrics."""
    followers_gained: int
    follower_growth_rate: float
    reach_growth: float
    engagement_growth: float
    content_frequency: float  # Posts per day


class CompetitorAnalysis(BaseModel):
    """Schema for competitor analysis (future feature)."""
    niche: str
    average_engagement_rate: float
    trending_hashtags: list[str]
    optimal_posting_times: list[str]
    user_performance_percentile: int 