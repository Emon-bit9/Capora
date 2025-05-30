"""
Capora FastAPI Application
Main application entry point optimized for free tier cloud deployment.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import json
import os
# import sentry_sdk
# from sentry_sdk.integrations.fastapi import FastApiIntegration
# from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.core.config import settings
from app.core.database import init_db
from app.api.auth import router as auth_router
from app.api.captions import router as captions_router
from app.api.videos import router as videos_router
from app.api.content import router as content_router
from app.api.analytics import router as analytics_router
from app.api.templates import router as templates_router
from app.api.publishing import router as publishing_router
# from app.core.exceptions import HTTPException, http_exception_handler
# from app.core.logging_config import setup_logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize logging
# setup_logging()

# Initialize Sentry for error tracking
# if settings.SENTRY_DSN:
#     sentry_sdk.init(
#         dsn=settings.SENTRY_DSN,
#         integrations=[
#             FastApiIntegration(auto_enabling=True),
#             SqlalchemyIntegration(),
#         ],
#         traces_sample_rate=0.1,
#         environment=settings.ENVIRONMENT,
#     )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    try:
        await init_db()
        
        # Create necessary directories for file storage
        directories = [
            settings.UPLOAD_DIR,
            settings.PROCESSED_DIR,
            settings.THUMBNAILS_DIR,
            os.path.join(settings.PROCESSED_DIR, "tiktok"),
            os.path.join(settings.PROCESSED_DIR, "instagram"),
            os.path.join(settings.PROCESSED_DIR, "facebook"),
            os.path.join(settings.PROCESSED_DIR, "twitter"),
            os.path.join(settings.PROCESSED_DIR, "youtube_shorts"),
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
        
        logger.info("🚀 Capora API starting up...")
    except Exception as e:
        logger.error(f"❌ Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("👋 Capora API shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Capora API",
    description="AI-Powered Social Media Content Creation SaaS - Free Tier",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# Add security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads and processed content
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

if os.path.exists(settings.PROCESSED_DIR):
    app.mount("/processed", StaticFiles(directory=settings.PROCESSED_DIR), name="processed")

if os.path.exists(settings.THUMBNAILS_DIR):
    app.mount("/thumbnails", StaticFiles(directory=settings.THUMBNAILS_DIR), name="thumbnails")


# Custom exception handlers
# @app.exception_handler(HTTPException)
# async def custom_http_exception_handler(request: Request, exc: HTTPException):
#     return await http_exception_handler(request, exc)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors gracefully."""
    errors = []
    for error in exc.errors():
        error_dict = {
            "type": error.get("type"),
            "loc": list(error.get("loc", [])),
            "msg": error.get("msg"),
        }
        # Handle input that might not be serializable
        input_value = error.get("input")
        if input_value is not None:
            try:
                json.dumps(input_value)
                error_dict["input"] = input_value
            except (TypeError, ValueError):
                error_dict["input"] = str(input_value)
        
        # Handle context that might contain non-serializable objects
        if "ctx" in error:
            try:
                json.dumps(error["ctx"])
                error_dict["ctx"] = error["ctx"]
            except (TypeError, ValueError):
                error_dict["ctx"] = str(error["ctx"])
        
        errors.append(error_dict)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors,
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Capora API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Capora API - Free Tier",
        "version": "1.0.0",
        "docs": "/docs" if settings.ENVIRONMENT != "production" else "Not available in production",
        "health": "/health",
        "features": [
            "AI-powered video caption generation",
            "Multi-platform video optimization",
            "Free tier deployment"
        ]
    }


# Include API Routes
app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

app.include_router(
    captions_router,
    prefix="/api/v1/captions",
    tags=["AI Captions"],
)

app.include_router(
    videos_router,
    prefix="/api/v1/videos",
    tags=["Video Processing"],
)

app.include_router(
    content_router,
    prefix="/api/v1/content",
    tags=["Content Management"],
)

app.include_router(
    analytics_router,
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)

app.include_router(
    templates_router,
    prefix="/api/v1/templates",
    tags=["Templates"],
)

app.include_router(
    publishing_router,
    prefix="/api/v1/publishing",
    tags=["Publishing"],
)


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.ENVIRONMENT == "development",
        log_level="info",
    ) 