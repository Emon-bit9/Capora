"""
AI service for caption generation using Google Gemini API.
"""

import google.generativeai as genai
from typing import List, Dict, Any
import logging
import json
import re

from app.core.config import settings
from app.schemas.content import CaptionGenerationRequest, CaptionGenerationResponse
from app.models.content import Platform, ContentTone, ContentNiche

logger = logging.getLogger(__name__)

# Configure Gemini API
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


class AIService:
    """Service for AI-powered content generation."""
    
    def __init__(self):
        self.model = None
        if settings.GEMINI_API_KEY:
            try:
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("✅ Gemini AI model initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini model: {e}")
    
    async def generate_caption(self, request: CaptionGenerationRequest) -> CaptionGenerationResponse:
        """
        Generate AI-powered caption for social media content.
        """
        if not self.model:
            # Fallback response if AI is not available
            return self._fallback_caption_response(request)
        
        try:
            # Build the prompt
            prompt = self._build_caption_prompt(request)
            
            # Generate content
            response = self.model.generate_content(prompt)
            
            # Parse response
            caption_data = self._parse_gemini_response(response.text, request)
            
            return CaptionGenerationResponse(
                caption=caption_data["caption"],
                hashtags=caption_data["hashtags"],
                word_count=len(caption_data["caption"].split()),
                character_count=len(caption_data["caption"]),
                estimated_engagement=caption_data["engagement"]
            )
            
        except Exception as e:
            logger.error(f"Failed to generate caption: {e}")
            return self._fallback_caption_response(request)
    
    def _build_caption_prompt(self, request: CaptionGenerationRequest) -> str:
        """Build the prompt for Gemini API."""
        
        platform_context = ""
        if request.platforms:
            platform_names = [p.value.replace("_", " ").title() for p in request.platforms]
            platform_context = f" for {', '.join(platform_names)}"
        
        tone_descriptions = {
            ContentTone.CASUAL: "casual, friendly, and conversational",
            ContentTone.PROFESSIONAL: "professional, authoritative, and polished",
            ContentTone.FUN: "fun, playful, and entertaining",
            ContentTone.MOTIVATIONAL: "motivational, inspiring, and uplifting",
            ContentTone.EDUCATIONAL: "educational, informative, and helpful",
            ContentTone.TRENDY: "trendy, modern, and social media savvy"
        }
        
        niche_context = {
            ContentNiche.FITNESS: "fitness, health, and wellness",
            ContentNiche.FOOD: "food, cooking, and culinary experiences",
            ContentNiche.EDUCATION: "education, learning, and personal development",
            ContentNiche.LIFESTYLE: "lifestyle, daily life, and personal experiences",
            ContentNiche.BUSINESS: "business, entrepreneurship, and professional growth",
            ContentNiche.TECH: "technology, innovation, and digital trends"
        }
        
        hashtag_instruction = ""
        if request.include_hashtags:
            hashtag_instruction = f"""
- Include 5-10 relevant hashtags
- Mix popular and niche-specific hashtags
- Use hashtags relevant to {niche_context.get(request.niche, 'the content')}
"""
        
        prompt = f"""
Create an engaging social media caption{platform_context} based on this content:

Content Description: {request.video_description}
Niche: {niche_context.get(request.niche, request.niche.value)}
Tone: {tone_descriptions.get(request.tone, request.tone.value)}
Max Length: {request.max_length or 2200} characters

Requirements:
- Write in a {tone_descriptions.get(request.tone, request.tone.value)} tone
- Make it engaging and likely to get high engagement
- Keep it under {request.max_length or 2200} characters
- Focus on {niche_context.get(request.niche, 'the content')} audience
{hashtag_instruction}

Response Format (JSON):
{{
    "caption": "The main caption text",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "engagement": "high|medium|low"
}}

Generate the caption now:
"""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str, request: CaptionGenerationRequest) -> Dict[str, Any]:
        """Parse Gemini API response."""
        try:
            # Try to extract JSON from the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                data = json.loads(json_str)
                
                # Validate required fields
                if "caption" in data and "hashtags" in data:
                    return {
                        "caption": data["caption"][:request.max_length or 2200],
                        "hashtags": data.get("hashtags", [])[:10],  # Limit to 10 hashtags
                        "engagement": data.get("engagement", "medium")
                    }
            
            # Fallback: treat entire response as caption
            lines = response_text.strip().split('\n')
            caption_lines = []
            hashtags = []
            
            for line in lines:
                line = line.strip()
                if line.startswith('#'):
                    # Extract hashtags
                    hashtags.extend(re.findall(r'#\w+', line))
                elif line and not line.startswith('{') and not line.startswith('}'):
                    caption_lines.append(line)
            
            caption = '\n'.join(caption_lines).strip()
            if not caption:
                caption = response_text.strip()
            
            return {
                "caption": caption[:request.max_length or 2200],
                "hashtags": list(set(hashtags))[:10],
                "engagement": "medium"
            }
            
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            return self._get_fallback_data(request)
    
    def _fallback_caption_response(self, request: CaptionGenerationRequest) -> CaptionGenerationResponse:
        """Generate fallback response when AI is not available."""
        fallback_data = self._get_fallback_data(request)
        
        return CaptionGenerationResponse(
            caption=fallback_data["caption"],
            hashtags=fallback_data["hashtags"],
            word_count=len(fallback_data["caption"].split()),
            character_count=len(fallback_data["caption"]),
            estimated_engagement="medium"
        )
    
    def _get_fallback_data(self, request: CaptionGenerationRequest) -> Dict[str, Any]:
        """Get fallback caption and hashtags."""
        
        tone_templates = {
            ContentTone.CASUAL: "Just sharing this amazing moment! {description} What do you think?",
            ContentTone.PROFESSIONAL: "Excited to share: {description}. Looking forward to your thoughts and feedback.",
            ContentTone.FUN: "This is SO cool! {description} Who else loves this? 🔥",
            ContentTone.MOTIVATIONAL: "Remember: {description}. You've got this! Keep pushing forward! 💪",
            ContentTone.EDUCATIONAL: "Here's something interesting: {description}. Hope this helps you learn something new!",
            ContentTone.TRENDY: "Okay but like... {description} This is everything! ✨"
        }
        
        niche_hashtags = {
            ContentNiche.FITNESS: ["#fitness", "#workout", "#health", "#motivation", "#fitlife"],
            ContentNiche.FOOD: ["#food", "#foodie", "#cooking", "#recipe", "#delicious"],
            ContentNiche.EDUCATION: ["#education", "#learning", "#knowledge", "#skills", "#growth"],
            ContentNiche.LIFESTYLE: ["#lifestyle", "#life", "#daily", "#inspiration", "#vibes"],
            ContentNiche.BUSINESS: ["#business", "#entrepreneur", "#success", "#hustle", "#growth"],
            ContentNiche.TECH: ["#tech", "#technology", "#innovation", "#digital", "#future"]
        }
        
        caption_template = tone_templates.get(request.tone, tone_templates[ContentTone.CASUAL])
        caption = caption_template.format(description=request.video_description)
        
        base_hashtags = niche_hashtags.get(request.niche, ["#content", "#create", "#share"])
        common_hashtags = ["#viral", "#trending", "#follow", "#like", "#share"]
        
        hashtags = base_hashtags + common_hashtags[:3]
        
        return {
            "caption": caption,
            "hashtags": hashtags,
            "engagement": "medium"
        }


# Global AI service instance
ai_service = AIService() 