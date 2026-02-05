"""
Magetool Backend Configuration
Environment variables and application settings
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    
    # CORS - Configure via environment variable for production
    # Set CORS_ORIGINS env var as JSON array: ["https://your-app.vercel.app"]
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://magetool-one.vercel.app",
        "https://magetool-theta.vercel.app",
        "https://clever-dango-6377a7.netlify.app",  # Netlify
        "https://magetool-api.onrender.com",        # Self (Render)
        "https://magetool-new.pages.dev",           # Cloudflare Pages
        "https://magetool.pages.dev",               # Cloudflare Pages (main)
        "https://magetool.site",                    # Custom Domain
        "https://www.magetool.site",                # Custom Domain WWW
        "https://magetool.in",                      # New Custom Domain
        "https://www.magetool.in",                  # New Custom Domain WWW
        "https://*.hf.space",                       # Hugging Face Spaces (Wildcard)
        "https://spandan1234-magetool-backend-api.hf.space", # Specific HF Space
    ]
    
    # File Upload Limits (in MB)
    MAX_IMAGE_SIZE_MB: int = 50
    MAX_VIDEO_SIZE_MB: int = 500
    MAX_AUDIO_SIZE_MB: int = 100
    MAX_DOCUMENT_SIZE_MB: int = 50
    
    # Timeouts (in seconds)
    REQUEST_TIMEOUT: int = 30
    UPLOAD_TIMEOUT: int = 300
    CONVERSION_TIMEOUT: int = 600
    DOWNLOAD_TIMEOUT: int = 60
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600  # 1 hour
    
    # Temp File Storage
    TEMP_DIR: Path = Path("./temp")
    CLEANUP_INTERVAL_MINUTES: int = 10
    FILE_EXPIRY_MINUTES: int = 30
    DISK_USAGE_WARNING: int = 85  # percentage
    DISK_USAGE_CRITICAL: int = 90  # percentage
    
    # External Services (optional)
    SENTRY_DSN: str | None = None
    AI_SERVICE_URL: str | None = None
    AI_SERVICE_KEY: str | None = None
    GOOGLE_VISION_API_KEY: str | None = None  # For reverse image/video search
    
    # Keep-Alive Bot (for Northflank unlimited hours)
    ENABLE_KEEP_ALIVE: bool = False
    KEEP_ALIVE_URL: str | None = None
    KEEP_ALIVE_INTERVAL: int = 14  # minutes (Render sleeps after 15, verify for others)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure temp directory exists
        self.TEMP_DIR.mkdir(parents=True, exist_ok=True)
        
        # ----------------------------------------------------
        # Auto-Enable Keep-Alive for Unlimited Hosting (HF, Northflank)
        # ----------------------------------------------------
        
        # 1. Hugging Face Spaces Auto-Detection
        # HF sets 'SPACE_ID', 'SPACE_AUTHOR_NAME', 'SPACE_TITLE'
        if os.environ.get("SPACE_ID"):
            self.ENABLE_KEEP_ALIVE = True
            
            # Construct Self-Ping URL for HF
            # Format: https://{username}-{space_name}.hf.space
            # Note: If space is private, this might fail without auth, 
            # but for public/internal checks it's the target.
            # Newer HF spaces also provide SPACE_HOST (e.g., username-space.hf.space)
            space_host = os.environ.get("SPACE_HOST")
            if space_host:
                 self.KEEP_ALIVE_URL = f"https://{space_host}"
            elif not self.KEEP_ALIVE_URL:
                 # Fallback construction
                 author = os.environ.get("SPACE_AUTHOR_NAME")
                 title = os.environ.get("SPACE_TITLE")
                 if author and title:
                     self.KEEP_ALIVE_URL = f"https://{author}-{title}.hf.space"
            
            # HF Spaces can handle 1-2 min pings easily
            self.KEEP_ALIVE_INTERVAL = 1 
            
        # 2. Northflank Auto-Detection
        # Northflank injects specific vars like 'NF_SERVICE_ID' or we can check for custom var
        # User can also strictly force it via ENABLE_KEEP_ALIVE=true
        elif os.environ.get("NF_SERVICE_ID") or os.environ.get("NORTHFLANK_FORWARDED_PORT"):
             self.ENABLE_KEEP_ALIVE = True
             if not self.KEEP_ALIVE_URL:
                 self.KEEP_ALIVE_URL = f"http://localhost:{self.PORT}" # Self-ping on localhost often works for containers
             self.KEEP_ALIVE_INTERVAL = 5


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Supported file formats
SUPPORTED_FORMATS = {
    "image": {
        "input": ["jpg", "jpeg", "png", "webp", "heic", "heif", "tiff", "tif", "bmp", "gif", "ico", "svg"],
        "output": ["jpg", "jpeg", "png", "webp", "ico", "bmp", "gif", "tiff"],
    },
    "video": {
        "input": ["mp4", "mkv", "avi", "mov", "webm", "gif", "flv", "wmv", "m4v"],
        "output": ["mp4", "mkv", "avi", "mov", "webm", "gif"],
    },
    "audio": {
        "input": ["mp3", "wav", "aac", "flac", "ogg", "m4a", "wma", "opus"],
        "output": ["mp3", "wav", "aac", "flac", "ogg", "m4a"],
    },
    "document": {
        "input": ["pdf", "docx", "doc", "txt", "rtf", "odt", "md", "json", "csv", "xml", "xlsx", "xls", "html"],
        "output": ["pdf", "docx", "txt", "json", "csv", "xml"],
    },
}

# MIME type mappings
MIME_TYPES = {
    # Images
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "ico": "image/x-icon",
    "tiff": "image/tiff",
    "tif": "image/tiff",
    "svg": "image/svg+xml",
    "heic": "image/heic",
    "heif": "image/heif",
    # Video
    "mp4": "video/mp4",
    "mkv": "video/x-matroska",
    "avi": "video/x-msvideo",
    "mov": "video/quicktime",
    "webm": "video/webm",
    "flv": "video/x-flv",
    "wmv": "video/x-ms-wmv",
    # Audio
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "aac": "audio/aac",
    "flac": "audio/flac",
    "ogg": "audio/ogg",
    "m4a": "audio/mp4",
    "wma": "audio/x-ms-wma",
    "opus": "audio/opus",
    # Documents
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "doc": "application/msword",
    "txt": "text/plain",
    "json": "application/json",
    "csv": "text/csv",
    "xml": "application/xml",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xls": "application/vnd.ms-excel",
    "html": "text/html",
    "md": "text/markdown",
    "rtf": "application/rtf",
    "odt": "application/vnd.oasis.opendocument.text",
    # Archives
    "zip": "application/zip",
}


def get_mime_type(extension: str) -> str:
    """Get MIME type for a file extension"""
    ext = extension.lower().lstrip(".")
    return MIME_TYPES.get(ext, "application/octet-stream")


def get_extension_from_mime(mime_type: str) -> str | None:
    """Get file extension from MIME type"""
    for ext, mime in MIME_TYPES.items():
        if mime == mime_type:
            return ext
    return None
