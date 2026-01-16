"""
Core API routes - Task status and file downloads
"""

import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from services.tasks import get_task, format_task_response, TaskStatus
from config import get_settings, get_mime_type

router = APIRouter()
settings = get_settings()
logger = logging.getLogger("magetool.core")


@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """Get the status of a task"""
    task = get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return format_task_response(task)


@router.get("/download/{task_id}")
async def download_file(task_id: str):
    """Download the output file for a completed task"""
    task = get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task["status"] != TaskStatus.COMPLETE:
        raise HTTPException(
            status_code=400,
            detail=f"Task not complete. Current status: {task['status']}"
        )
    
    output_path = task.get("output_path")
    if not output_path:
        raise HTTPException(status_code=404, detail="Output file not found")
    
    output_path = Path(output_path)
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Output file not found")
    
    # Get output filename (preserve original name + new extension)
    output_filename = task.get("output_filename")
    if not output_filename:
        # Fallback: use original name with new extension
        original = task.get("original_filename", "output")
        original_stem = Path(original).stem
        new_ext = output_path.suffix
        output_filename = f"{original_stem}{new_ext}"
    
    # Get MIME type
    extension = output_path.suffix.lstrip(".")
    media_type = get_mime_type(extension)
    
    logger.info(f"Download: {task_id} -> {output_filename} ({media_type})")
    
    return FileResponse(
        path=output_path,
        filename=output_filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{output_filename}"',
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )
