"""
Caption generation API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from typing import Dict, Any

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.content import CaptionGenerationRequest, CaptionGenerationResponse
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter()
ai_service = AIService()


@router.post("/generate", response_model=CaptionGenerationResponse)
async def generate_caption(
    request: CaptionGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered caption for video content.
    """
    try:
        # Check usage limits
        if not current_user.can_generate_captions():
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Caption generation limit reached. Limit: {current_user.caption_limit} per month. Upgrade to Pro for unlimited captions."
            )
        
        logger.info(f"Generating caption for user {current_user.id}")
        
        # Generate caption using AI service
        result = await ai_service.generate_caption(request)
        
        # Increment usage count
        current_user.increment_caption_usage()
        db.commit()
        
        logger.info(f"Caption generated successfully for user {current_user.id}. Usage: {current_user.captions_used_this_month}/{current_user.caption_limit}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate caption for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate caption. Please try again."
        )


@router.get("/usage")
async def get_caption_usage(
    current_user: User = Depends(get_current_user)
):
    """
    Get current caption generation usage for the user.
    """
    return {
        "captions_used_this_month": current_user.captions_used_this_month,
        "caption_limit": current_user.caption_limit,
        "can_generate": current_user.can_generate_captions(),
        "reset_date": current_user.usage_reset_date,
        "subscription_plan": current_user.subscription_plan
    }


@router.get("/templates")
async def get_caption_templates():
    """
    Get pre-built caption templates for different niches and tones.
    """
    templates = {
        "fitness": {
            "casual": [
                "Just crushed this workout! 💪 {description} Who's joining me tomorrow?",
                "Morning sweat session complete ✅ {description} #MotivationMonday",
                "That post-workout feeling hits different 🔥 {description}"
            ],
            "motivational": [
                "Your body can do it. It's your mind you have to convince! 💪 {description}",
                "Success starts with a single rep. {description} Keep pushing!",
                "Champions train when no one is watching. {description} #NeverSettle"
            ]
        },
        "food": {
            "casual": [
                "Made this today and it's absolutely delicious! 😋 {description}",
                "Weekend cooking adventures! {description} Recipe in comments 👇",
                "Simple ingredients, amazing flavors! {description}"
            ],
            "professional": [
                "Presenting today's featured dish: {description}",
                "Culinary perfection achieved with {description}",
                "Elevating home cooking with {description}"
            ]
        },
        "lifestyle": {
            "casual": [
                "Just another day in paradise! ✨ {description}",
                "Living my best life one moment at a time 🌟 {description}",
                "Simple pleasures, big smiles! {description}"
            ],
            "trendy": [
                "This is everything! ✨ {description} Living for moments like these",
                "Main character energy! 💫 {description}",
                "Plot twist: life keeps getting better! {description}"
            ]
        }
    }
    
    return {
        "templates": templates,
        "usage_tips": [
            "Replace {description} with your specific content details",
            "Adjust emojis to match your brand style",
            "Add relevant hashtags for better reach",
            "Keep platform character limits in mind"
        ]
    }


@router.post("/generate-public", response_model=CaptionGenerationResponse)
async def generate_caption_public(request: CaptionGenerationRequest):
    """
    Generate AI-powered caption without authentication (for demo/landing page).
    Limited functionality for public use.
    """
    try:
        logger.info("Public caption generation requested")
        
        # Limit request for public use
        if len(request.video_description) > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Description too long for public demo. Please limit to 500 characters."
            )
        
        # Generate caption using AI service
        response = await ai_service.generate_caption(request)
        
        logger.info("Public caption generated successfully")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate public caption: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate caption. Please try again."
        )


@router.get("/suggestions")
async def get_caption_suggestions(
    niche: str = "lifestyle",
    tone: str = "casual",
    current_user: User = Depends(get_current_user)
):
    """
    Get caption suggestions and templates.
    """
    suggestions = {
        "fitness": {
            "casual": [
                "Just crushed another workout! 💪 What's your favorite exercise?",
                "Feeling the burn and loving every second of it! Who's with me?",
                "Progress over perfection, always! Small steps lead to big changes 🔥"
            ],
            "motivational": [
                "Every rep counts. Every step matters. You're stronger than you think! 💪",
                "The only bad workout is the one that didn't happen. Keep pushing forward!",
                "Your body can do it. It's your mind you need to convince. Believe in yourself! 🌟"
            ]
        },
        "food": {
            "casual": [
                "Made this delicious meal today! Simple ingredients, amazing taste 😋",
                "Sometimes the best recipes are the simplest ones. What do you think?",
                "Cooking is my therapy. What's yours? Share in the comments! 👇"
            ],
            "professional": [
                "Presenting today's featured recipe: a perfect balance of flavors and nutrition.",
                "Elevating simple ingredients into something extraordinary. Technique matters.",
                "The art of cooking lies in understanding your ingredients. Here's how it's done."
            ]
        },
        "tech": {
            "educational": [
                "Here's a quick tip that can save you hours of work! Swipe to see the steps 👉",
                "Breaking down complex concepts into simple, actionable steps. Save this post!",
                "Technology should simplify our lives. Here's how this tool can help you."
            ],
            "trendy": [
                "This tech hack is going viral for good reason! Try it and thank me later ✨",
                "Mind = blown 🤯 Who knew technology could be this cool?",
                "The future is here and it's absolutely incredible! What do you think?"
            ]
        }
    }
    
    niche_suggestions = suggestions.get(niche, {})
    tone_suggestions = niche_suggestions.get(tone, [
        "Great content deserves a great caption! Let AI help you create something amazing.",
        "Every post tells a story. What's yours? Let's make it engaging!",
        "Consistency is key in social media. Keep creating, keep sharing!"
    ])
    
    return {
        "suggestions": tone_suggestions,
        "tips": [
            "Start with a hook to grab attention",
            "Ask questions to encourage engagement",
            "Use emojis to add personality",
            "Include a call-to-action",
            "Keep it authentic to your brand"
        ]
    }


@router.get("/trending-hashtags")
async def get_trending_hashtags(
    niche: str = "lifestyle",
    current_user: User = Depends(get_current_user)
):
    """
    Get trending hashtags for different niches.
    """
    hashtags = {
        "fitness": [
            "#fitness", "#workout", "#motivation", "#fitlife", "#health",
            "#gym", "#training", "#strength", "#cardio", "#wellness",
            "#fitfam", "#bodybuilding", "#exercise", "#healthy", "#goals"
        ],
        "food": [
            "#food", "#foodie", "#cooking", "#recipe", "#delicious",
            "#homemade", "#chef", "#kitchen", "#nutrition", "#healthy",
            "#foodstagram", "#yummy", "#tasty", "#meals", "#dinner"
        ],
        "tech": [
            "#tech", "#technology", "#innovation", "#coding", "#programming",
            "#software", "#ai", "#startup", "#developer", "#digital",
            "#future", "#gadgets", "#apps", "#data", "#automation"
        ],
        "lifestyle": [
            "#lifestyle", "#life", "#daily", "#inspiration", "#motivation",
            "#selfcare", "#mindfulness", "#positivity", "#growth", "#journey",
            "#happiness", "#balance", "#wellness", "#goals", "#dreams"
        ],
        "business": [
            "#business", "#entrepreneur", "#success", "#hustle", "#growth",
            "#leadership", "#productivity", "#marketing", "#strategy", "#innovation",
            "#networking", "#mindset", "#goals", "#startup", "#professional"
        ],
        "education": [
            "#education", "#learning", "#knowledge", "#skills", "#growth",
            "#study", "#teaching", "#training", "#development", "#wisdom",
            "#tips", "#tutorial", "#howto", "#learn", "#improve"
        ]
    }
    
    return {
        "trending": hashtags.get(niche, hashtags["lifestyle"]),
        "popularity": "high",
        "updated": "2024-01-01"
    } 