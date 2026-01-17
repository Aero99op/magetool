"""
Core API routes - Task status and file downloads
"""

import logging
from pathlib import Path
from typing import Callable, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks

from fastapi.responses import FileResponse

from services.tasks import get_task, format_task_response, TaskStatus, update_task
from config import get_settings, get_mime_type

router = APIRouter()
settings = get_settings()
logger = logging.getLogger("magetool.core")


# Processor registry - maps task_type to processing functions
# Processors are registered when routes import this module
PROCESSORS: Dict[str, Callable] = {}


def register_processor(task_type: str, processor: Callable):
    """Register a processing function for a task type"""
    PROCESSORS[task_type] = processor
    logger.debug(f"Registered processor: {task_type}")


@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """Get the status of a task"""
    task = get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return format_task_response(task)


@router.post("/start/{task_id}")
async def start_processing(task_id: str, background_tasks: BackgroundTasks):
    """Start processing for an uploaded task"""
    task = get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if task is in UPLOADED state
    if task["status"] != TaskStatus.UPLOADED:
        if task["status"] == TaskStatus.PROCESSING:
            return {"task_id": task_id, "status": "already_processing", "message": "Task is already being processed"}
        elif task["status"] == TaskStatus.COMPLETE:
            return {"task_id": task_id, "status": "complete", "message": "Task already completed"}
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot start task with status: {task['status']}"
            )
    
    task_type = task.get("task_type")
    if not task_type:
        raise HTTPException(status_code=400, detail="Task type not specified")
    
    # Get the processor for this task type
    processor = PROCESSORS.get(task_type)
    if not processor:
        raise HTTPException(
            status_code=400, 
            detail=f"No processor registered for task type: {task_type}"
        )
    
    # Get stored parameters
    input_path = task.get("input_path")
    if not input_path:
        raise HTTPException(status_code=400, detail="Input file path not found")
    
    input_path = Path(input_path)
    if not input_path.exists():
        raise HTTPException(status_code=404, detail="Input file not found")
    
    params = task.get("params", {})
    original_filename = task.get("original_filename", "file")
    
    # Start processing in background
    logger.info(f"Starting processing: {task_id} ({task_type})")
    background_tasks.add_task(processor, task_id, input_path, original_filename, **params)
    
    return {"task_id": task_id, "status": "processing", "message": "Processing started"}


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

