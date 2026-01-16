"""
Security Middleware for Magetool Backend
File validation, sanitization, and security utilities
"""

import os
import re
import logging
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("magetool.security")

# ==========================================
# ALLOWED MIME TYPES BY CATEGORY
# ==========================================
ALLOWED_MIME_TYPES = {
    "image": {
        "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
        "image/tiff", "image/x-icon", "image/svg+xml", "image/heic", "image/heif"
    },
    "video": {
        "video/mp4", "video/x-matroska", "video/x-msvideo", "video/quicktime",
        "video/webm", "video/x-flv", "video/x-ms-wmv", "video/mpeg"
    },
    "audio": {
        "audio/mpeg", "audio/wav", "audio/x-wav", "audio/aac", "audio/flac",
        "audio/ogg", "audio/mp4", "audio/x-ms-wma", "audio/opus"
    },
    "document": {
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel", "text/plain", "text/csv", "text/html",
        "text/markdown", "application/json", "application/xml", "text/xml",
        "application/rtf", "application/vnd.oasis.opendocument.text"
    }
}

# ==========================================
# ALLOWED EXTENSIONS BY CATEGORY
# ==========================================
ALLOWED_EXTENSIONS = {
    "image": {"jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "tif", "ico", "svg", "heic", "heif"},
    "video": {"mp4", "mkv", "avi", "mov", "webm", "gif", "flv", "wmv", "m4v", "mpeg", "mpg"},
    "audio": {"mp3", "wav", "aac", "flac", "ogg", "m4a", "wma", "opus"},
    "document": {"pdf", "docx", "doc", "txt", "rtf", "odt", "md", "json", "csv", "xml", "xlsx", "xls", "html"}
}

# ==========================================
# FILE SIZE LIMITS (in bytes)
# ==========================================
SIZE_LIMITS = {
    "image": 50 * 1024 * 1024,      # 50 MB
    "video": 500 * 1024 * 1024,     # 500 MB
    "audio": 100 * 1024 * 1024,     # 100 MB
    "document": 50 * 1024 * 1024    # 50 MB
}


def get_file_extension(filename: str) -> str:
    """Extract and normalize file extension"""
    if not filename or "." not in filename:
        return ""
    return filename.rsplit(".", 1)[-1].lower()


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and injection attacks.
    Removes or replaces dangerous characters.
    """
    if not filename:
        return "unnamed_file"
    
    # Remove path separators and null bytes
    filename = filename.replace("/", "_").replace("\\", "_").replace("\x00", "")
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip(". ")
    
    # Remove or replace special characters (keep alphanumeric, dots, underscores, hyphens)
    filename = re.sub(r'[^\w\.\-]', '_', filename)
    
    # Prevent double extensions that could be used for attacks
    while ".." in filename:
        filename = filename.replace("..", ".")
    
    # Limit filename length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:250] + ext
    
    return filename if filename else "unnamed_file"


def validate_file_extension(filename: str, category: str) -> Tuple[bool, str]:
    """
    Validate that file extension matches allowed extensions for category.
    Returns (is_valid, error_message)
    """
    extension = get_file_extension(filename)
    
    if not extension:
        return False, "File must have an extension"
    
    allowed = ALLOWED_EXTENSIONS.get(category, set())
    
    if extension not in allowed:
        return False, f"File extension '.{extension}' is not allowed for {category}. Allowed: {', '.join(sorted(allowed))}"
    
    return True, ""


async def validate_file_size(file: UploadFile, category: str) -> Tuple[bool, str, int]:
    """
    Validate file size against category limits.
    Returns (is_valid, error_message, file_size)
    """
    # Read file to check size (we'll need to reset pointer)
    content = await file.read()
    file_size = len(content)
    await file.seek(0)  # Reset file pointer for later use
    
    limit = SIZE_LIMITS.get(category, SIZE_LIMITS["document"])
    
    if file_size > limit:
        limit_mb = limit / (1024 * 1024)
        size_mb = file_size / (1024 * 1024)
        return False, f"File size ({size_mb:.1f} MB) exceeds limit ({limit_mb:.0f} MB) for {category}", file_size
    
    if file_size == 0:
        return False, "File is empty", file_size
    
    return True, "", file_size


def detect_mime_type_from_content(content: bytes) -> Optional[str]:
    """
    Detect MIME type from file content using magic bytes.
    Falls back to None if detection fails.
    """
    try:
        import magic
        mime = magic.from_buffer(content, mime=True)
        return mime
    except Exception as e:
        logger.warning(f"MIME detection failed: {e}")
        return None


async def validate_mime_type(file: UploadFile, category: str) -> Tuple[bool, str]:
    """
    Validate MIME type matches allowed types for category.
    Uses both header Content-Type and magic byte detection.
    Returns (is_valid, error_message)
    """
    allowed = ALLOWED_MIME_TYPES.get(category, set())
    
    # Check declared content type
    declared_type = file.content_type
    
    # Read content for magic byte detection
    content = await file.read()
    await file.seek(0)  # Reset file pointer
    
    # Detect actual MIME type from content
    detected_type = detect_mime_type_from_content(content)
    
    # Accept if either matches (some browsers send incorrect types)
    if declared_type in allowed or (detected_type and detected_type in allowed):
        return True, ""
    
    # Special handling for common mismatches
    if detected_type:
        # Handle cases where detection returns slightly different type
        for allowed_type in allowed:
            if detected_type.startswith(allowed_type.split("/")[0]):
                return True, ""
    
    return False, f"Invalid file type. Detected: {detected_type or declared_type}. Allowed for {category}: {', '.join(sorted(allowed))}"


async def validate_upload_file(file: UploadFile, category: str) -> Tuple[bool, str, int]:
    """
    Comprehensive file validation combining all security checks.
    Returns (is_valid, error_message, file_size)
    """
    if not file or not file.filename:
        return False, "No file provided", 0
    
    # 1. Validate extension
    is_valid, error = validate_file_extension(file.filename, category)
    if not is_valid:
        return False, error, 0
    
    # 2. Validate file size
    is_valid, error, file_size = await validate_file_size(file, category)
    if not is_valid:
        return False, error, file_size
    
    # 3. Validate MIME type
    is_valid, error = await validate_mime_type(file, category)
    if not is_valid:
        return False, error, file_size
    
    return True, "", file_size


def validate_path_traversal(path: Path, base_dir: Path) -> bool:
    """
    Validate that a path doesn't escape the base directory.
    Prevents path traversal attacks.
    """
    try:
        # Resolve to absolute paths
        resolved_path = path.resolve()
        resolved_base = base_dir.resolve()
        
        # Check if path is within base directory
        return str(resolved_path).startswith(str(resolved_base))
    except Exception:
        return False


def sanitize_input(value: str, max_length: int = 1000) -> str:
    """
    Sanitize user input string.
    Removes null bytes and limits length.
    """
    if not value:
        return ""
    
    # Remove null bytes
    value = value.replace("\x00", "")
    
    # Limit length
    if len(value) > max_length:
        value = value[:max_length]
    
    return value


async def create_secure_file_path(
    upload_file: UploadFile, 
    dest_dir: Path, 
    category: str
) -> Tuple[Path, str]:
    """
    Create a secure file path for saving uploaded file.
    Returns (safe_path, sanitized_filename)
    """
    import uuid
    
    original_filename = upload_file.filename or "unnamed_file"
    sanitized = sanitize_filename(original_filename)
    extension = get_file_extension(sanitized)
    
    # Generate unique filename to prevent overwrites
    unique_id = str(uuid.uuid4())[:8]
    safe_filename = f"{Path(sanitized).stem}_{unique_id}.{extension}" if extension else f"{sanitized}_{unique_id}"
    
    # Ensure destination directory exists
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # Create full path and validate
    file_path = dest_dir / safe_filename
    
    if not validate_path_traversal(file_path, dest_dir):
        raise HTTPException(status_code=400, detail="Invalid file path detected")
    
    return file_path, sanitized
