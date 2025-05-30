import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from '@contentcraft/shared';

interface VideoSpecs {
  width: number;
  height: number;
  aspectRatio: string;
  maxDuration?: number;
  maxSize?: number; // in MB
}

const PLATFORM_SPECS: Record<Platform, VideoSpecs> = {
  [Platform.TIKTOK]: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    maxDuration: 180, // 3 minutes
    maxSize: 500, // 500MB
  },
  [Platform.INSTAGRAM]: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    maxDuration: 90, // 90 seconds for reels
    maxSize: 100, // 100MB
  },
  [Platform.YOUTUBE_SHORTS]: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    maxDuration: 60, // 60 seconds
    maxSize: 256, // 256MB
  },
  [Platform.FACEBOOK]: {
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    maxDuration: 240, // 4 minutes
    maxSize: 1024, // 1GB
  },
  [Platform.TWITTER]: {
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    maxDuration: 140, // 2 minutes 20 seconds
    maxSize: 512, // 512MB
  },
};

class VideoService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  async resizeVideoForPlatform(
    inputPath: string,
    platform: Platform,
    outputDir?: string
  ): Promise<{
    outputPath: string;
    width: number;
    height: number;
    duration: number;
    fileSize: number;
    format: string;
  }> {
    const specs = PLATFORM_SPECS[platform];
    const outputPath = path.join(
      outputDir || this.tempDir,
      `${uuidv4()}_${platform.toLowerCase()}.mp4`
    );

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(`${specs.width}x${specs.height}`)
        .aspect(specs.aspectRatio)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .outputOptions([
          '-movflags +faststart', // Enable fast start for web streaming
          '-preset fast', // Encoding speed preset
          '-crf 23', // Quality setting (lower = better quality)
        ])
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            const metadata = await this.getVideoMetadata(outputPath);
            
            resolve({
              outputPath,
              width: specs.width,
              height: specs.height,
              duration: metadata.duration,
              fileSize: stats.size,
              format: 'mp4',
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(new Error(`Video processing failed: ${error.message}`));
        })
        .save(outputPath);
    });
  }

  async resizeVideoForAllPlatforms(
    inputPath: string,
    platforms: Platform[],
    outputDir?: string
  ): Promise<{
    [key in Platform]?: {
      outputPath: string;
      width: number;
      height: number;
      duration: number;
      fileSize: number;
      format: string;
    };
  }> {
    const results: {
      [key in Platform]?: {
        outputPath: string;
        width: number;
        height: number;
        duration: number;
        fileSize: number;
        format: string;
      };
    } = {};

    const resizePromises = platforms.map(async (platform) => {
      try {
        const result = await this.resizeVideoForPlatform(inputPath, platform, outputDir);
        results[platform] = result;
      } catch (error) {
        console.error(`Failed to resize video for ${platform}:`, error);
        // Continue with other platforms even if one fails
      }
    });

    await Promise.all(resizePromises);
    return results;
  }

  async generateThumbnail(
    videoPath: string,
    outputDir?: string,
    timeOffset = '00:00:01'
  ): Promise<string> {
    const thumbnailPath = path.join(
      outputDir || this.tempDir,
      `${uuidv4()}_thumbnail.jpg`
    );

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timeOffset)
        .frames(1)
        .output(thumbnailPath)
        .on('end', () => resolve(thumbnailPath))
        .on('error', (error) => {
          reject(new Error(`Thumbnail generation failed: ${error.message}`));
        })
        .run();
    });
  }

  async getVideoMetadata(videoPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    format: string;
    bitrate: number;
    frameRate: number;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          reject(new Error(`Failed to get video metadata: ${error.message}`));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || 'unknown',
          bitrate: parseInt(metadata.format.bit_rate || '0'),
          frameRate: this.parseFrameRate(videoStream.r_frame_rate || '0'),
        });
      });
    });
  }

  async validateVideoForPlatform(
    videoPath: string,
    platform: Platform
  ): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const specs = PLATFORM_SPECS[platform];
    const metadata = await this.getVideoMetadata(videoPath);
    const stats = await fs.stat(videoPath);
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check duration
    if (specs.maxDuration && metadata.duration > specs.maxDuration) {
      issues.push(`Video duration (${metadata.duration}s) exceeds ${platform} limit (${specs.maxDuration}s)`);
      recommendations.push(`Trim video to ${specs.maxDuration} seconds or less`);
    }

    // Check file size
    const fileSizeMB = stats.size / (1024 * 1024);
    if (specs.maxSize && fileSizeMB > specs.maxSize) {
      issues.push(`File size (${fileSizeMB.toFixed(2)}MB) exceeds ${platform} limit (${specs.maxSize}MB)`);
      recommendations.push('Compress video or reduce quality');
    }

    // Check aspect ratio
    const videoAspectRatio = metadata.width / metadata.height;
    const specAspectRatio = specs.width / specs.height;
    const aspectRatioTolerance = 0.1;

    if (Math.abs(videoAspectRatio - specAspectRatio) > aspectRatioTolerance) {
      issues.push(`Aspect ratio mismatch. Current: ${videoAspectRatio.toFixed(2)}, Expected: ${specAspectRatio.toFixed(2)}`);
      recommendations.push(`Resize video to ${specs.aspectRatio} aspect ratio`);
    }

    // Check resolution
    if (metadata.width !== specs.width || metadata.height !== specs.height) {
      recommendations.push(`Optimal resolution for ${platform}: ${specs.width}x${specs.height}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  async compressVideo(
    inputPath: string,
    targetSizeMB: number,
    outputDir?: string
  ): Promise<string> {
    const outputPath = path.join(
      outputDir || this.tempDir,
      `${uuidv4()}_compressed.mp4`
    );

    // Calculate target bitrate based on video duration and target size
    const metadata = await this.getVideoMetadata(inputPath);
    const targetBitrate = Math.floor((targetSizeMB * 8 * 1024) / metadata.duration); // kbps

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoBitrate(targetBitrate)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .outputOptions([
          '-movflags +faststart',
          '-preset medium',
          '-crf 28', // Higher CRF for more compression
        ])
        .on('end', () => resolve(outputPath))
        .on('error', (error) => {
          reject(new Error(`Video compression failed: ${error.message}`));
        })
        .save(outputPath);
    });
  }

  async cleanupTempFiles(filePaths: string[]): Promise<void> {
    const cleanupPromises = filePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${filePath}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
  }

  private parseFrameRate(frameRateString: string): number {
    const parts = frameRateString.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(frameRateString) || 0;
  }

  getPlatformSpecs(platform: Platform): VideoSpecs {
    return PLATFORM_SPECS[platform];
  }

  getAllPlatformSpecs(): Record<Platform, VideoSpecs> {
    return PLATFORM_SPECS;
  }
}

export const videoService = new VideoService(); 