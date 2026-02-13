"""
Task Management Service
In-memory task tracking with status management
"""

import uuid
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from enum import Enum

from config import get_settings

settings = get_settings()


class TaskStatus(str, Enum):
    QUEUED = "queued"
    UPLOADED = "uploaded"  # File uploaded, waiting for user to start processing
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"
    CANCELLED = "cancelled"


# In-memory task storage
task_store: Dict[str, Dict[str, Any]] = {}


def create_task(original_filename: str, task_type: str) -> str:
    """Create a new task and return its ID"""
    task_id = uuid.uuid4().hex  # Full 32-char hex — impossible to brute-force
    
    task_store[task_id] = {
        "task_id": task_id,
        "status": TaskStatus.QUEUED,
        "original_filename": original_filename,
        "task_type": task_type,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "progress_percent": 0,
        "estimated_time_remaining_seconds": None,
        "output_filename": None,
        "output_path": None,
        "error_message": None,
        "file_size": None,
        # New fields for deferred processing
        "input_path": None,
        "params": {},  # Store processing parameters
    }
    
    return task_id


def get_task(task_id: str) -> Optional[Dict[str, Any]]:
    """Get task by ID"""
    return task_store.get(task_id)


def update_task(
    task_id: str,
    status: Optional[TaskStatus] = None,
    progress_percent: Optional[int] = None,
    estimated_time_remaining: Optional[int] = None,
    output_filename: Optional[str] = None,
    output_path: Optional[Path] = None,
    error_message: Optional[str] = None,
    file_size: Optional[int] = None,
    input_path: Optional[Path] = None,
    params: Optional[Dict[str, Any]] = None,
) -> bool:
    """Update task status and fields"""
    task = task_store.get(task_id)
    if not task:
        return False
    
    task["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    if status is not None:
        task["status"] = status
    if progress_percent is not None:
        task["progress_percent"] = progress_percent
    if estimated_time_remaining is not None:
        task["estimated_time_remaining_seconds"] = estimated_time_remaining
    if output_filename is not None:
        task["output_filename"] = output_filename
    if output_path is not None:
        task["output_path"] = str(output_path)
    if error_message is not None:
        task["error_message"] = error_message
    if file_size is not None:
        task["file_size"] = file_size
    if input_path is not None:
        task["input_path"] = str(input_path)
    if params is not None:
        task["params"] = params
    
    return True


def delete_task(task_id: str) -> bool:
    """Delete a task and clean up its files"""
    task = task_store.get(task_id)
    if not task:
        return False
    
    # Clean up files
    try:
        # Delete input file
        input_pattern = f"{task_id}_input.*"
        for f in settings.TEMP_DIR.glob(input_pattern):
            f.unlink()
        
        # Delete output file
        output_pattern = f"{task_id}_output.*"
        for f in settings.TEMP_DIR.glob(output_pattern):
            f.unlink()
    except Exception:
        pass
    
    # Remove from store
    del task_store[task_id]
    return True


def get_input_path(task_id: str, extension: str) -> Path:
    """Get the input file path for a task"""
    ext = extension.lstrip('.') if extension else "tmp"
    return settings.TEMP_DIR / f"{task_id}_input.{ext}"


def get_output_path(task_id: str, extension: str) -> Path:
    """Get the output file path for a task"""
    ext = extension.lstrip('.') if extension else "tmp"
    return settings.TEMP_DIR / f"{task_id}_output.{ext}"


def get_output_filename(original_filename: str, suffix: str = "", extension: Optional[str] = None) -> str:
    """
    Construct a clean output filename.
    If extension is provided, it replaces the original extension.
    Otherwise, the original extension is preserved.
    """
    path = Path(original_filename)
    stem = path.stem
    
    # If original filename has no stem (e.g. just ".ext" or empty), use "file"
    if not stem:
        stem = "file"
        
    orig_ext = path.suffix.lstrip('.')
    
    # Priority: 1. Provided extension, 2. Original extension, 3. Default "bin"
    target_ext = (extension or orig_ext or "bin").lstrip('.')
    
    if suffix:
        return f"{stem}_{suffix}.{target_ext}"
    return f"{stem}.{target_ext}"


def format_task_response(task: Dict[str, Any]) -> Dict[str, Any]:
    """Format task for API response"""
    response = {
        "task_id": task["task_id"],
        "status": task["status"],
        "original_filename": task.get("original_filename"),
        "output_filename": task.get("output_filename"),
        "progress_percent": task.get("progress_percent", 0),
        "estimated_time_remaining_seconds": task.get("estimated_time_remaining_seconds"),
        "error_message": task.get("error_message"),
        "file_size": task.get("file_size"),
    }
    
    # Add download URL if complete
    if task["status"] == TaskStatus.COMPLETE and task.get("output_path"):
        output_path = Path(task["output_path"])
        if output_path.exists():
            response["download_url"] = f"/api/download/{task['task_id']}"
    
    return response
