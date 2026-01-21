"""
Magetool Backend - FastAPI Main Application
Enterprise-grade file utility API with comprehensive security
"""

import logging
import time
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import Response

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings, Settings

# Import routers
from routes import health, image, video, audio, document, core

# Configure logging
settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("magetool")

# ==========================================
# RATE LIMITER SETUP
# ==========================================
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    storage_uri="memory://",
)


# Background cleanup task
async def cleanup_old_files():
    """Periodically clean up old temporary files"""
    while True:
        try:
            await asyncio.sleep(settings.CLEANUP_INTERVAL_MINUTES * 60)
            
            if not settings.TEMP_DIR.exists():
                continue
                
            now = time.time()
            expiry_seconds = settings.FILE_EXPIRY_MINUTES * 60
            deleted_count = 0
            freed_bytes = 0
            
            for file_path in settings.TEMP_DIR.glob("*"):
                if file_path.is_file():
                    file_age = now - file_path.stat().st_mtime
                    if file_age > expiry_seconds:
                        file_size = file_path.stat().st_size
                        file_path.unlink()
                        deleted_count += 1
                        freed_bytes += file_size
            
            if deleted_count > 0:
                logger.info(
                    f"Cleanup complete: deleted {deleted_count} files, "
                    f"freed {freed_bytes / (1024 * 1024):.2f} MB"
                )
                
        except Exception as e:
            logger.error(f"Cleanup task error: {e}")


# Background Keep-Alive Task (Self-Pinging Bot)
async def keep_alive_ping():
    """Periodically ping self to prevent sleeping"""
    if not settings.ENABLE_KEEP_ALIVE or not settings.KEEP_ALIVE_URL:
        return

    logger.info(f"🤖 Keep-Alive Bot Started! Pinging {settings.KEEP_ALIVE_URL} every {settings.KEEP_ALIVE_INTERVAL} mins")
    
    import httpx
    
    while True:
        try:
            # Sleep first (don't ping immediately on startup)
            await asyncio.sleep(settings.KEEP_ALIVE_INTERVAL * 60)
            
            async with httpx.AsyncClient() as client:
                logger.info("🤖 Keep-Alive Bot: Pinging self...")
                response = await client.get(f"{settings.KEEP_ALIVE_URL}/", timeout=10)  # Use root, /health/live may 404 on some proxies
                logger.info(f"🤖 Keep-Alive Bot: Ping status {response.status_code}")
                
        except Exception as e:
            logger.warning(f"🤖 Keep-Alive Bot Error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Magetool Backend starting...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Temp directory: {settings.TEMP_DIR.absolute()}")
    
    # Ensure temp directory exists
    settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
    
    # Start background cleanup task
    cleanup_task = asyncio.create_task(cleanup_old_files())
    
    # Start Keep-Alive Bot (if enabled)
    keep_alive_task = asyncio.create_task(keep_alive_ping())
    
    # Initialize Sentry if configured
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                integrations=[FastApiIntegration()],
                traces_sample_rate=0.1,
                environment=settings.ENVIRONMENT,
            )
            logger.info("Sentry initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Sentry: {e}")
    
    logger.info("✅ Magetool Backend ready with security enabled")
    
    yield
    
    # Shutdown
    cleanup_task.cancel()
    keep_alive_task.cancel()
    try:
        await cleanup_task
        await keep_alive_task
    except asyncio.CancelledError:
        pass
    logger.info("👋 Magetool Backend shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Magetool API",
    description="Enterprise-grade file conversion and manipulation API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ==========================================
# RATE LIMITER REGISTRATION
# ==========================================
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ==========================================
# CORS MIDDLEWARE
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.pages\.dev|https://.*\.netlify\.app|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
)


# ==========================================
# SECURITY HEADERS MIDDLEWARE
# ==========================================
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response: Response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    # response.headers["X-Frame-Options"] = "SAMEORIGIN"  # Disabled to allow HF iframe embedding
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # HSTS - only in production
    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    # Cache control for API responses
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
    
    return response


# ==========================================
# REQUEST LOGGING MIDDLEWARE
# ==========================================
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = (time.time() - start_time) * 1000  # ms
    
    # Log request (skip health checks to reduce noise)
    if not request.url.path.startswith("/health"):
        logger.info(
            f"{request.method} {request.url.path} "
            f"- {response.status_code} "
            f"- {duration:.2f}ms"
        )
    
    return response


# ==========================================
# EXCEPTION HANDLERS
# ==========================================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions - sanitize in production"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # In production, don't leak stack traces or internal details
    error_detail = str(exc) if settings.DEBUG else "An unexpected error occurred"
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "details": error_detail,
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "suggested_action": "Please try again or contact support if the issue persists",
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        },
    )


# ==========================================
# STATIC FILES & ROUTERS
# ==========================================
# Mount static files for temp directory (for downloads)
app.mount("/temp", StaticFiles(directory=str(settings.TEMP_DIR)), name="temp")

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(core.router, prefix="/api", tags=["Core"])
app.include_router(image.router, prefix="/api/image", tags=["Image"])
app.include_router(video.router, prefix="/api/video", tags=["Video"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(document.router, prefix="/api", tags=["Document"])


# ==========================================
# ROOT ENDPOINT
# ==========================================
@app.get("/")
@limiter.limit("30/minute")
async def root(request: Request):
    """API root endpoint"""
    return {
        "name": "Magetool API",
        "version": "1.0.0",
        "status": "operational",
        "security": "enabled",
        "docs": "/docs" if settings.DEBUG else None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else settings.WORKERS,
    )
