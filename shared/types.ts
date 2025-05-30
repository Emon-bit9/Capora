// Shared TypeScript types for Capora application (Free Tier)

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  niche: ContentNiche;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum ContentNiche {
  FITNESS = "fitness",
  FOOD = "food",
  EDUCATION = "education",
  LIFESTYLE = "lifestyle",
  BUSINESS = "business",
  TECH = "tech",
}

// Content Types
export interface Content {
  id: string;
  userId: string;
  title: string;
  caption: string;
  hashtags: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  platforms: Platform[];
  niche: ContentNiche;
  tone: ContentTone;
  createdAt: string;
  updatedAt: string;
}

export enum ContentStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export enum Platform {
  TIKTOK = "tiktok",
  INSTAGRAM = "instagram",
  YOUTUBE_SHORTS = "youtube_shorts",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
}

export enum ContentTone {
  CASUAL = "casual",
  PROFESSIONAL = "professional",
  FUN = "fun",
  MOTIVATIONAL = "motivational",
  EDUCATIONAL = "educational",
  TRENDY = "trendy",
}

// Video Types
export interface VideoVariant {
  id: string;
  contentId: string;
  platform: Platform;
  videoUrl: string;
  width: number;
  height: number;
  duration: number;
  fileSize: number;
  format: string;
  createdAt: string;
}

export interface VideoSpecs {
  width: number;
  height: number;
  aspectRatio: string;
  maxDuration?: number;
  maxSize?: number;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  description: string;
  niche: ContentNiche;
  tone: ContentTone;
  caption: string;
  hashtags: string[];
  platforms: Platform[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface CaptionGenerationRequest {
  videoDescription: string;
  tone: ContentTone;
  niche: ContentNiche;
  includeHashtags?: boolean;
  maxLength?: number;
}

export interface CaptionGenerationResponse {
  caption: string;
  hashtags: string[];
}

export interface VideoUploadRequest {
  file: File;
  platforms: Platform[];
  title?: string;
}

export interface VideoProcessingResponse {
  contentId: string;
  originalVideoUrl: string;
  thumbnailUrl: string;
  variants: {
    [key in Platform]?: {
      videoUrl: string;
      width: number;
      height: number;
      duration: number;
      fileSize: number;
      format: string;
    };
  };
}

export interface ContentCreateRequest {
  title: string;
  caption?: string;
  hashtags?: string[];
  platforms: Platform[];
  tone: ContentTone;
  niche: ContentNiche;
  videoFile?: File;
}

export interface ContentUpdateRequest {
  title?: string;
  caption?: string;
  hashtags?: string[];
  platforms?: Platform[];
  tone?: ContentTone;
  status?: ContentStatus;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  niche: ContentNiche;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Error Types
export interface APIError {
  message: string;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter Types
export interface ContentFilters extends PaginationParams {
  status?: ContentStatus;
  platform?: Platform;
  niche?: ContentNiche;
  dateFrom?: string;
  dateTo?: string;
}

export interface TemplateFilters extends PaginationParams {
  niche?: ContentNiche;
  tone?: ContentTone;
  isPublic?: boolean;
}

// Dashboard Types (Simplified for free tier)
export interface DashboardStats {
  totalContent: number;
  publishedContent: number;
  recentContent: Content[];
}

// File Upload Types
export interface FileUploadProgress {
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  message?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Constants
export const PLATFORM_SPECS: Record<Platform, VideoSpecs> = {
  [Platform.TIKTOK]: {
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    maxDuration: 60,
    maxSize: 50 * 1024 * 1024,
  },
  [Platform.INSTAGRAM]: {
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    maxDuration: 60,
    maxSize: 50 * 1024 * 1024,
  },
  [Platform.YOUTUBE_SHORTS]: {
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    maxDuration: 60,
    maxSize: 50 * 1024 * 1024,
  },
  [Platform.FACEBOOK]: {
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    maxDuration: 120,
    maxSize: 50 * 1024 * 1024,
  },
  [Platform.TWITTER]: {
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    maxDuration: 120,
    maxSize: 50 * 1024 * 1024,
  },
};

export const CONTENT_NICHES = Object.values(ContentNiche);
export const CONTENT_TONES = Object.values(ContentTone);
export const PLATFORMS = Object.values(Platform); 