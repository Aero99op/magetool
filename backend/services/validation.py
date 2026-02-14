import magic
import logging
from pathlib import Path
from typing import Optional, List, Union
from fastapi import HTTPException
import mimetypes

logger = logging.getLogger("magetool.validation")

# Mapping of common extensions to their expected MIME types
# This helps when python-magic returns a slightly different but valid mime type
# (e.g. 'text/x-python' vs 'text/plain')
MIME_TYPE_MAPPING = {
    # Images
    "jpg": ["image/jpeg", "image/jpg"],
    "jpeg": ["image/jpeg", "image/jpg"],
    "png": ["image/png"],
    "gif": ["image/gif"],
    "webp": ["image/webp"],
    "tiff": ["image/tiff"],
    "bmp": ["image/bmp", "image/x-ms-bmp"],
    "ico": ["image/vnd.microsoft.icon", "image/x-icon"],
    "svg": ["image/svg+xml", "text/xml", "text/plain"], # SVGs are text
    "heic": ["image/heic", "application/octet-stream"], # python-magic might not fully support HEIC yet without libmagic extras
    
    # Video
    "mp4": ["video/mp4", "application/mp4"],
    "mkv": ["video/x-matroska", "application/x-matroska"],
    "avi": ["video/x-msvideo"],
    "mov": ["video/quicktime"],
    "webm": ["video/webm"],
    "flv": ["video/x-flv"],
    "wmv": ["video/x-ms-wmv"],
    
    # Audio
    "mp3": ["audio/mpeg", "audio/mp3"],
    "wav": ["audio/wav", "audio/x-wav"],
    "aac": ["audio/aac", "audio/x-aac"],
    "flac": ["audio/flac", "audio/x-flac"],
    "ogg": ["audio/ogg", "application/ogg"],
    "m4a": ["audio/mp4", "audio/x-m4a"],
    
    # Documents
    "pdf": ["application/pdf"],
    "docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip"], # docx is a zip
    "doc": ["application/msword"],
    "pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip"],
    "txt": ["text/plain"],
    "rtf": ["text/rtf"],
    "json": ["application/json", "text/plain"],
}

def validate_file_content(file_path: Path, expected_extension: str = None) -> bool:
    """
    Validate that the file content matches its extension using magic bytes.
    Raises HTTPException if validation fails.
    """
    if not file_path.exists():
        logger.error(f"Validation failed: File not found {file_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get mime type from file content
    try:
        mime = magic.Magic(mime=True)
        detected_mime = mime.from_file(str(file_path))
    except Exception as e:
        logger.error(f"Magic validation failed: {e}")
        # Fallback: if python-magic fails (e.g. missing system libs), warn but allow
        # In strict mode we might want to fail, but for now we prioritize availability
        logger.warning("Skipping magic validation due to library error")
        return True

    # If no extension provided, infer from path
    if not expected_extension:
        expected_extension = file_path.suffix.lstrip(".").lower()
    else:
        expected_extension = expected_extension.lstrip(".").lower()

    # Get allowed mime types for this extension
    allowed_mimes = MIME_TYPE_MAPPING.get(expected_extension)
    
    if not allowed_mimes:
        # Unknown extension - strictly we should perhaps fail, but let's log and allow generic ones
        # or check generic types. For safety, if we don't know the ext, we might depend on client.
        # But for 'exe', 'sh', etc we want to BLOCK.
        
        # Block dangerous types if we can't verify them
        if detected_mime in ["application/x-dosexec", "application/x-executable", "text/x-shellscript"]:
             logger.warning(f"Security blocked: Dangerous file type {detected_mime} for extension {expected_extension}")
             raise HTTPException(status_code=400, detail="Invalid file type (executable blocked)")
             
        logger.info(f"Unknown extension {expected_extension}, allowed generic pass. Detected: {detected_mime}")
        return True

    # Strict check
    if detected_mime not in allowed_mimes:
        # Special handling for ZIP-based formats (docs, apk, jar)
        if detected_mime == "application/zip" and expected_extension in ["docx", "pptx", "xlsx", "apk"]:
            return True
            
        # Special handling for text based
        if detected_mime.startswith("text/") and expected_extension in ["svg", "json", "md", "csv"]:
            return True

        logger.warning(f"Security Alert: File extension .{expected_extension} does not match content type {detected_mime}")
        raise HTTPException(
            status_code=400, 
            detail=f"Security check failed: File content ({detected_mime}) does not match extension (.{expected_extension})"
        )
    
    return True
