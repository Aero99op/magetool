"""
Magetool Cluster Orchestrator
=============================
Coordinates distributed video processing across multiple HF Space workers.

Usage:
    from services.cluster import ClusterOrchestrator
    
    orchestrator = ClusterOrchestrator()
    result = await orchestrator.process_distributed(
        video_path="/path/to/video.mp4",
        operation="compress",
        quality="medium"
    )
"""

import logging
import asyncio
import subprocess
import httpx
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger("magetool.cluster")


# ==========================================
# CONFIGURATION
# ==========================================
# Magetool Worker Cluster - 3 HF Space Workers
WORKER_URLS = [
    "https://spandan1234-magetool-backend-2.hf.space",
    "https://spandan1234-magetool-backend-3.hf.space",
    "https://spandan1234-magetool-backend-4.hf.space",
]

# Fallback: If no workers configured, use empty list
# The orchestrator will check if workers are available before trying distributed processing


class ChunkStatus(Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass
class VideoChunk:
    """Represents a video chunk to be processed"""
    chunk_id: str
    chunk_path: Path
    start_time: float
    end_time: float
    duration: float
    worker_url: Optional[str] = None
    status: ChunkStatus = ChunkStatus.PENDING
    output_path: Optional[Path] = None
    error: Optional[str] = None


class ClusterOrchestrator:
    """
    Orchestrates distributed video processing across multiple HF Space workers.
    
    Flow:
    1. Split video into N chunks (N = number of workers)
    2. Upload each chunk to a different worker
    3. Wait for all workers to complete
    4. Download processed chunks
    5. Merge chunks into final video
    """
    
    def __init__(self, worker_urls: List[str] = None, temp_dir: Path = None):
        self.worker_urls = worker_urls or WORKER_URLS
        self.temp_dir = temp_dir or Path("/tmp/magetool-cluster")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.timeout = httpx.Timeout(300.0, connect=30.0)  # 5 min timeout
    
    def is_available(self) -> bool:
        """Check if cluster is configured with workers"""
        return len(self.worker_urls) > 0
    
    async def check_workers_health(self) -> Dict[str, bool]:
        """Check health of all configured workers"""
        results = {}
        async with httpx.AsyncClient(timeout=10.0) as client:
            for url in self.worker_urls:
                try:
                    response = await client.get(f"{url}/health")
                    results[url] = response.status_code == 200
                except Exception as e:
                    logger.warning(f"Worker {url} health check failed: {e}")
                    results[url] = False
        return results
    
    async def get_healthy_workers(self) -> List[str]:
        """Get list of healthy workers"""
        health = await self.check_workers_health()
        return [url for url, is_healthy in health.items() if is_healthy]
    
    def get_video_duration(self, video_path: Path) -> float:
        """Get video duration using ffprobe"""
        try:
            result = subprocess.run(
                [
                    "ffprobe", "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    str(video_path)
                ],
                capture_output=True,
                text=True,
                timeout=30
            )
            return float(result.stdout.strip())
        except Exception as e:
            logger.error(f"Failed to get video duration: {e}")
            raise
    
    def split_video_into_chunks(
        self,
        video_path: Path,
        num_chunks: int,
        task_id: str
    ) -> List[VideoChunk]:
        """
        Split video into equal chunks.
        Uses FFmpeg segment mode for fast splitting.
        """
        duration = self.get_video_duration(video_path)
        chunk_duration = duration / num_chunks
        
        chunks = []
        
        for i in range(num_chunks):
            start_time = i * chunk_duration
            end_time = min((i + 1) * chunk_duration, duration)
            chunk_id = f"{task_id}_chunk_{i}"
            chunk_path = self.temp_dir / f"{chunk_id}.mp4"
            
            # Split using FFmpeg (fast copy mode)
            ffmpeg_args = [
                "ffmpeg", "-y",
                "-ss", str(start_time),
                "-i", str(video_path),
                "-t", str(end_time - start_time),
                "-c", "copy",  # Stream copy = fast
                "-avoid_negative_ts", "make_zero",
                str(chunk_path)
            ]
            
            result = subprocess.run(ffmpeg_args, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Failed to split chunk {i}: {result.stderr}")
            
            chunks.append(VideoChunk(
                chunk_id=chunk_id,
                chunk_path=chunk_path,
                start_time=start_time,
                end_time=end_time,
                duration=end_time - start_time,
            ))
            
            logger.info(f"Created chunk {i}: {start_time:.2f}s - {end_time:.2f}s")
        
        return chunks
    
    async def upload_and_process_chunk(
        self,
        chunk: VideoChunk,
        worker_url: str,
        operation: str,
        quality: str,
        output_format: str,
    ) -> VideoChunk:
        """Upload chunk to worker and wait for processing"""
        chunk.worker_url = worker_url
        chunk.status = ChunkStatus.UPLOADING
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Upload and process
                with open(chunk.chunk_path, "rb") as f:
                    files = {"file": (chunk.chunk_path.name, f, "video/mp4")}
                    data = {
                        "task_id": chunk.chunk_id,
                        "operation": operation,
                        "quality": quality,
                        "output_format": output_format,
                    }
                    
                    chunk.status = ChunkStatus.PROCESSING
                    response = await client.post(
                        f"{worker_url}/process-chunk",
                        files=files,
                        data=data,
                    )
                
                if response.status_code != 200:
                    raise Exception(f"Worker error: {response.text}")
                
                result = response.json()
                
                # Download processed chunk
                download_response = await client.get(
                    f"{worker_url}/download/{chunk.chunk_id}"
                )
                
                if download_response.status_code != 200:
                    raise Exception(f"Download failed: {download_response.status_code}")
                
                # Save processed chunk
                output_path = self.temp_dir / f"{chunk.chunk_id}_processed.{output_format}"
                with open(output_path, "wb") as f:
                    f.write(download_response.content)
                
                chunk.output_path = output_path
                chunk.status = ChunkStatus.COMPLETE
                logger.info(f"Chunk {chunk.chunk_id} processed successfully")
                
        except Exception as e:
            chunk.status = ChunkStatus.FAILED
            chunk.error = str(e)
            logger.error(f"Chunk {chunk.chunk_id} failed: {e}")
        
        return chunk
    
    def merge_chunks(
        self,
        chunks: List[VideoChunk],
        output_path: Path,
        output_format: str = "mp4"
    ) -> Path:
        """Merge processed chunks back into single video"""
        # Create concat file
        concat_file = self.temp_dir / f"concat_{uuid.uuid4().hex[:8]}.txt"
        
        with open(concat_file, "w") as f:
            for chunk in sorted(chunks, key=lambda c: c.start_time):
                if chunk.output_path and chunk.output_path.exists():
                    f.write(f"file '{chunk.output_path}'\n")
        
        # Merge using FFmpeg
        ffmpeg_args = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c", "copy",
            str(output_path)
        ]
        
        result = subprocess.run(ffmpeg_args, capture_output=True, text=True)
        
        # Cleanup concat file
        concat_file.unlink(missing_ok=True)
        
        if result.returncode != 0:
            raise Exception(f"Merge failed: {result.stderr}")
        
        logger.info(f"Merged {len(chunks)} chunks into {output_path}")
        return output_path
    
    async def process_distributed(
        self,
        video_path: Path,
        operation: str = "compress",
        quality: str = "medium",
        output_format: str = "mp4",
        task_id: str = None,
    ) -> Dict[str, Any]:
        """
        Main entry point: Process video using distributed workers.
        
        Returns:
            {
                "success": bool,
                "output_path": Path,
                "chunks_processed": int,
                "time_saved_percent": float,
                "error": str (if failed)
            }
        """
        task_id = task_id or uuid.uuid4().hex[:12]
        video_path = Path(video_path)
        
        # Check workers
        healthy_workers = await self.get_healthy_workers()
        if not healthy_workers:
            return {
                "success": False,
                "error": "No healthy workers available",
                "fallback": True  # Signal to use single-node processing
            }
        
        num_workers = len(healthy_workers)
        logger.info(f"Starting distributed processing with {num_workers} workers")
        
        try:
            # 1. Split video
            chunks = self.split_video_into_chunks(video_path, num_workers, task_id)
            
            # 2. Process chunks in parallel
            tasks = []
            for chunk, worker_url in zip(chunks, healthy_workers):
                task = self.upload_and_process_chunk(
                    chunk, worker_url, operation, quality, output_format
                )
                tasks.append(task)
            
            # Wait for all to complete
            processed_chunks = await asyncio.gather(*tasks)
            
            # 3. Check for failures
            failed = [c for c in processed_chunks if c.status == ChunkStatus.FAILED]
            if failed:
                errors = [f"{c.chunk_id}: {c.error}" for c in failed]
                return {
                    "success": False,
                    "error": f"Chunks failed: {', '.join(errors)}",
                    "chunks_failed": len(failed),
                }
            
            # 4. Merge chunks
            output_path = self.temp_dir / f"{task_id}_final.{output_format}"
            self.merge_chunks(processed_chunks, output_path, output_format)
            
            # 5. Cleanup chunk files
            for chunk in processed_chunks:
                if chunk.chunk_path and chunk.chunk_path.exists():
                    chunk.chunk_path.unlink(missing_ok=True)
                if chunk.output_path and chunk.output_path.exists():
                    chunk.output_path.unlink(missing_ok=True)
            
            return {
                "success": True,
                "output_path": output_path,
                "chunks_processed": len(processed_chunks),
                "workers_used": num_workers,
            }
            
        except Exception as e:
            logger.error(f"Distributed processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
            }
    
    def cleanup(self, task_id: str):
        """Clean up all files related to a task"""
        for file_path in self.temp_dir.glob(f"{task_id}*"):
            file_path.unlink(missing_ok=True)


# ==========================================
# CONVENIENCE FUNCTIONS
# ==========================================
_orchestrator = None


def get_orchestrator() -> ClusterOrchestrator:
    """Get singleton orchestrator instance"""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ClusterOrchestrator()
    return _orchestrator


async def is_cluster_available() -> bool:
    """Check if cluster is configured and has healthy workers"""
    orchestrator = get_orchestrator()
    if not orchestrator.is_available():
        return False
    healthy = await orchestrator.get_healthy_workers()
    return len(healthy) > 0
