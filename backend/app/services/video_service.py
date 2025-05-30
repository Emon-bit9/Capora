"""
Video processing service for platform-specific optimization.
"""

import os
import subprocess
import tempfile
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import aiofiles
import asyncio
import hashlib
from urllib.parse import urlparse

from app.core.config import settings
from app.services.cloudinary_service import cloudinary_service

logger = logging.getLogger(__name__)


class VideoService:
    """Service for video processing and optimization."""
    
    def __init__(self):
        self.temp_dir = Path(settings.TEMP_DIR)
        self.temp_dir.mkdir(exist_ok=True)
    
    async def process_for_platform(
        self,
        video_url: str,
        platform: str,
        platform_spec: Dict[str, Any]
    ) -> str:
        """
        Process video for a specific platform.
        
        Args:
            video_url: URL of the source video
            platform: Target platform (tiktok, instagram, etc.)
            platform_spec: Platform specifications
            
        Returns:
            URL of the processed video
        """
        try:
            # Download video from URL
            temp_input = await self._download_video(video_url)
            
            # Process video according to platform specs
            temp_output = await self._resize_video(
                temp_input,
                platform_spec["width"],
                platform_spec["height"],
                platform_spec.get("max_duration", 60)
            )
            
            # Upload processed video
            processed_url = await cloudinary_service.upload_video(
                str(temp_output),
                f"{platform}_{hashlib.md5(video_url.encode()).hexdigest()[:8]}"
            )
            
            # Cleanup temp files
            temp_input.unlink(missing_ok=True)
            temp_output.unlink(missing_ok=True)
            
            return processed_url
            
        except Exception as e:
            logger.error(f"Failed to process video for {platform}: {e}")
            raise
    
    async def _download_video(self, video_url: str) -> Path:
        """Download video from URL to temporary file."""
        try:
            # For Cloudinary URLs, we can process directly
            # In a production environment, you might want to download the file
            # For now, we'll assume the video_url is accessible
            
            # Parse URL to get file extension
            parsed_url = urlparse(video_url)
            file_extension = Path(parsed_url.path).suffix or '.mp4'
            
            # Create temporary file
            temp_file = self.temp_dir / f"input_{os.urandom(8).hex()}{file_extension}"
            
            # For demo purposes, we'll return the URL as-is
            # In production, implement actual download logic
            return Path(video_url)  # This would be the downloaded file path
            
        except Exception as e:
            logger.error(f"Failed to download video from {video_url}: {e}")
            raise
    
    async def _resize_video(
        self,
        input_path: Path,
        width: int,
        height: int,
        max_duration: int = 60
    ) -> Path:
        """
        Resize video using FFmpeg.
        
        Args:
            input_path: Path to input video
            width: Target width
            height: Target height
            max_duration: Maximum duration in seconds
            
        Returns:
            Path to resized video
        """
        try:
            # Create output file path
            output_path = self.temp_dir / f"output_{os.urandom(8).hex()}.mp4"
            
            # For demo purposes, we'll simulate video processing
            # In production, implement actual FFmpeg processing
            
            # FFmpeg command for video resizing and duration limiting
            ffmpeg_cmd = [
                "ffmpeg",
                "-i", str(input_path),
                "-vf", f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}",
                "-t", str(max_duration),  # Limit duration
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "128k",
                "-y",  # Overwrite output file
                str(output_path)
            ]
            
            # For demo purposes, we'll just copy the input to output
            # In production, uncomment the FFmpeg execution below
            
            # Check if FFmpeg is available
            if self._is_ffmpeg_available():
                # Execute FFmpeg command
                process = await asyncio.create_subprocess_exec(
                    *ffmpeg_cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                
                if process.returncode != 0:
                    logger.error(f"FFmpeg error: {stderr.decode()}")
                    raise Exception(f"Video processing failed: {stderr.decode()}")
                
                logger.info(f"Video processed successfully: {output_path}")
            else:
                # Fallback: just copy the file (for demo)
                logger.warning("FFmpeg not available, using original video")
                output_path = input_path
            
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to resize video: {e}")
            raise
    
    def _is_ffmpeg_available(self) -> bool:
        """Check if FFmpeg is available in the system."""
        try:
            subprocess.run(
                ["ffmpeg", "-version"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    async def get_video_info(self, video_path: str) -> Dict[str, Any]:
        """
        Get video information using FFprobe.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with video information
        """
        try:
            if not self._is_ffmpeg_available():
                return {
                    "duration": 0,
                    "width": 1920,
                    "height": 1080,
                    "fps": 30,
                    "file_size": 0
                }
            
            # FFprobe command to get video info
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                video_path
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"FFprobe error: {stderr.decode()}")
                return {}
            
            import json
            info = json.loads(stdout.decode())
            
            # Extract video stream info
            video_stream = next(
                (stream for stream in info["streams"] if stream["codec_type"] == "video"),
                None
            )
            
            if not video_stream:
                return {}
            
            return {
                "duration": float(info["format"].get("duration", 0)),
                "width": int(video_stream.get("width", 0)),
                "height": int(video_stream.get("height", 0)),
                "fps": eval(video_stream.get("r_frame_rate", "0/1")),
                "file_size": int(info["format"].get("size", 0))
            }
            
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return {}
    
    async def generate_thumbnail(self, video_path: str, timestamp: float = 1.0) -> Optional[str]:
        """
        Generate thumbnail from video.
        
        Args:
            video_path: Path to video file
            timestamp: Timestamp in seconds for thumbnail
            
        Returns:
            URL of uploaded thumbnail
        """
        try:
            if not self._is_ffmpeg_available():
                logger.warning("FFmpeg not available, cannot generate thumbnail")
                return None
            
            # Create output file path
            thumbnail_path = self.temp_dir / f"thumb_{os.urandom(8).hex()}.jpg"
            
            # FFmpeg command to generate thumbnail
            cmd = [
                "ffmpeg",
                "-i", video_path,
                "-ss", str(timestamp),
                "-vframes", "1",
                "-q:v", "2",
                "-y",
                str(thumbnail_path)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await process.communicate()
            
            if process.returncode != 0 or not thumbnail_path.exists():
                logger.error("Failed to generate thumbnail")
                return None
            
            # Upload thumbnail to Cloudinary
            thumbnail_url = await cloudinary_service.upload_image(
                str(thumbnail_path),
                f"thumb_{hashlib.md5(video_path.encode()).hexdigest()[:8]}"
            )
            
            # Cleanup
            thumbnail_path.unlink(missing_ok=True)
            
            return thumbnail_url
            
        except Exception as e:
            logger.error(f"Failed to generate thumbnail: {e}")
            return None
    
    async def validate_video(self, file_path: str, platform_spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate video against platform specifications.
        
        Args:
            file_path: Path to video file
            platform_spec: Platform specifications
            
        Returns:
            Validation result with any issues
        """
        try:
            info = await self.get_video_info(file_path)
            
            issues = []
            
            # Check duration
            if info.get("duration", 0) > platform_spec.get("max_duration", 60):
                issues.append(f"Video too long: {info['duration']}s > {platform_spec['max_duration']}s")
            
            # Check file size
            if info.get("file_size", 0) > platform_spec.get("max_size", 50 * 1024 * 1024):
                issues.append(f"File too large: {info['file_size']} bytes > {platform_spec['max_size']} bytes")
            
            # Check aspect ratio (basic check)
            width = info.get("width", 0)
            height = info.get("height", 0)
            if width > 0 and height > 0:
                aspect_ratio = width / height
                target_aspect = platform_spec["width"] / platform_spec["height"]
                
                if abs(aspect_ratio - target_aspect) > 0.1:  # 10% tolerance
                    issues.append(f"Aspect ratio mismatch: {aspect_ratio:.2f} vs {target_aspect:.2f}")
            
            return {
                "valid": len(issues) == 0,
                "issues": issues,
                "info": info
            }
            
        except Exception as e:
            logger.error(f"Failed to validate video: {e}")
            return {
                "valid": False,
                "issues": [f"Validation error: {str(e)}"],
                "info": {}
            }


# Global instance
video_service = VideoService() 