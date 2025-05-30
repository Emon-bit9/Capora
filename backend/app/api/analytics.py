"""
Analytics API endpoints for tracking content performance.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, extract
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.content import Content
from app.models.video import VideoVariant
from app.schemas.analytics import (
    AnalyticsOverview,
    PlatformPerformance,
    ContentPerformance,
    EngagementTrend,
    AnalyticsResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analytics overview for the user's content.
    """
    try:
        # Calculate date range
        days_map = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}
        days = days_map.get(timeframe, 30)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get user's content in the timeframe
        content_query = db.query(Content).filter(
            Content.user_id == current_user.id,
            Content.created_at >= start_date
        )
        
        # Total content count
        total_content = content_query.count()
        
        # For now, we'll use sample data since we don't have real analytics tracking
        # In a real implementation, you'd have an analytics table with actual metrics
        
        # Generate sample metrics based on content count
        base_views = total_content * 1200  # Assume average 1200 views per content
        base_likes = total_content * 85    # Assume average 85 likes per content
        base_shares = total_content * 12   # Assume average 12 shares per content
        base_comments = total_content * 24 # Assume average 24 comments per content
        
        # Calculate engagement rate
        total_engagement = base_likes + base_shares + base_comments
        engagement_rate = (total_engagement / base_views * 100) if base_views > 0 else 0
        
        # Calculate reach (typically 80% of views)
        reach = int(base_views * 0.8)
        
        # Growth rate calculation (sample)
        growth_rate = min(25.0, max(-10.0, (total_content - 5) * 2.5))  # Sample growth
        
        return AnalyticsOverview(
            total_views=base_views,
            total_likes=base_likes,
            total_shares=base_shares,
            total_comments=base_comments,
            engagement_rate=round(engagement_rate, 1),
            reach=reach,
            content_count=total_content,
            growth_rate=round(growth_rate, 1)
        )
        
    except Exception as e:
        logger.error(f"Failed to get analytics overview for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics overview."
        )


@router.get("/platform-performance")
async def get_platform_performance(
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get performance metrics by platform.
    """
    try:
        # Calculate date range
        days_map = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}
        days = days_map.get(timeframe, 30)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get content with video variants (platforms)
        content_with_variants = db.query(Content, VideoVariant).join(
            VideoVariant, Content.id == VideoVariant.content_id
        ).filter(
            Content.user_id == current_user.id,
            Content.created_at >= start_date
        ).all()
        
        # Group by platform and calculate metrics
        platform_stats = {}
        
        for content, variant in content_with_variants:
            platform = variant.platform
            if platform not in platform_stats:
                platform_stats[platform] = {
                    "content_count": 0,
                    "total_views": 0,
                    "total_likes": 0,
                    "total_shares": 0,
                    "total_comments": 0
                }
            
            # Sample metrics calculation
            platform_stats[platform]["content_count"] += 1
            platform_stats[platform]["total_views"] += 1200  # Sample
            platform_stats[platform]["total_likes"] += 85    # Sample
            platform_stats[platform]["total_shares"] += 12   # Sample
            platform_stats[platform]["total_comments"] += 24 # Sample
        
        # Calculate engagement rates
        result = {}
        for platform, stats in platform_stats.items():
            total_engagement = stats["total_likes"] + stats["total_shares"] + stats["total_comments"]
            engagement_rate = (total_engagement / stats["total_views"] * 100) if stats["total_views"] > 0 else 0
            
            result[platform] = PlatformPerformance(
                views=stats["total_views"],
                likes=stats["total_likes"],
                shares=stats["total_shares"],
                comments=stats["total_comments"],
                engagement_rate=round(engagement_rate, 1)
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get platform performance for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve platform performance."
        )


@router.get("/content-performance")
async def get_content_performance(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get recent content performance.
    """
    try:
        # Get recent content
        recent_content = db.query(Content).filter(
            Content.user_id == current_user.id
        ).order_by(desc(Content.created_at)).limit(limit).all()
        
        performance_data = []
        for content in recent_content:
            # Get a platform for this content (take first variant if available)
            variant = db.query(VideoVariant).filter(
                VideoVariant.content_id == content.id
            ).first()
            
            platform = variant.platform if variant else "unknown"
            
            # Sample metrics
            views = 1200 + (len(content.title or "") * 10)  # Sample calculation
            likes = int(views * 0.07)  # 7% like rate
            engagement_rate = round(likes / views * 100, 1) if views > 0 else 0
            
            performance_data.append(ContentPerformance(
                id=content.id,
                title=content.title,
                platform=platform,
                views=views,
                likes=likes,
                engagement_rate=engagement_rate,
                created_at=content.created_at.isoformat()
            ))
        
        return performance_data
        
    except Exception as e:
        logger.error(f"Failed to get content performance for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve content performance."
        )


@router.get("/engagement-trend")
async def get_engagement_trend(
    timeframe: str = Query("7d", regex="^(7d|30d|90d)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get engagement trend over time.
    """
    try:
        # Calculate date range
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(timeframe, 7)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Generate sample trend data
        trend_data = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            
            # Sample trend calculation (would be real data in production)
            base_views = 800 + (i * 50) + (i % 3 * 200)  # Simulated growth trend
            base_likes = int(base_views * 0.06)
            base_shares = int(base_views * 0.01)
            
            trend_data.append(EngagementTrend(
                date=date.strftime("%Y-%m-%d"),
                views=base_views,
                likes=base_likes,
                shares=base_shares
            ))
        
        return trend_data
        
    except Exception as e:
        logger.error(f"Failed to get engagement trend for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve engagement trend."
        )


@router.get("/insights")
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered insights and recommendations.
    """
    try:
        # Get user's content statistics
        total_content = db.query(Content).filter(Content.user_id == current_user.id).count()
        
        # Get platform distribution
        platform_distribution = db.query(VideoVariant.platform, func.count(VideoVariant.id))\
            .join(Content, VideoVariant.content_id == Content.id)\
            .filter(Content.user_id == current_user.id)\
            .group_by(VideoVariant.platform)\
            .all()
        
        # Generate insights based on data
        insights = []
        
        # Content volume insight
        if total_content < 5:
            insights.append({
                "type": "recommendation",
                "title": "Boost Your Content Creation",
                "message": f"You've created {total_content} pieces of content. Try to post more consistently to build your audience. Aim for at least 3-4 posts per week!",
                "priority": "high"
            })
        elif total_content > 20:
            insights.append({
                "type": "achievement", 
                "title": "Content Creator",
                "message": f"Amazing! You've created {total_content} pieces of content. You're building a strong content library!",
                "priority": "medium"
            })
        
        # Platform diversity insight
        platform_count = len(platform_distribution)
        if platform_count == 1:
            insights.append({
                "type": "recommendation",
                "title": "Expand to New Platforms",
                "message": "You're currently focusing on one platform. Consider expanding to Instagram, TikTok, or YouTube to reach a wider audience.",
                "priority": "medium"
            })
        elif platform_count >= 3:
            insights.append({
                "type": "achievement",
                "title": "Multi-Platform Creator", 
                "message": f"Great job diversifying across {platform_count} platforms! This helps maximize your reach and engagement.",
                "priority": "low"
            })
        
        # Best performing platform
        if platform_distribution:
            top_platform = max(platform_distribution, key=lambda x: x[1])
            insights.append({
                "type": "insight",
                "title": "Top Performing Platform",
                "message": f"{top_platform[0].title()} is your most active platform with {top_platform[1]} pieces of content. Keep leveraging this platform's strength!",
                "priority": "medium"
            })
        
        # Usage pattern insights
        recent_content = db.query(Content).filter(
            Content.user_id == current_user.id,
            Content.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        if recent_content == 0:
            insights.append({
                "type": "reminder",
                "title": "Stay Consistent",
                "message": "You haven't posted any content this week. Consistency is key to growing your audience. Try scheduling your next post!",
                "priority": "high"
            })
        
        return {
            "insights": insights,
            "summary": {
                "total_content": total_content,
                "platforms_used": platform_count,
                "recent_activity": recent_content
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get insights for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve insights."
        )


@router.get("/export")
async def export_analytics(
    format: str = Query("json", regex="^(json|csv)$"),
    timeframe: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export analytics data in different formats.
    """
    try:
        # Get all analytics data
        overview = await get_analytics_overview(timeframe, current_user, db)
        platform_performance = await get_platform_performance(timeframe, current_user, db)
        content_performance = await get_content_performance(20, current_user, db)
        
        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "timeframe": timeframe,
            "user_id": current_user.id,
            "overview": overview.dict(),
            "platform_performance": {k: v.dict() for k, v in platform_performance.items()},
            "content_performance": [item.dict() for item in content_performance]
        }
        
        if format == "json":
            return export_data
        elif format == "csv":
            # For CSV, we'd typically use pandas or csv writer
            # For now, return a simplified version
            return {
                "message": "CSV export not yet implemented",
                "data": export_data
            }
        
    except Exception as e:
        logger.error(f"Failed to export analytics for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export analytics data."
        ) 