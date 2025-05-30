"""
Social Media Publishing Service for posting content to various platforms.
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import aiohttp
import asyncio
from urllib.parse import urlparse
import base64

from app.core.config import settings
from app.models.content import Platform

logger = logging.getLogger(__name__)


class SocialMediaPublisher:
    """Service for publishing content to social media platforms."""
    
    def __init__(self):
        self.session = None
        self.platform_configs = {
            Platform.INSTAGRAM: {
                "base_url": "https://graph.facebook.com/v19.0",
                "required_scopes": ["instagram_basic", "pages_show_list"]
            },
            Platform.TIKTOK: {
                "base_url": "https://open-api.tiktok.com",
                "required_scopes": ["video.upload", "user.info.basic"]
            },
            Platform.YOUTUBE_SHORTS: {
                "base_url": "https://www.googleapis.com/youtube/v3",
                "required_scopes": ["https://www.googleapis.com/auth/youtube.upload"]
            },
            Platform.TWITTER: {
                "base_url": "https://api.twitter.com/2",
                "required_scopes": ["tweet.write", "users.read"]
            },
            Platform.FACEBOOK: {
                "base_url": "https://graph.facebook.com/v19.0",
                "required_scopes": ["pages_manage_posts", "pages_read_engagement"]
            }
        }
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if not self.session:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """Close HTTP session."""
        if self.session:
            await self.session.close()
    
    async def publish_content(
        self,
        platform: Platform,
        content_data: Dict[str, Any],
        user_tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Publish content to specified platform.
        
        Args:
            platform: Target platform
            content_data: Content information (caption, video_url, etc.)
            user_tokens: User's platform access tokens
            
        Returns:
            Publishing result with platform-specific data
        """
        try:
            if platform == Platform.INSTAGRAM:
                return await self._publish_to_instagram(content_data, user_tokens)
            elif platform == Platform.TIKTOK:
                return await self._publish_to_tiktok(content_data, user_tokens)
            elif platform == Platform.YOUTUBE_SHORTS:
                return await self._publish_to_youtube(content_data, user_tokens)
            elif platform == Platform.TWITTER:
                return await self._publish_to_twitter(content_data, user_tokens)
            elif platform == Platform.FACEBOOK:
                return await self._publish_to_facebook(content_data, user_tokens)
            else:
                raise ValueError(f"Unsupported platform: {platform}")
                
        except Exception as e:
            logger.error(f"Failed to publish to {platform}: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": platform.value
            }
    
    async def _publish_to_instagram(
        self,
        content_data: Dict[str, Any],
        user_tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        """Publish content to Instagram Reels."""
        try:
            session = await self._get_session()
            access_token = user_tokens.get("instagram_access_token")
            page_id = user_tokens.get("instagram_page_id")
            
            if not access_token or not page_id:
                return {
                    "success": False,
                    "error": "Missing Instagram access token or page ID",
                    "platform": "instagram"
                }
            
            # Step 1: Create media container
            container_url = f"{self.platform_configs[Platform.INSTAGRAM]['base_url']}/{page_id}/media"
            
            container_data = {
                "media_type": "REELS",
                "video_url": content_data["video_url"],
                "caption": content_data["caption"],
                "access_token": access_token
            }
            
            async with session.post(container_url, data=container_data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Instagram container creation failed: {error_text}")
                    return {
                        "success": False,
                        "error": f"Container creation failed: {error_text}",
                        "platform": "instagram"
                    }
                
                container_response = await response.json()
                container_id = container_response.get("id")
            
            # Step 2: Publish the media
            publish_url = f"{self.platform_configs[Platform.INSTAGRAM]['base_url']}/{page_id}/media_publish"
            
            publish_data = {
                "creation_id": container_id,
                "access_token": access_token
            }
            
            async with session.post(publish_url, data=publish_data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Instagram publishing failed: {error_text}")
                    return {
                        "success": False,
                        "error": f"Publishing failed: {error_text}",
                        "platform": "instagram"
                    }
                
                publish_response = await response.json()
                
                return {
                    "success": True,
                    "platform": "instagram",
                    "post_id": publish_response.get("id"),
                    "post_url": f"https://www.instagram.com/p/{publish_response.get('id')}",
                    "published_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Instagram publishing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "instagram"
            }
    
    async def _publish_to_tiktok(
        self,
        content_data: Dict[str, Any],
        user_tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        """Publish content to TikTok."""
        try:
            session = await self._get_session()
            access_token = user_tokens.get("tiktok_access_token")
            
            if not access_token:
                return {
                    "success": False,
                    "error": "Missing TikTok access token",
                    "platform": "tiktok"
                }
            
            # TikTok requires video upload first, then publish
            upload_url = f"{self.platform_configs[Platform.TIKTOK]['base_url']}/v2/post/publish/video/init/"
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            upload_data = {
                "post_info": {
                    "title": content_data["caption"][:150],  # TikTok title limit
                    "privacy_level": "PUBLIC_TO_EVERYONE",
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False,
                    "video_cover_timestamp_ms": 1000
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": content_data.get("file_size", 0),
                    "chunk_size": content_data.get("file_size", 0),
                    "total_chunk_count": 1
                }
            }
            
            async with session.post(upload_url, json=upload_data, headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"TikTok upload init failed: {error_text}")
                    return {
                        "success": False,
                        "error": f"Upload initialization failed: {error_text}",
                        "platform": "tiktok"
                    }
                
                upload_response = await response.json()
                
                return {
                    "success": True,
                    "platform": "tiktok",
                    "publish_id": upload_response.get("data", {}).get("publish_id"),
                    "upload_url": upload_response.get("data", {}).get("upload_url"),
                    "status": "pending_upload",
                    "published_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"TikTok publishing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "tiktok"
            }
    
    async def _publish_to_youtube(
        self,
        content_data: Dict[str, Any],
        user_tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        """Publish content to YouTube Shorts."""
        try:
            session = await self._get_session()
            access_token = user_tokens.get("youtube_access_token")
            
            if not access_token:
                return {
                    "success": False,
                    "error": "Missing YouTube access token",
                    "platform": "youtube_shorts"
                }
            
            # YouTube Shorts upload
            upload_url = f"{self.platform_configs[Platform.YOUTUBE_SHORTS]['base_url']}/videos"
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            video_data = {
                "snippet": {
                    "title": content_data.get("title", "YouTube Short")[:100],
                    "description": content_data["caption"][:5000],
                    "tags": content_data.get("hashtags", [])[:20],  # Max 20 tags
                    "categoryId": "22",  # People & Blogs category
                    "defaultLanguage": "en"
                },
                "status": {
                    "privacyStatus": "public",
                    "madeForKids": False,
                    "selfDeclaredMadeForKids": False
                }
            }
            
            params = {
                "part": "snippet,status",
                "uploadType": "resumable"
            }
            
            async with session.post(upload_url, json=video_data, headers=headers, params=params) as response:
                if response.status not in [200, 201]:
                    error_text = await response.text()
                    logger.error(f"YouTube upload failed: {error_text}")
                    return {
                        "success": False,
                        "error": f"Upload failed: {error_text}",
                        "platform": "youtube_shorts"
                    }
                
                upload_response = await response.json()
                
                return {
                    "success": True,
                    "platform": "youtube_shorts",
                    "video_id": upload_response.get("id"),
                    "video_url": f"https://www.youtube.com/watch?v={upload_response.get('id')}",
                    "status": "uploaded",
                    "published_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"YouTube publishing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "youtube_shorts"
            }
    
    async def _publish_to_twitter(
        self,
        content_data: Dict[str, Any],
        user_tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        """Publish content to Twitter/X."""
        try:
            session = await self._get_session()
            access_token = user_tokens.get("twitter_access_token")
            
            if not access_token:
                return {
                    "success": False,
                    "error": "Missing Twitter access token",
                    "platform": "twitter"
                }
            
            # Twitter v2 API for media upload and tweet creation
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # For video tweets, we need to upload media first
            media_upload_url = "https://upload.twitter.com/1.1/media/upload.json"
            
            # Create tweet with text (video upload is more complex)
            tweet_url = f"{self.platform_configs[Platform.TWITTER]['base_url']}/tweets"
            
            tweet_data = {
                "text": content_data["caption"][:280]  # Twitter character limit
            }
            
            async with session.post(tweet_url, json=tweet_data, headers=headers) as response:
                if response.status not in [200, 201]:
                    error_text = await response.text()
                    logger.error(f"Twitter post failed: {error_text}")
                    return {
                        "success": False,
                        "error": f"Tweet creation failed: {error_text}",
                        "platform": "twitter"
                    }
                
                tweet_response = await response.json()
                tweet_id = tweet_response.get("data", {}).get("id")
                
                return {
                    "success": True,
                    "platform": "twitter",
                    "tweet_id": tweet_id,
                    "tweet_url": f"https://twitter.com/i/web/status/{tweet_id}",
                    "published_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Twitter publishing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "twitter"
            }
    
    async def _publish_to_facebook(
        self,
        content_data: Dict[str, Any],
        user_tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        """Publish content to Facebook."""
        try:
            session = await self._get_session()
            access_token = user_tokens.get("facebook_access_token")
            page_id = user_tokens.get("facebook_page_id")
            
            if not access_token or not page_id:
                return {
                    "success": False,
                    "error": "Missing Facebook access token or page ID",
                    "platform": "facebook"
                }
            
            # Facebook video upload
            upload_url = f"{self.platform_configs[Platform.FACEBOOK]['base_url']}/{page_id}/videos"
            
            video_data = {
                "description": content_data["caption"],
                "file_url": content_data["video_url"],
                "access_token": access_token,
                "published": True
            }
            
            async with session.post(upload_url, data=video_data) as response:
                if response.status not in [200, 201]:
                    error_text = await response.text()
                    logger.error(f"Facebook upload failed: {error_text}")
                    return {
                        "success": False,
                        "error": f"Upload failed: {error_text}",
                        "platform": "facebook"
                    }
                
                upload_response = await response.json()
                
                return {
                    "success": True,
                    "platform": "facebook",
                    "post_id": upload_response.get("id"),
                    "post_url": f"https://www.facebook.com/{page_id}/videos/{upload_response.get('id')}",
                    "published_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Facebook publishing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": "facebook"
            }
    
    async def get_publishing_status(
        self,
        platform: Platform,
        post_id: str,
        user_tokens: Dict[str, str]
    ) -> Dict[str, Any]:
        """Check the status of a published post."""
        try:
            session = await self._get_session()
            
            if platform == Platform.INSTAGRAM:
                access_token = user_tokens.get("instagram_access_token")
                status_url = f"{self.platform_configs[Platform.INSTAGRAM]['base_url']}/{post_id}"
                params = {"fields": "id,media_type,permalink", "access_token": access_token}
                
            elif platform == Platform.YOUTUBE_SHORTS:
                access_token = user_tokens.get("youtube_access_token")
                status_url = f"{self.platform_configs[Platform.YOUTUBE_SHORTS]['base_url']}/videos"
                params = {"part": "status", "id": post_id}
                headers = {"Authorization": f"Bearer {access_token}"}
                
            else:
                return {"success": False, "error": "Status check not implemented for this platform"}
            
            async with session.get(status_url, params=params) as response:
                if response.status == 200:
                    status_data = await response.json()
                    return {
                        "success": True,
                        "platform": platform.value,
                        "status": "published",
                        "data": status_data
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Status check failed: {response.status}",
                        "platform": platform.value
                    }
                    
        except Exception as e:
            logger.error(f"Status check error for {platform}: {e}")
            return {
                "success": False,
                "error": str(e),
                "platform": platform.value
            }
    
    async def batch_publish(
        self,
        platforms: List[Platform],
        content_data: Dict[str, Any],
        user_tokens: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        """Publish content to multiple platforms simultaneously."""
        tasks = []
        
        for platform in platforms:
            task = self.publish_content(platform, content_data, user_tokens)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "success": False,
                    "error": str(result),
                    "platform": platforms[i].value
                })
            else:
                processed_results.append(result)
        
        return processed_results


# Global service instance
social_media_publisher = SocialMediaPublisher() 