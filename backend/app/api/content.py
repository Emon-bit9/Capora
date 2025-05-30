"""
Content management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
import logging
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.content import Content, ContentStatus, Platform, ContentTone, ContentNiche
from app.models.video import VideoVariant
from app.schemas.content import (
    ContentResponse,
    ContentCreateRequest,
    ContentUpdateRequest,
    ContentListResponse,
    ContentAnalytics
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=ContentListResponse)
async def get_user_content(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    niche: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's content with pagination and filtering.
    """
    try:
        # Build query
        query = db.query(Content).filter(Content.user_id == current_user.id)
        
        # Apply filters
        if status_filter:
            query = query.filter(Content.status == status_filter)
        
        if niche:
            query = query.filter(Content.niche == niche)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        content_items = (
            query.order_by(desc(Content.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Convert to response models
        content_responses = []
        for content in content_items:
            # Get video variants
            variants = db.query(VideoVariant).filter(
                VideoVariant.content_id == content.id
            ).all()
            
            content_responses.append(ContentResponse(
                id=content.id,
                title=content.title,
                caption=content.caption,
                hashtags=content.hashtags or [],
                video_url=content.video_url,
                thumbnail_url=content.thumbnail_url,
                status=content.status,
                platforms=[v.platform for v in variants],
                niche=content.niche,
                tone=content.tone,
                created_at=content.created_at,
                updated_at=content.updated_at,
                variants=[{
                    "id": v.id,
                    "platform": v.platform,
                    "video_url": v.video_url,
                    "thumbnail_url": v.thumbnail_url,
                    "width": v.width,
                    "height": v.height
                } for v in variants]
            ))
        
        return ContentListResponse(
            items=content_responses,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get content for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get content."
        )


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific content item.
    """
    try:
        content = db.query(Content).filter(
            and_(
                Content.id == content_id,
                Content.user_id == current_user.id
            )
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        # Get video variants
        variants = db.query(VideoVariant).filter(
            VideoVariant.content_id == content.id
        ).all()
        
        return ContentResponse(
            id=content.id,
            title=content.title,
            caption=content.caption,
            hashtags=content.hashtags or [],
            video_url=content.video_url,
            thumbnail_url=content.thumbnail_url,
            status=content.status,
            platforms=[v.platform for v in variants],
            niche=content.niche,
            tone=content.tone,
            created_at=content.created_at,
            updated_at=content.updated_at,
            variants=[{
                "id": v.id,
                "platform": v.platform,
                "video_url": v.video_url,
                "thumbnail_url": v.thumbnail_url,
                "width": v.width,
                "height": v.height
            } for v in variants]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get content {content_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get content."
        )


@router.post("/", response_model=ContentResponse)
async def create_content(
    request: ContentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create new content item.
    """
    try:
        # Create content directly with string values
        content = Content(
            user_id=current_user.id,
            title=request.title,
            caption=request.caption,
            hashtags=request.hashtags,
            video_url=request.video_url,
            thumbnail_url=request.thumbnail_url,
            status="draft",
            niche=request.niche,  # Use string directly
            tone=request.tone     # Use string directly
        )
        
        db.add(content)
        db.commit()
        db.refresh(content)
        
        logger.info(f"Content created for user {current_user.id}: {content.id}")
        
        return ContentResponse(
            id=content.id,
            title=content.title,
            caption=content.caption,
            hashtags=content.hashtags or [],
            video_url=content.video_url,
            thumbnail_url=content.thumbnail_url,
            status=content.status,
            platforms=[],
            niche=content.niche,
            tone=content.tone,
            created_at=content.created_at,
            updated_at=content.updated_at,
            variants=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create content for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create content."
        )


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: str,
    request: ContentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update existing content item.
    """
    try:
        content = db.query(Content).filter(
            and_(
                Content.id == content_id,
                Content.user_id == current_user.id
            )
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        # Update fields
        if request.title is not None:
            content.title = request.title
        
        if request.caption is not None:
            content.caption = request.caption
        
        if request.hashtags is not None:
            content.hashtags = request.hashtags
        
        if request.niche is not None:
            content.niche = request.niche
        
        if request.tone is not None:
            content.tone = request.tone
        
        if request.status is not None:
            try:
                status_enum = ContentStatus(request.status)
                content.status = status_enum.value
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {request.status}"
                )
        
        content.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(content)
        
        # Get video variants
        variants = db.query(VideoVariant).filter(
            VideoVariant.content_id == content.id
        ).all()
        
        logger.info(f"Content updated for user {current_user.id}: {content.id}")
        
        return ContentResponse(
            id=content.id,
            title=content.title,
            caption=content.caption,
            hashtags=content.hashtags or [],
            video_url=content.video_url,
            thumbnail_url=content.thumbnail_url,
            status=content.status,
            platforms=[v.platform for v in variants],
            niche=content.niche,
            tone=content.tone,
            created_at=content.created_at,
            updated_at=content.updated_at,
            variants=[{
                "id": v.id,
                "platform": v.platform,
                "video_url": v.video_url,
                "thumbnail_url": v.thumbnail_url,
                "width": v.width,
                "height": v.height
            } for v in variants]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update content {content_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update content."
        )


@router.delete("/{content_id}")
async def delete_content(
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete content item and all associated data.
    """
    try:
        content = db.query(Content).filter(
            and_(
                Content.id == content_id,
                Content.user_id == current_user.id
            )
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        # Delete associated video variants
        db.query(VideoVariant).filter(
            VideoVariant.content_id == content_id
        ).delete()
        
        # Delete content
        db.delete(content)
        db.commit()
        
        logger.info(f"Content deleted for user {current_user.id}: {content_id}")
        
        return {"message": "Content deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete content {content_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete content."
        )


@router.get("/{content_id}/analytics", response_model=ContentAnalytics)
async def get_content_analytics(
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analytics for specific content item.
    """
    try:
        content = db.query(Content).filter(
            and_(
                Content.id == content_id,
                Content.user_id == current_user.id
            )
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        # For demo purposes, return mock analytics
        # In production, integrate with actual analytics service
        return ContentAnalytics(
            content_id=content_id,
            views=1250,
            likes=89,
            comments=23,
            shares=15,
            engagement_rate=8.2,
            reach=1050,
            impressions=1680,
            platform_breakdown={
                "tiktok": {"views": 650, "likes": 45, "comments": 12},
                "instagram": {"views": 400, "likes": 30, "comments": 8},
                "youtube": {"views": 200, "likes": 14, "comments": 3}
            },
            performance_score=85
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analytics for content {content_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get content analytics."
        )


@router.post("/{content_id}/schedule")
async def schedule_content(
    content_id: str,
    schedule_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Schedule content for publishing at a specific time.
    """
    try:
        content = db.query(Content).filter(
            and_(
                Content.id == content_id,
                Content.user_id == current_user.id
            )
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        # Parse schedule time
        from datetime import datetime
        try:
            publish_time = datetime.fromisoformat(schedule_data.get("publish_time"))
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid publish_time format. Use ISO format."
            )
        
        # Validate future time
        if publish_time <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scheduled time must be in the future"
            )
        
        # Check if user has Pro plan for scheduling (Free users can't schedule)
        if not current_user.is_pro_or_higher:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Content scheduling is a Pro feature. Upgrade to schedule posts."
            )
        
        # Update content
        content.mark_as_scheduled(publish_time)
        db.commit()
        
        logger.info(f"Content {content_id} scheduled for publishing at {publish_time} by user {current_user.id}")
        
        return {
            "message": "Content scheduled successfully",
            "content_id": content.id,
            "scheduled_time": content.scheduled_publish_time,
            "status": content.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to schedule content {content_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to schedule content."
        )


@router.delete("/{content_id}/schedule")
async def unschedule_content(
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove scheduled publishing for content.
    """
    try:
        content = db.query(Content).filter(
            and_(
                Content.id == content_id,
                Content.user_id == current_user.id
            )
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        if content.status != ContentStatus.SCHEDULED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content is not scheduled"
            )
        
        # Remove scheduling
        content.status = ContentStatus.READY.value
        content.scheduled_publish_time = None
        db.commit()
        
        logger.info(f"Content {content_id} unscheduled by user {current_user.id}")
        
        return {
            "message": "Content unscheduled successfully",
            "content_id": content.id,
            "status": content.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to unschedule content {content_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unschedule content."
        )


@router.get("/scheduled", response_model=ContentListResponse)
async def get_scheduled_content(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all scheduled content for the current user.
    """
    try:
        # Get total count
        total = db.query(Content).filter(
            Content.user_id == current_user.id,
            Content.status == ContentStatus.SCHEDULED.value
        ).count()
        
        # Get content items
        content_items = (
            db.query(Content)
            .filter(
                Content.user_id == current_user.id,
                Content.status == ContentStatus.SCHEDULED.value
            )
            .order_by(Content.scheduled_publish_time.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        return ContentListResponse(
            items=[ContentResponse.model_validate(content) for content in content_items],
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Failed to get scheduled content for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get scheduled content."
        ) 