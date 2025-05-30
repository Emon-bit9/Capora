# ContentCraft - Project Overview

## Architecture Overview

ContentCraft follows a modern monorepo architecture using Turbo for build orchestration and npm workspaces for dependency management.

```
contentcraft/
├── apps/
│   ├── web/                 # Next.js 14 frontend (React, TypeScript, Tailwind)
│   └── api/                 # Express.js backend (Node.js, TypeScript)
├── packages/
│   ├── shared/              # Shared types, utilities, and validation schemas
│   ├── ui/                  # Reusable UI components
│   └── database/            # Prisma schema and database utilities
├── tools/
│   └── scripts/             # Deployment and utility scripts
└── docs/                    # Documentation
```

## Core Features Implementation

### 1. AI-Generated Captions

**Implementation**: Google Gemini API integration
- **Location**: `apps/api/src/services/ai.service.ts`
- **Features**:
  - Contextual caption generation based on video description
  - Tone adjustment (casual, professional, fun, motivational, educational, trendy)
  - Niche-specific content optimization
  - Hashtag generation and extraction
  - Content analysis for automatic niche/tone detection

**Key Components**:
```typescript
// AI Service Methods
generateCaption()      // Main caption generation
generateHashtags()     // Standalone hashtag generation
analyzeVideoContent()  // Content analysis for insights
suggestOptimalPostingTimes() // AI-powered posting recommendations
```

### 2. Video Processing & Resizing

**Implementation**: FFmpeg integration with platform-specific optimization
- **Location**: `apps/api/src/services/video.service.ts`
- **Features**:
  - Automatic resizing for TikTok (9:16), Instagram (9:16), YouTube Shorts (9:16)
  - Platform-specific quality optimization
  - Thumbnail generation
  - Video validation and compression
  - Batch processing for multiple platforms

**Platform Specifications**:
- **TikTok**: 1080x1920, max 3 mins, 500MB
- **Instagram**: 1080x1920, max 90s, 100MB
- **YouTube Shorts**: 1080x1920, max 60s, 256MB
- **Facebook**: 1280x720, max 4 mins, 1GB
- **Twitter**: 1280x720, max 140s, 512MB

### 3. Content Management

**Database Schema** (Prisma):
```prisma
model Content {
  id           String        @id @default(cuid())
  userId       String
  title        String
  caption      String        @db.Text
  hashtags     String[]
  videoUrl     String?
  thumbnailUrl String?
  status       ContentStatus @default(DRAFT)
  platforms    Platform[]
  scheduledAt  DateTime?
  publishedAt  DateTime?
  niche        ContentNiche
  tone         ContentTone
  // ... relations and timestamps
}
```

### 4. Template System

**Features**:
- Niche-specific templates (fitness, food, education, etc.)
- User-created and public templates
- Template usage analytics
- Pre-filled captions and hashtag suggestions

### 5. Analytics Dashboard

**Metrics Tracked**:
- Views, likes, comments, shares, saves
- Platform-specific performance
- Content performance over time
- Optimal posting time analysis

### 6. Scheduling System

**Implementation**:
- Cron-based job scheduling
- Platform-specific posting APIs
- Optimal time recommendations based on user data
- Timezone-aware scheduling

## Technology Stack

### Frontend (Next.js 14)
```json
{
  "framework": "Next.js 14 with App Router",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "ui-components": "Headless UI, Heroicons",
  "animations": "Framer Motion",
  "forms": "React Hook Form + Zod validation",
  "state": "Zustand",
  "data-fetching": "React Query + Axios"
}
```

### Backend (Express.js)
```json
{
  "framework": "Express.js",
  "language": "TypeScript",
  "database": "PostgreSQL with Prisma ORM",
  "authentication": "JWT + bcrypt",
  "file-storage": "Cloudinary + AWS S3",
  "video-processing": "FFmpeg",
  "ai-integration": "Google Gemini API",
  "caching": "Redis",
  "validation": "Zod"
}
```

### DevOps & Deployment
```json
{
  "monorepo": "Turbo + npm workspaces",
  "frontend-deployment": "Vercel",
  "backend-deployment": "Railway/Render",
  "database": "Supabase/Railway PostgreSQL",
  "cdn": "Cloudinary",
  "monitoring": "Built-in logging + error tracking"
}
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Content Management
- `GET /api/v1/content` - List user content
- `POST /api/v1/content` - Create new content
- `PUT /api/v1/content/:id` - Update content
- `DELETE /api/v1/content/:id` - Delete content

### AI Services
- `POST /api/v1/ai/generate-caption` - Generate AI caption
- `POST /api/v1/ai/generate-hashtags` - Generate hashtags
- `POST /api/v1/ai/analyze-content` - Analyze video content

### Video Processing
- `POST /api/v1/video/upload` - Upload video
- `POST /api/v1/video/resize` - Resize for platforms
- `GET /api/v1/video/validate/:platform` - Validate for platform

### Templates
- `GET /api/v1/templates` - List templates
- `POST /api/v1/templates` - Create template
- `GET /api/v1/templates/:niche` - Get niche-specific templates

### Analytics
- `GET /api/v1/analytics/overview` - Dashboard overview
- `GET /api/v1/analytics/content/:id` - Content-specific analytics
- `GET /api/v1/analytics/performance` - Performance metrics

## Database Schema

### Core Models
1. **User** - User accounts and preferences
2. **Content** - Main content posts
3. **VideoVariant** - Platform-specific video versions
4. **Template** - Content templates
5. **Analytics** - Performance metrics
6. **PostingSchedule** - Optimal posting times

### Relationships
- User → Content (one-to-many)
- Content → VideoVariant (one-to-many)
- Content → Analytics (one-to-many)
- User → Template (one-to-many)

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers

### Data Validation
- Zod schemas for all inputs
- File upload restrictions
- SQL injection prevention (Prisma)
- XSS protection

### File Security
- Secure file upload handling
- Virus scanning (optional)
- File type restrictions
- Size limitations

## Development Workflow

### Getting Started
1. Clone the repository
2. Run setup script: `node tools/scripts/setup.js`
3. Update environment variables
4. Start development: `npm run dev`

### Development Commands
```bash
npm run dev          # Start all services
npm run build        # Build all apps
npm run test         # Run tests
npm run lint         # Run linting
npm run db:push      # Update database schema
npm run db:migrate   # Run migrations
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# AI Services
GEMINI_API_KEY=your-key

# File Storage
CLOUDINARY_URL=cloudinary://...
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Authentication
NEXTAUTH_SECRET=your-secret
```

## Performance Optimizations

### Frontend
- Image optimization with Next.js
- Code splitting and lazy loading
- Tailwind CSS purging
- Service worker for caching

### Backend
- Redis caching for frequently accessed data
- Database query optimization
- File compression and CDN usage
- Background job processing

### Video Processing
- Async video processing
- Progressive upload with progress tracking
- Optimized FFmpeg settings
- Batch processing capabilities

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Redis session storage
- Load balancer ready

### Vertical Scaling
- Efficient database queries
- Memory usage optimization
- CPU-intensive task optimization
- Resource monitoring

## Future Enhancements

### Phase 2 Features
- Social media direct posting
- Advanced analytics with ML insights
- Team collaboration features
- White-label solutions

### Phase 3 Features
- Mobile app (React Native)
- Advanced AI features (voice-to-text, auto-editing)
- Integration marketplace
- Enterprise features

## Support & Maintenance

### Monitoring
- Application health checks
- Error tracking and logging
- Performance monitoring
- User analytics

### Backup & Recovery
- Automated database backups
- File storage redundancy
- Disaster recovery procedures
- Data retention policies 