"""
Magetool Worker Backend - Distributed Chunk Processor
=====================================================
Deploy this on 3 HF Spaces to create a processing cluster.

Flow:
1. Main backend splits video into 3 chunks
2. Sends each chunk to a different worker
3. Workers process in parallel
4. Main backend merges results

This file is the complete HF Space worker app.
"""

import logging
import subprocess
import asyncio
import aiofiles
import time
import os
from pathlib import Path
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# ==========================================
# CONFIGURATION
# ==========================================
TEMP_DIR = Path(os.environ.get("TEMP_DIR", "/tmp/magetool-worker"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("magetool-worker")

# In-memory task tracking
tasks = {}


class TaskStatus:
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"


# ==========================================
# HELPER FUNCTIONS
# ==========================================
def run_ffmpeg(args: list, timeout: int = 600) -> tuple[bool, str]:
    """Run FFmpeg command and return success status and output"""
    try:
        result = subprocess.run(
            ["ffmpeg", "-y"] + args,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return result.returncode == 0, result.stderr
    except subprocess.TimeoutExpired:
        return False, "Processing timeout exceeded"
    except FileNotFoundError:
        return False, "FFmpeg not installed"
    except Exception as e:
        return False, str(e)


def get_video_duration(file_path: Path) -> float:
    """Get video duration in seconds using ffprobe"""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(file_path)
            ],
            capture_output=True,
            text=True,
            timeout=30
        )
        return float(result.stdout.strip())
    except Exception as e:
        logger.error(f"Failed to get video duration: {e}")
        return 0


async def save_upload_file(upload_file: UploadFile, destination: Path) -> int:
    """Save uploaded file to disk using async chunked streaming."""
    try:
        total_size = 0
        async with aiofiles.open(destination, "wb") as f:
            while chunk := await upload_file.read(1024 * 1024):  # 1MB chunks
                await f.write(chunk)
                total_size += len(chunk)
        return total_size
    finally:
        await upload_file.close()


def get_disk_free_mb() -> float:
    """Get free disk space in MB"""
    try:
        import shutil
        total, used, free = shutil.disk_usage(TEMP_DIR)
        return free / (1024 * 1024)
    except:
        return -1


# ==========================================
# BACKGROUND CLEANUP
# ==========================================
async def cleanup_old_files():
    """Periodically clean up old temporary files"""
    while True:
        try:
            await asyncio.sleep(600)  # Every 10 minutes
            if not TEMP_DIR.exists():
                continue
            
            now = time.time()
            expiry_seconds = 30 * 60  # 30 minutes
            deleted_count = 0
            
            for file_path in TEMP_DIR.glob("*"):
                if file_path.is_file():
                    file_age = now - file_path.stat().st_mtime
                    if file_age > expiry_seconds:
                        file_path.unlink()
                        deleted_count += 1
            
            if deleted_count > 0:
                logger.info(f"Cleanup: deleted {deleted_count} old files")
                
        except Exception as e:
            logger.error(f"Cleanup error: {e}")


# ==========================================
# LIFESPAN
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("🔧 Magetool Worker starting...")
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_task = asyncio.create_task(cleanup_old_files())
    logger.info("✅ Magetool Worker ready!")
    
    yield
    
    cleanup_task.cancel()
    logger.info("👋 Worker shutdown")


# ==========================================
# FASTAPI APP
# ==========================================
app = FastAPI(
    title="Magetool Worker",
    description="Distributed video chunk processor - Part of Magetool Cluster",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Allow all for worker
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


# ==========================================
# ENDPOINTS
# ==========================================
@app.get("/")
async def root():
    """Worker health check"""
    return {
        "name": "Magetool Worker",
        "status": "operational",
        "active_tasks": len([t for t in tasks.values() if t["status"] == TaskStatus.PROCESSING]),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "active_tasks": len([t for t in tasks.values() if t["status"] == TaskStatus.PROCESSING]),
        "total_tasks": len(tasks),
        "disk_free_mb": round(get_disk_free_mb(), 2),
    }


@app.post("/process-chunk")
async def process_chunk(
    file: UploadFile = File(...),
    task_id: str = Form(...),
    operation: str = Form(...),
    quality: str = Form(default="medium"),
    output_format: str = Form(default="mp4"),
):
    """
    Process a video chunk.
    
    Operations:
    - compress: Compress with CRF
    - convert: Convert format
    """
    try:
        # Save uploaded chunk
        input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
        input_path = TEMP_DIR / f"{task_id}_input.{input_ext}"
        await save_upload_file(file, input_path)
        
        # Track task
        tasks[task_id] = {
            "status": TaskStatus.PROCESSING,
            "operation": operation,
            "started_at": datetime.utcnow().isoformat(),
        }
        
        output_path = TEMP_DIR / f"{task_id}_output.{output_format}"
        
        # Build FFmpeg command
        if operation == "compress":
            crf_map = {"low": "16", "medium": "20", "high": "26"}
            crf = crf_map.get(quality, "20")
            
            ffmpeg_args = [
                "-i", str(input_path),
                "-c:v", "libx264",
                "-crf", crf,
                "-preset", "fast",
                "-c:a", "aac",
                "-b:a", "128k",
                str(output_path),
            ]
        elif operation == "convert":
            ffmpeg_args = [
                "-i", str(input_path),
                "-preset", "fast",
                str(output_path),
            ]
        else:
            raise HTTPException(status_code=400, detail=f"Unknown operation: {operation}")
        
        # Process
        success, error = run_ffmpeg(ffmpeg_args)
        
        # Cleanup input
        input_path.unlink(missing_ok=True)
        
        if not success:
            tasks[task_id]["status"] = TaskStatus.FAILED
            tasks[task_id]["error"] = error
            raise HTTPException(status_code=500, detail=f"FFmpeg error: {error}")
        
        # Update task
        tasks[task_id]["status"] = TaskStatus.COMPLETE
        tasks[task_id]["output_path"] = str(output_path)
        tasks[task_id]["output_size"] = output_path.stat().st_size
        
        return {
            "task_id": task_id,
            "status": "complete",
            "output_size": output_path.stat().st_size,
            "download_url": f"/download/{task_id}",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chunk processing failed: {e}")
        if task_id in tasks:
            tasks[task_id]["status"] = TaskStatus.FAILED
            tasks[task_id]["error"] = str(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """Get status of a chunk processing task"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]


@app.get("/download/{task_id}")
async def download_chunk(task_id: str):
    """Download processed chunk"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    if task["status"] != TaskStatus.COMPLETE:
        raise HTTPException(status_code=400, detail=f"Task not complete: {task['status']}")
    
    output_path = Path(task["output_path"])
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Output file not found")
    
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=output_path.name,
    )


# ==========================================
# RUN
# ==========================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
