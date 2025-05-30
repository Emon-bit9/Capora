# Video Upload & Processing Workflow Guide

## Overview

The new Capora video workflow has been redesigned as a **4-step separated process** that gives users complete control over their content publishing journey. This replaces the previous combined upload-and-publish approach with a more flexible, review-based system.

## 🔄 New Workflow Steps

### 1. **Upload Step** 📁
- **Purpose**: Upload your video file and set basic metadata
- **Actions**: 
  - Select video file
  - Enter title and description
  - Choose target platforms
- **Backend Status**: `uploaded`
- **User Experience**: Quick upload with immediate feedback

### 2. **Process Step** ⚙️
- **Purpose**: Generate platform-specific video variants
- **Actions**:
  - Automatic processing for selected platforms
  - Platform optimization (dimensions, duration, file size)
  - Generate thumbnails and preview versions
- **Backend Status**: `processing` → `ready`
- **User Experience**: See processing progress and confirmation

### 3. **Review Step** 👀
- **Purpose**: Preview all processed videos before publishing
- **Actions**:
  - View platform-specific video variants
  - See technical specifications (resolution, file size, duration)
  - Select which platforms to publish to
  - Make final decisions
- **Backend Status**: `ready` (awaiting publish decision)
- **User Experience**: Complete control over what gets published where

### 4. **Publish Step** 🚀
- **Purpose**: Actually publish to selected social media platforms
- **Actions**:
  - Publish to chosen platforms only
  - Get confirmation and platform URLs
  - Track publishing results
- **Backend Status**: `published`
- **User Experience**: Immediate publishing with tracking links

## 🎯 Key Benefits

### For Users:
- **Control**: Review everything before publishing
- **Flexibility**: Choose different platforms after seeing results
- **Quality**: See exactly how videos will look on each platform
- **Safety**: No accidental publishing to wrong platforms
- **Transparency**: Clear status at each step

### For Developers:
- **Separation of Concerns**: Each step has distinct responsibility
- **Error Handling**: Issues can be caught and handled at each step
- **Scalability**: Each step can be optimized independently
- **Monitoring**: Clear status tracking through the pipeline

## 🔧 Technical Implementation

### Backend API Endpoints

#### Upload Video
```
POST /api/v1/videos/upload
- Uploads file and creates content record
- Status: uploaded
- Returns: content_id, video_url, thumbnail_url
```

#### Process Video
```
POST /api/v1/videos/process/{content_id}
- Generates platform-specific variants
- Status: processing → ready
- Returns: variants with specs and URLs
```

#### Get Variants (Review)
```
GET /api/v1/videos/variants/{content_id}
- Retrieves all processed variants
- Shows platform-specific details
- Returns: content info + variant array
```

#### Publish to Platforms
```
POST /api/v1/videos/publish/{content_id}
- Publishes to selected platforms
- Status: ready → published
- Returns: publishing results with platform URLs
```

### Database Schema

#### Content Table
- `status`: uploaded → processing → ready → published
- `platforms`: JSON array of target platforms
- `publish_results`: JSON object with platform responses

#### VideoVariant Table
- Platform-specific processed videos
- Technical specifications
- Processing status for each variant

## 🎨 Frontend Implementation

### Route Structure
- `/upload` - Complete workflow page
- `/dashboard` - Link to workflow + content management

### Workflow Components
- **Step Indicator**: Visual progress through 4 steps
- **Upload Form**: File selection and metadata input
- **Processing View**: Shows original video + selected platforms
- **Review Grid**: Platform variants with preview and selection
- **Publish Results**: Success confirmation with platform links

### State Management
- Step progression tracking
- Form data persistence across steps
- Error handling at each step
- Success messaging and navigation

## 📊 Platform Specifications

The system automatically optimizes videos for each platform:

### TikTok
- **Aspect Ratio**: 9:16 (vertical)
- **Resolution**: 1080x1920
- **Max Duration**: 60 seconds
- **Max File Size**: 100MB
- **Formats**: MP4, MOV

### Instagram Reels
- **Aspect Ratio**: 9:16 (vertical)
- **Resolution**: 1080x1920
- **Max Duration**: 90 seconds
- **Max File Size**: 100MB
- **Formats**: MP4, MOV

### YouTube Shorts
- **Aspect Ratio**: 9:16 (vertical)
- **Resolution**: 1080x1920
- **Max Duration**: 60 seconds
- **Max File Size**: 256MB
- **Formats**: MP4, MOV, AVI

### Facebook
- **Aspect Ratio**: 1:1 or 16:9
- **Resolution**: 1080x1080
- **Max Duration**: 240 seconds
- **Max File Size**: 200MB
- **Formats**: MP4, MOV

### Twitter
- **Aspect Ratio**: 16:9 (horizontal)
- **Resolution**: 1280x720
- **Max Duration**: 140 seconds
- **Max File Size**: 512MB
- **Formats**: MP4, MOV

## 🚀 Getting Started

### For Users:
1. Navigate to Dashboard
2. Click "Upload Workflow" tab
3. Click "Start Upload Workflow"
4. Follow the 4-step process
5. Review and publish to your chosen platforms

### For Developers:
1. Backend runs on port 8080
2. Frontend runs on port 3000
3. All endpoints are under `/api/v1/videos/`
4. Authentication required for all operations
5. Mock processing for demo purposes

## 🔍 Status Tracking

### Content Statuses:
- `uploaded`: File uploaded, ready for processing
- `processing`: Generating platform variants
- `ready`: All variants ready, awaiting publish decision
- `published`: Successfully published to platforms

### Error Handling:
- Each step validates prerequisites
- Clear error messages for each failure type
- Graceful fallbacks and retry options
- Transaction rollbacks on failures

## 🎯 Future Enhancements

### Planned Features:
- **Scheduling**: Set publish times for each platform
- **Analytics**: Track performance across platforms
- **Bulk Processing**: Process multiple videos at once
- **Custom Specs**: Override platform defaults
- **Draft Mode**: Save and resume workflows
- **Collaboration**: Team review and approval processes

### Technical Improvements:
- **Real Processing**: Replace mock processing with actual video transcoding
- **Cloud Storage**: Integration with AWS S3 or similar
- **Background Jobs**: Async processing with job queues
- **Webhooks**: Real-time platform publishing updates
- **API Rate Limiting**: Respect platform API limits
- **Caching**: Optimize variant delivery and previews

---

## 🆘 Troubleshooting

### Common Issues:

**"Content not found"**
- Ensure content_id is valid and belongs to current user

**"Content must be uploaded before processing"**
- Complete upload step first, check status is 'uploaded'

**"Content must be processed and ready before publishing"**
- Complete processing step, ensure status is 'ready'

**"Missing variants for platforms"**
- Re-run processing or select only available platforms

### Support:
- Check browser console for detailed error messages
- Verify backend is running on port 8080
- Confirm user authentication token is valid
- Review network requests in browser dev tools

---

*This workflow provides users with complete control over their content publishing journey while maintaining technical flexibility for future enhancements.* 