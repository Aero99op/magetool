"""
Distributed Video Processing Routes
====================================
These routes use the cluster orchestrator to process videos
across multiple HF Space workers for faster processing.

Only enable these routes when workers are deployed and healthy.
"""

import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks

from services.tasks import (
    create_task, update_task, get_input_path, get_output_path, TaskStatus
)
from services.cluster import get_orchestrator, is_cluster_available
from config import get_settings
from routes.core import register_processor

router = APIRouter()
settings = get_settings()
logger = logging.getLogger("magetool.distributed")


# ==========================================
# HELPER: Async file save
# ==========================================
import aiofiles

async def save_upload_file(upload_file: UploadFile, destination: Path) -> int:
    """Save uploaded file using async streaming"""
    try:
        total_size = 0
        async with aiofiles.open(destination, "wb") as f:
            while chunk := await upload_file.read(1024 * 1024):
                await f.write(chunk)
                total_size += len(chunk)
        return total_size
    finally:
        await upload_file.close()


# ==========================================
# CLUSTER STATUS ENDPOINT
# ==========================================
@router.get("/cluster/status")
async def cluster_status():
    """
    Check if the distributed processing cluster is available.
    Returns worker health status.
    """
    orchestrator = get_orchestrator()
    
    if not orchestrator.is_available():
        return {
            "available": False,
            "message": "No workers configured",
            "workers": []
        }
    
    try:
        health = await orchestrator.check_workers_health()
        healthy_count = sum(1 for v in health.values() if v)
        
        return {
            "available": healthy_count > 0,
            "total_workers": len(health),
            "healthy_workers": healthy_count,
            "workers": [
                {"url": url, "healthy": status}
                for url, status in health.items()
            ]
        }
    except Exception as e:
        logger.error(f"Cluster status check failed: {e}")
        return {
            "available": False,
            "error": str(e),
            "workers": []
        }


# ==========================================
# DISTRIBUTED VIDEO COMPRESSION
# ==========================================
async def process_distributed_compress(
    task_id: str,
    input_path: Path,
    original_filename: str,
    quality: str
):
    """Background task: Distributed video compression"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        orchestrator = get_orchestrator()
        
        # Check cluster availability
        healthy_workers = await orchestrator.get_healthy_workers()
        if not healthy_workers:
            # Fallback to single-node processing
            logger.warning("No healthy workers, falling back to local processing")
            update_task(
                task_id,
                status=TaskStatus.FAILED,
                error_message="Cluster unavailable, please use standard compression"
            )
            return
        
        update_task(task_id, progress_percent=20)
        
        # Process using cluster
        result = await orchestrator.process_distributed(
            video_path=input_path,
            operation="compress",
            quality=quality,
            output_format="mp4",
            task_id=task_id,
        )
        
        if not result.get("success"):
            raise Exception(result.get("error", "Distributed processing failed"))
        
        update_task(task_id, progress_percent=90)
        
        # Move output to expected location
        output_path = result["output_path"]
        original_stem = Path(original_filename).stem
        output_filename = f"{original_stem}_compressed.mp4"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Distributed compress complete: {task_id} using {result.get('workers_used', 0)} workers")
        
    except Exception as e:
        logger.error(f"Distributed compress failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/compress-distributed")
async def compress_video_distributed(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    quality: str = Form(default="medium"),
):
    """
    Compress video using distributed worker cluster.
    
    This splits the video into chunks, processes them in parallel
    across multiple HF Space workers, and merges the results.
    
    Use this for large videos (>100MB) for faster processing.
    """
    # Validate quality
    if quality not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=400,
            detail="Quality must be 'low', 'medium', or 'high'"
        )
    
    # Check cluster availability first
    orchestrator = get_orchestrator()
    if not orchestrator.is_available():
        raise HTTPException(
            status_code=503,
            detail="Distributed processing cluster not configured. Use /api/video/compress instead."
        )
    
    # Create task
    task_id = create_task(file.filename, "distributed_compress")
    
    # Save uploaded file
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    # Update task status
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"quality": quality}
    )
    
    return {
        "task_id": task_id,
        "message": "File uploaded, distributed processing queued",
        "workers_available": len(orchestrator.worker_urls)
    }


# ==========================================
# DISTRIBUTED VIDEO CONVERSION
# ==========================================
async def process_distributed_convert(
    task_id: str,
    input_path: Path,
    original_filename: str,
    output_format: str
):
    """Background task: Distributed video conversion"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        orchestrator = get_orchestrator()
        
        healthy_workers = await orchestrator.get_healthy_workers()
        if not healthy_workers:
            update_task(
                task_id,
                status=TaskStatus.FAILED,
                error_message="Cluster unavailable"
            )
            return
        
        update_task(task_id, progress_percent=20)
        
        result = await orchestrator.process_distributed(
            video_path=input_path,
            operation="convert",
            quality="medium",
            output_format=output_format,
            task_id=task_id,
        )
        
        if not result.get("success"):
            raise Exception(result.get("error", "Distributed processing failed"))
        
        update_task(task_id, progress_percent=90)
        
        output_path = result["output_path"]
        original_stem = Path(original_filename).stem
        output_filename = f"{original_stem}.{output_format}"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Distributed convert complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Distributed convert failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/convert-distributed")
async def convert_video_distributed(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    output_format: str = Form(...),
):
    """
    Convert video format using distributed worker cluster.
    """
    output_format = output_format.lower().lstrip(".")
    
    orchestrator = get_orchestrator()
    if not orchestrator.is_available():
        raise HTTPException(
            status_code=503,
            detail="Distributed processing cluster not configured."
        )
    
    task_id = create_task(file.filename, "distributed_convert")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"output_format": output_format}
    )
    
    return {
        "task_id": task_id,
        "message": "File uploaded, distributed processing queued"
    }


# ==========================================
# REGISTER PROCESSORS
# ==========================================
# These allow /api/start/{task_id} to trigger distributed processing

def _wrap_async_processor(async_func):
    """Wrap async processor for background task execution"""
    import asyncio
    def wrapper(*args, **kwargs):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(async_func(*args, **kwargs))
        finally:
            loop.close()
    return wrapper

register_processor("distributed_compress", _wrap_async_processor(process_distributed_compress))
register_processor("distributed_convert", _wrap_async_processor(process_distributed_convert))

