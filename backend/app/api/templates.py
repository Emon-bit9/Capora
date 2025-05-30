"""
Template management API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
import logging
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.template import Template
from app.schemas.template import (
    TemplateCreate,
    TemplateUpdate, 
    TemplateResponse,
    TemplateListResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=TemplateListResponse)
async def get_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    niche: Optional[str] = Query(None),
    tone: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_public: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's templates with filtering and search.
    """
    try:
        query = db.query(Template)
        
        # Filter by user's templates and public templates
        if is_public is None:
            # Show user's templates and public templates
            query = query.filter(
                (Template.user_id == current_user.id) | 
                (Template.is_public == True)
            )
        elif is_public:
            # Show only public templates
            query = query.filter(Template.is_public == True)
        else:
            # Show only user's templates
            query = query.filter(Template.user_id == current_user.id)
        
        # Apply filters
        if niche:
            query = query.filter(Template.niche == niche)
        
        if tone:
            query = query.filter(Template.tone == tone)
            
        if search:
            query = query.filter(
                (Template.title.ilike(f"%{search}%")) |
                (Template.content.ilike(f"%{search}%"))
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        templates = query.order_by(desc(Template.usage_count), desc(Template.created_at))\
                        .offset(skip)\
                        .limit(limit)\
                        .all()
        
        # Convert to response format
        template_responses = []
        for template in templates:
            template_responses.append(TemplateResponse(
                id=template.id,
                title=template.title,
                content=template.content,
                tone=template.tone,
                niche=template.niche,
                platforms=template.platforms or [],
                usage_count=template.usage_count,
                is_favorite=template.is_favorite,
                is_public=template.is_public,
                created_by=template.user.name if template.user else "Capora",
                created_at=template.created_at,
                updated_at=template.updated_at
            ))
        
        return TemplateListResponse(
            items=template_responses,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Failed to get templates for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve templates."
        )


@router.post("/", response_model=TemplateResponse)
async def create_template(
    template: TemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new template.
    """
    try:
        # Create template
        db_template = Template(
            user_id=current_user.id,
            title=template.title,
            content=template.content,
            tone=template.tone,
            niche=template.niche,
            platforms=template.platforms,
            is_public=template.is_public,
            usage_count=0,
            is_favorite=False
        )
        
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        
        logger.info(f"Template created by user {current_user.id}: {db_template.id}")
        
        return TemplateResponse(
            id=db_template.id,
            title=db_template.title,
            content=db_template.content,
            tone=db_template.tone,
            niche=db_template.niche,
            platforms=db_template.platforms or [],
            usage_count=db_template.usage_count,
            is_favorite=db_template.is_favorite,
            is_public=db_template.is_public,
            created_by=current_user.name,
            created_at=db_template.created_at,
            updated_at=db_template.updated_at
        )
        
    except Exception as e:
        logger.error(f"Failed to create template for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create template."
        )


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific template by ID.
    """
    try:
        template = db.query(Template).filter(
            Template.id == template_id,
            (Template.user_id == current_user.id) | (Template.is_public == True)
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found."
            )
        
        return TemplateResponse(
            id=template.id,
            title=template.title,
            content=template.content,
            tone=template.tone,
            niche=template.niche,
            platforms=template.platforms or [],
            usage_count=template.usage_count,
            is_favorite=template.is_favorite,
            is_public=template.is_public,
            created_by=template.user.name if template.user else "Capora",
            created_at=template.created_at,
            updated_at=template.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get template {template_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve template."
        )


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: str,
    template_update: TemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a template (only owner can update).
    """
    try:
        template = db.query(Template).filter(
            Template.id == template_id,
            Template.user_id == current_user.id
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or you don't have permission to edit it."
            )
        
        # Update fields
        update_data = template_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(template, field, value)
        
        template.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(template)
        
        logger.info(f"Template updated by user {current_user.id}: {template.id}")
        
        return TemplateResponse(
            id=template.id,
            title=template.title,
            content=template.content,
            tone=template.tone,
            niche=template.niche,
            platforms=template.platforms or [],
            usage_count=template.usage_count,
            is_favorite=template.is_favorite,
            is_public=template.is_public,
            created_by=current_user.name,
            created_at=template.created_at,
            updated_at=template.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update template {template_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update template."
        )


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a template (only owner can delete).
    """
    try:
        template = db.query(Template).filter(
            Template.id == template_id,
            Template.user_id == current_user.id
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or you don't have permission to delete it."
            )
        
        db.delete(template)
        db.commit()
        
        logger.info(f"Template deleted by user {current_user.id}: {template_id}")
        
        return {"message": "Template deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete template {template_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template."
        )


@router.post("/{template_id}/favorite")
async def toggle_favorite(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle favorite status of a template.
    """
    try:
        template = db.query(Template).filter(
            Template.id == template_id,
            Template.user_id == current_user.id
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or you don't have permission to modify it."
            )
        
        template.is_favorite = not template.is_favorite
        db.commit()
        
        return {
            "message": f"Template {'added to' if template.is_favorite else 'removed from'} favorites",
            "is_favorite": template.is_favorite
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle favorite for template {template_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update favorite status."
        )


@router.post("/{template_id}/use")
async def use_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Increment usage count when template is used.
    """
    try:
        template = db.query(Template).filter(
            Template.id == template_id,
            (Template.user_id == current_user.id) | (Template.is_public == True)
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found."
            )
        
        template.usage_count += 1
        db.commit()
        
        return {
            "message": "Template usage recorded",
            "usage_count": template.usage_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to record template usage {template_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record template usage."
        )


@router.get("/public/featured")
async def get_featured_templates(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get featured public templates (highest usage).
    """
    try:
        templates = db.query(Template)\
                     .filter(Template.is_public == True)\
                     .order_by(desc(Template.usage_count))\
                     .limit(limit)\
                     .all()
        
        template_responses = []
        for template in templates:
            template_responses.append(TemplateResponse(
                id=template.id,
                title=template.title,
                content=template.content,
                tone=template.tone,
                niche=template.niche,
                platforms=template.platforms or [],
                usage_count=template.usage_count,
                is_favorite=False,  # Not applicable for public view
                is_public=template.is_public,
                created_by=template.user.name if template.user else "Capora",
                created_at=template.created_at,
                updated_at=template.updated_at
            ))
        
        return {
            "templates": template_responses,
            "count": len(template_responses)
        }
        
    except Exception as e:
        logger.error(f"Failed to get featured templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve featured templates."
        ) 