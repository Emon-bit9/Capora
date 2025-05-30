# ContentCraft - Complete Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Core Features](#core-features)
4. [Database Design](#database-design)
5. [API Specifications](#api-specifications)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Development Workflow](#development-workflow)
9. [Deployment Guide](#deployment-guide)
10. [Security Implementation](#security-implementation)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Overview
ContentCraft is a modern SaaS platform built with a microservices architecture using Next.js for the frontend and FastAPI for the backend. The system is designed to be scalable, maintainable, and cost-effective using free-tier services.

### Architecture Diagram
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Next.js       │◄──►│   FastAPI        │◄──►│   PostgreSQL    │
│   Frontend      │    │   Backend        │    │   Database      │
│   (Vercel)      │    │   (Railway)      │    │   (Railway)     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Cloudinary    │    │   Google Gemini  │    │   Redis Cache   │
│   (File Storage)│    │   (AI Service)   │    │   (Railway)     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Interaction**: User interacts with Next.js frontend
2. **API Communication**: Frontend communicates with FastAPI backend
3. **AI Processing**: Backend processes AI requests via Gemini API
4. **Data Storage**: User data stored in PostgreSQL, media in Cloudinary
5. **Caching**: Frequently accessed data cached in Redis
6. **Response**: Processed data returned to frontend for display

---

## Technology Stack

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for global state, React Query for server state
- **Forms**: React Hook Form with Zod validation
- **File Upload**: React Dropzone
- **Video Player**: React Player
- **Animation**: Framer Motion
- **Deployment**: Vercel (Free tier)

### Backend Stack
- **Framework**: FastAPI with Python 3.9+
- **Language**: Python with type hints
- **Database ORM**: SQLAlchemy with Alembic migrations
- **Authentication**: FastAPI-Users with JWT tokens
- **API Documentation**: Automatic OpenAPI/Swagger
- **File Processing**: FFmpeg for video processing
- **AI Integration**: Google Gemini API
- **Deployment**: Railway (Free tier)

### Database & Storage
- **Primary Database**: PostgreSQL (Railway Free tier - 500MB)
- **Cache Layer**: Redis (Railway Free tier)
- **File Storage**: Cloudinary (Free tier - 25GB)
- **Session Storage**: Redis-backed sessions

### DevOps & Monitoring
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions
- **Error Tracking**: Sentry (Free tier)
- **Monitoring**: UptimeRobot (Free tier)
- **Container**: Docker for development

---

## Core Features

### 1. AI-Powered Caption Generation
**Purpose**: Generate engaging captions for social media content using AI

**Flow**:
1. User provides video description and preferences
2. System sends request to Google Gemini API
3. AI generates caption based on tone, niche, and context
4. Response includes caption text and relevant hashtags
5. User can regenerate or copy the content

**Technical Implementation**:
- `CaptionGenerator` React component handles UI
- `generate_caption` API endpoint processes requests
- Gemini API integration with prompt engineering
- Tone and niche-specific prompt templates

### 2. Video Processing & Resizing
**Purpose**: Automatically resize videos for different social media platforms

**Flow**:
1. User uploads video file via drag-and-drop interface
2. Frontend uploads to temporary storage
3. Backend processes video with FFmpeg
4. Multiple platform-specific versions generated
5. Processed videos stored in Cloudinary
6. Download links provided to user

**Platform Specifications**:
- **TikTok**: 1080x1920 (9:16), max 3 minutes
- **Instagram Reels**: 1080x1920 (9:16), max 90 seconds
- **YouTube Shorts**: 1080x1920 (9:16), max 60 seconds
- **Facebook**: 1280x720 (16:9), max 4 minutes
- **Twitter**: 1280x720 (16:9), max 2:20 minutes

### 3. Content Templates System
**Purpose**: Provide pre-made templates for different content niches

**Features**:
- Niche-specific templates (fitness, food, education, etc.)
- Customizable template library
- Community-shared templates
- Template performance analytics

### 4. Optimal Posting Time Recommendations
**Purpose**: Suggest best times to post based on audience engagement

**Algorithm**:
1. Analyze historical post performance data
2. Consider platform-specific peak times
3. Factor in user's audience timezone
4. Provide personalized recommendations
5. Track recommendation effectiveness

### 5. Analytics Dashboard
**Purpose**: Provide insights into content performance

**Metrics Tracked**:
- Views, likes, comments, shares per post
- Engagement rate calculations
- Platform performance comparison
- Best performing content identification
- Growth trends over time

---

## Database Design

### Core Entities

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    niche VARCHAR(50) NOT NULL,
    subscription_plan VARCHAR(20) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Content Table
```sql
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    hashtags TEXT[],
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft',
    platforms TEXT[],
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    niche VARCHAR(50),
    tone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Video Variants Table
```sql
CREATE TABLE video_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    duration INTEGER,
    file_size BIGINT,
    format VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Analytics Table
```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Templates Table
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    niche VARCHAR(50) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    caption TEXT NOT NULL,
    hashtags TEXT[],
    platforms TEXT[],
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships
- **One-to-Many**: User → Content, Content → VideoVariants, Content → Analytics
- **Many-to-Many**: Content ↔ Platforms (via array field)
- **Optional One-to-Many**: User → Templates (user can be null for system templates)

---

## API Specifications

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user account.

**Request Body**:
```json
{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe",
    "niche": "fitness"
}
```

**Response**:
```json
{
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "niche": "fitness"
    },
    "token": "jwt_token",
    "refresh_token": "refresh_token"
}
```

#### POST /api/v1/auth/login
Authenticate user and return tokens.

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

### Content Management Endpoints

#### POST /api/v1/captions/generate
Generate AI caption for content.

**Request Body**:
```json
{
    "video_description": "Workout routine video",
    "tone": "motivational",
    "niche": "fitness",
    "include_hashtags": true,
    "max_length": 300
}
```

**Response**:
```json
{
    "caption": "Generated caption text...",
    "hashtags": ["#fitness", "#workout", "#motivation"]
}
```

#### POST /api/v1/videos/upload
Upload and process video file.

#### GET /api/v1/content
List user's content with pagination and filters.

#### POST /api/v1/content
Create new content item.

#### PUT /api/v1/content/{id}
Update existing content.

#### DELETE /api/v1/content/{id}
Delete content item.

### Analytics Endpoints

#### GET /api/v1/analytics/overview
Get analytics overview for user.

#### GET /api/v1/analytics/content/{id}
Get detailed analytics for specific content.

#### POST /api/v1/analytics/track
Track content performance data.

---

## Frontend Architecture

### Component Structure
```
components/
├── ui/                     # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
├── layout/                 # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── features/              # Feature-specific components
│   ├── auth/
│   ├── dashboard/
│   ├── caption-generator/
│   ├── video-processor/
│   └── analytics/
└── common/               # Common components
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── ...
```

### State Management

#### Global State (Zustand)
```typescript
interface AppState {
    user: User | null;
    theme: 'light' | 'dark';
    isLoading: boolean;
    setUser: (user: User) => void;
    toggleTheme: () => void;
    setLoading: (loading: boolean) => void;
}
```

#### Server State (React Query)
- Content data fetching and caching
- Optimistic updates for better UX
- Background data synchronization
- Error handling and retry logic

### Routing Structure
```
pages/
├── index.tsx              # Landing page
├── auth/
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── dashboard/
│   ├── index.tsx          # Dashboard overview
│   ├── content/
│   ├── analytics/
│   └── settings/
├── tools/
│   ├── caption-generator.tsx
│   ├── video-resizer.tsx
│   └── templates.tsx
└── api/                   # API routes (if needed)
```

---

## Backend Architecture

### Project Structure
```
backend/
├── app/
│   ├── main.py            # FastAPI application
│   ├── core/
│   │   ├── config.py      # Configuration
│   │   ├── database.py    # Database connection
│   │   └── security.py    # Authentication
│   ├── api/
│   │   ├── auth.py        # Auth endpoints
│   │   ├── content.py     # Content endpoints
│   │   ├── captions.py    # AI caption endpoints
│   │   └── analytics.py   # Analytics endpoints
│   ├── models/
│   │   ├── user.py        # User models
│   │   ├── content.py     # Content models
│   │   └── analytics.py   # Analytics models
│   ├── services/
│   │   ├── ai_service.py  # AI integration
│   │   ├── video_service.py # Video processing
│   │   └── auth_service.py  # Authentication logic
│   └── utils/
│       ├── validators.py  # Input validation
│       └── helpers.py     # Utility functions
├── alembic/               # Database migrations
├── tests/                 # Test files
└── requirements.txt       # Dependencies
```

### Service Layer Pattern
Each major feature has a dedicated service class:

```python
class CaptionService:
    def __init__(self, ai_client: GeminiClient):
        self.ai_client = ai_client
    
    async def generate_caption(
        self, 
        description: str, 
        tone: str, 
        niche: str
    ) -> CaptionResponse:
        # Business logic here
        pass
```

### Dependency Injection
FastAPI's dependency injection system is used for:
- Database session management
- Authentication verification
- Service instantiation
- Configuration injection

---

## Development Workflow

### Local Development Setup
1. **Environment Setup**:
   ```bash
   git clone <repository>
   cp env.example .env
   # Edit .env with local configuration
   ```

2. **Database Setup**:
   ```bash
   docker-compose up -d postgres redis
   cd backend
   alembic upgrade head
   ```

3. **Backend Development**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Code Standards
- **TypeScript**: Strict mode enabled, no implicit any
- **Python**: Type hints required, follow PEP 8
- **Components**: Functional components with TypeScript interfaces
- **API**: RESTful design with OpenAPI documentation
- **Git**: Conventional commits, feature branch workflow

### Testing Strategy
- **Frontend**: Jest + React Testing Library
- **Backend**: Pytest with async support
- **E2E**: Playwright for critical user flows
- **API**: Automated API testing with Postman/Newman

### Code Review Process
1. Create feature branch from main
2. Implement feature with tests
3. Create pull request with description
4. Code review by team member
5. Merge after approval and CI passing

---

## Deployment Guide

### Production Environment Setup

#### Frontend (Vercel)
1. **Repository Connection**:
   - Connect GitHub repository to Vercel
   - Enable automatic deployments

2. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   ```

3. **Build Configuration**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs"
   }
   ```

#### Backend (Railway)
1. **Project Setup**:
   - Create new Railway project
   - Connect GitHub repository
   - Add PostgreSQL and Redis services

2. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://... (auto-generated)
   REDIS_URL=redis://... (auto-generated)
   SECRET_KEY=your-production-secret
   GEMINI_API_KEY=your-gemini-key
   CLOUDINARY_URL=your-cloudinary-url
   ```

3. **Build Configuration**:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

#### Database Migrations
```bash
# Run in Railway terminal or local environment
alembic upgrade head
```

### Monitoring Setup

#### Error Tracking (Sentry)
1. Create Sentry project
2. Add DSN to environment variables
3. Configure error boundaries in React
4. Set up FastAPI integration

#### Uptime Monitoring (UptimeRobot)
1. Create monitors for frontend and backend
2. Set up email alerts
3. Configure status page

### Backup Strategy
- **Database**: Railway automated backups
- **Code**: GitHub repository
- **Media Files**: Cloudinary automatic storage
- **Configuration**: Environment variables documented

---

## Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Long-lived tokens for session renewal
- **Role-Based Access**: User roles and permissions
- **Password Hashing**: bcrypt for secure password storage

### Data Protection
- **Input Validation**: Pydantic models for API validation
- **SQL Injection Prevention**: SQLAlchemy ORM usage
- **XSS Protection**: React's built-in XSS protection
- **CORS Configuration**: Properly configured origins

### API Security
- **Rate Limiting**: Prevent API abuse
- **Request Size Limits**: Prevent large payload attacks
- **HTTPS Only**: Force secure connections in production
- **Security Headers**: CSP, HSTS, etc.

### File Upload Security
- **File Type Validation**: Whitelist allowed file types
- **Size Limits**: Prevent large file uploads
- **Virus Scanning**: Integration with cloud scanning services
- **Secure Storage**: Cloudinary with access controls

---

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Static Generation**: ISR for better performance
- **Bundle Analysis**: Regular bundle size monitoring

### Backend Optimization
- **Database Indexing**: Proper indexes on query columns
- **Connection Pooling**: SQLAlchemy connection pools
- **Caching Strategy**: Redis for frequently accessed data
- **Background Tasks**: Celery for long-running operations

### CDN & Caching
- **Static Assets**: Vercel CDN for frontend assets
- **Media Files**: Cloudinary CDN for images/videos
- **API Responses**: HTTP caching headers
- **Database Queries**: Query result caching

---

## Troubleshooting

### Common Issues

#### Database Connection Issues
**Problem**: Cannot connect to PostgreSQL
**Solution**:
1. Check environment variables
2. Verify Railway service status
3. Check firewall settings
4. Test connection string manually

#### AI API Rate Limits
**Problem**: Gemini API rate limit exceeded
**Solution**:
1. Implement request queuing
2. Add exponential backoff
3. Consider API key rotation
4. Monitor usage in Google AI Studio

#### File Upload Failures
**Problem**: Video upload fails
**Solution**:
1. Check file size limits
2. Verify Cloudinary configuration
3. Check network connectivity
4. Validate file format

#### Build Failures
**Problem**: Deployment build fails
**Solution**:
1. Check build logs
2. Verify environment variables
3. Test build locally
4. Check dependency versions

### Logging & Debugging
- **Frontend**: Browser dev tools, Vercel logs
- **Backend**: Railway logs, Sentry error tracking
- **Database**: Railway dashboard, query logs
- **Performance**: Lighthouse, Web Vitals

### Support Resources
- **Documentation**: This file and README
- **Community**: GitHub Discussions
- **Issues**: GitHub Issues tracker
- **Monitoring**: Railway and Vercel dashboards

---

## Conclusion

This documentation provides a comprehensive overview of the ContentCraft application. For specific implementation details, refer to the code comments and additional documentation in the repository.

**Key Takeaways**:
- Modern, scalable architecture using free services
- Type-safe implementation with TypeScript/Python
- Comprehensive testing and monitoring setup
- Security-first approach to data handling
- Performance-optimized for user experience

**Next Steps**:
1. Review this documentation thoroughly
2. Set up local development environment
3. Implement core features following the patterns described
4. Deploy to production using the free tier services
5. Monitor and optimize based on user feedback 