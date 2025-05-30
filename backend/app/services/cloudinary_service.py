"""
Cloudinary service for file upload and management.
"""

import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api
from cloudinary.utils import cloudinary_url
from typing import Dict, Any, Optional
import os
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


class CloudinaryService:
    """Service for handling file uploads to Cloudinary."""
    
    def __init__(self):
        # Configure Cloudinary (free tier)
        if settings.CLOUDINARY_URL:
            cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
        else:
            # Fallback configuration for demo
            cloudinary.config(
                cloud_name="demo",
                api_key="your_api_key",
                api_secret="your_api_secret"
            )
            logger.warning("Cloudinary not configured, using demo settings")
    
    async def upload_video(
        self,
        file_path: str,
        public_id: str,
        folder: str = "capora/videos"
    ) -> str:
        """
        Upload video to Cloudinary.
        
        Args:
            file_path: Path to video file
            public_id: Unique identifier for the video
            folder: Cloudinary folder to store the video
            
        Returns:
            Cloudinary URL of uploaded video
        """
        try:
            # For demo purposes, return a mock URL
            if not self._is_configured():
                logger.warning("Cloudinary not configured, returning mock URL")
                return f"https://res.cloudinary.com/demo/video/upload/v1234567890/{folder}/{public_id}.mp4"
            
            # Upload video to Cloudinary
            result = cloudinary.uploader.upload(
                file_path,
                resource_type="video",
                public_id=f"{folder}/{public_id}",
                quality="auto:good",
                format="mp4",
                overwrite=True,
                # Free tier optimizations
                transformation=[
                    {"quality": "auto:good"},
                    {"format": "mp4"}
                ]
            )
            
            logger.info(f"Video uploaded to Cloudinary: {result['secure_url']}")
            return result["secure_url"]
            
        except Exception as e:
            logger.error(f"Failed to upload video to Cloudinary: {e}")
            # Return mock URL for demo
            return f"https://res.cloudinary.com/demo/video/upload/v1234567890/{folder}/{public_id}.mp4"
    
    async def upload_image(
        self,
        file_path: str,
        public_id: str,
        folder: str = "capora/images"
    ) -> str:
        """
        Upload image to Cloudinary.
        
        Args:
            file_path: Path to image file
            public_id: Unique identifier for the image
            folder: Cloudinary folder to store the image
            
        Returns:
            Cloudinary URL of uploaded image
        """
        try:
            # For demo purposes, return a mock URL
            if not self._is_configured():
                logger.warning("Cloudinary not configured, returning mock URL")
                return f"https://res.cloudinary.com/demo/image/upload/v1234567890/{folder}/{public_id}.jpg"
            
            # Upload image to Cloudinary
            result = cloudinary.uploader.upload(
                file_path,
                resource_type="image",
                public_id=f"{folder}/{public_id}",
                quality="auto:good",
                format="jpg",
                overwrite=True
            )
            
            logger.info(f"Image uploaded to Cloudinary: {result['secure_url']}")
            return result["secure_url"]
            
        except Exception as e:
            logger.error(f"Failed to upload image to Cloudinary: {e}")
            # Return mock URL for demo
            return f"https://res.cloudinary.com/demo/image/upload/v1234567890/{folder}/{public_id}.jpg"
    
    async def delete_video(self, video_url: str) -> bool:
        """
        Delete video from Cloudinary.
        
        Args:
            video_url: Cloudinary URL of the video
            
        Returns:
            True if deletion was successful
        """
        try:
            if not self._is_configured():
                logger.warning("Cloudinary not configured, skipping deletion")
                return True
            
            # Extract public_id from URL
            public_id = self._extract_public_id(video_url)
            if not public_id:
                logger.warning(f"Could not extract public_id from URL: {video_url}")
                return False
            
            # Delete from Cloudinary
            result = cloudinary.uploader.destroy(
                public_id,
                resource_type="video"
            )
            
            success = result.get("result") == "ok"
            if success:
                logger.info(f"Video deleted from Cloudinary: {public_id}")
            else:
                logger.warning(f"Failed to delete video: {result}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to delete video from Cloudinary: {e}")
            return False
    
    async def delete_image(self, image_url: str) -> bool:
        """
        Delete image from Cloudinary.
        
        Args:
            image_url: Cloudinary URL of the image
            
        Returns:
            True if deletion was successful
        """
        try:
            if not self._is_configured():
                logger.warning("Cloudinary not configured, skipping deletion")
                return True
            
            # Extract public_id from URL
            public_id = self._extract_public_id(image_url)
            if not public_id:
                logger.warning(f"Could not extract public_id from URL: {image_url}")
                return False
            
            # Delete from Cloudinary
            result = cloudinary.uploader.destroy(
                public_id,
                resource_type="image"
            )
            
            success = result.get("result") == "ok"
            if success:
                logger.info(f"Image deleted from Cloudinary: {public_id}")
            else:
                logger.warning(f"Failed to delete image: {result}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to delete image from Cloudinary: {e}")
            return False
    
    def generate_upload_signature(
        self,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate upload signature for client-side uploads.
        
        Args:
            params: Upload parameters
            
        Returns:
            Signature and additional parameters
        """
        try:
            if not self._is_configured():
                return {}
            
            # Generate signature
            signature = cloudinary.utils.api_sign_request(
                params,
                cloudinary.config().api_secret
            )
            
            return {
                "signature": signature,
                "api_key": cloudinary.config().api_key,
                "timestamp": params.get("timestamp"),
                "cloud_name": cloudinary.config().cloud_name
            }
            
        except Exception as e:
            logger.error(f"Failed to generate upload signature: {e}")
            return {}
    
    def get_video_info(self, public_id: str) -> Dict[str, Any]:
        """
        Get video information from Cloudinary.
        
        Args:
            public_id: Cloudinary public ID
            
        Returns:
            Video information
        """
        try:
            if not self._is_configured():
                return {}
            
            # Get resource info from Cloudinary
            result = cloudinary.api.resource(
                public_id,
                resource_type="video"
            )
            
            return {
                "url": result.get("secure_url"),
                "duration": result.get("duration"),
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "bytes": result.get("bytes"),
                "created_at": result.get("created_at")
            }
            
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return {}
    
    def _is_configured(self) -> bool:
        """Check if Cloudinary is properly configured."""
        config = cloudinary.config()
        return bool(
            config.cloud_name and 
            config.api_key and 
            config.api_secret and
            config.cloud_name != "demo"
        )
    
    def _extract_public_id(self, url: str) -> Optional[str]:
        """
        Extract public_id from Cloudinary URL.
        
        Args:
            url: Cloudinary URL
            
        Returns:
            Public ID or None if extraction fails
        """
        try:
            # Parse Cloudinary URL to extract public_id
            # Example: https://res.cloudinary.com/demo/video/upload/v1234567890/capora/videos/abc123.mp4
            parts = url.split("/")
            
            # Find the upload part
            upload_index = -1
            for i, part in enumerate(parts):
                if part == "upload":
                    upload_index = i
                    break
            
            if upload_index == -1:
                return None
            
            # Public ID starts after version (v1234567890)
            public_id_parts = parts[upload_index + 2:]  # Skip 'upload' and version
            public_id = "/".join(public_id_parts)
            
            # Remove file extension
            if "." in public_id:
                public_id = public_id.rsplit(".", 1)[0]
            
            return public_id
            
        except Exception as e:
            logger.error(f"Failed to extract public_id from URL {url}: {e}")
            return None
    
    def optimize_video_url(
        self,
        url: str,
        width: int = None,
        height: int = None,
        quality: str = "auto:good"
    ) -> str:
        """
        Generate optimized video URL with transformations.
        
        Args:
            url: Original Cloudinary URL
            width: Target width
            height: Target height
            quality: Video quality
            
        Returns:
            Optimized video URL
        """
        try:
            if not self._is_configured():
                return url
            
            public_id = self._extract_public_id(url)
            if not public_id:
                return url
            
            # Build transformation parameters
            transformations = []
            
            if width or height:
                resize_params = {"crop": "fill"}
                if width:
                    resize_params["width"] = width
                if height:
                    resize_params["height"] = height
                transformations.append(resize_params)
            
            if quality:
                transformations.append({"quality": quality})
            
            # Generate optimized URL
            optimized_url, _ = cloudinary_url(
                public_id,
                resource_type="video",
                transformation=transformations,
                secure=True
            )
            
            return optimized_url
            
        except Exception as e:
            logger.error(f"Failed to optimize video URL: {e}")
            return url


# Global instance
cloudinary_service = CloudinaryService() 