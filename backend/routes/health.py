"""
Health check endpoints for monitoring
"""

import shutil
import subprocess
from fastapi import APIRouter
from config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health/live")
async def liveness_check():
    """Liveness probe - is the service running?"""
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness_check():
    """Readiness probe - can the service handle requests?"""
    checks = {
        "api": True,
        "temp_dir": False,
        "disk_space": False,
        "ffmpeg": False,
    }
    
    # Check temp directory
    try:
        checks["temp_dir"] = settings.TEMP_DIR.exists() and settings.TEMP_DIR.is_dir()
    except Exception:
        pass
    
    # Check disk space
    try:
        total, used, free = shutil.disk_usage(settings.TEMP_DIR)
        usage_percent = (used / total) * 100
        checks["disk_space"] = usage_percent < settings.DISK_USAGE_CRITICAL
        checks["disk_usage_percent"] = round(usage_percent, 1)
    except Exception:
        pass
    
    # Check FFmpeg
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            timeout=5,
        )
        checks["ffmpeg"] = result.returncode == 0
    except Exception:
        pass
    
    # Determine overall status
    all_ready = all(v for k, v in checks.items() if isinstance(v, bool))
    
    return {
        "status": "ready" if all_ready else "not_ready",
        "checks": checks,
    }


@router.get("/metrics")
async def metrics():
    """Prometheus-compatible metrics endpoint"""
    from services.tasks import task_store
    
    # Get disk usage
    try:
        total, used, free = shutil.disk_usage(settings.TEMP_DIR)
        disk_usage = round((used / total) * 100, 1)
        disk_free_mb = round(free / (1024 * 1024), 1)
    except Exception:
        disk_usage = 0
        disk_free_mb = 0
    
    # Count tasks by status
    tasks_by_status = {"queued": 0, "processing": 0, "complete": 0, "failed": 0}
    for task in task_store.values():
        status = task.get("status", "unknown")
        if status in tasks_by_status:
            tasks_by_status[status] += 1
    
    return {
        "magetool_tasks_active": tasks_by_status["queued"] + tasks_by_status["processing"],
        "magetool_tasks_complete": tasks_by_status["complete"],
        "magetool_tasks_failed": tasks_by_status["failed"],
        "magetool_disk_usage_percent": disk_usage,
        "magetool_disk_free_mb": disk_free_mb,
    }
