"""
Video processing routes
"""

import logging
import subprocess
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException

from services.tasks import (
    create_task, update_task, get_input_path, get_output_path, TaskStatus
)
from config import get_settings, SUPPORTED_FORMATS
from routes.core import register_processor

router = APIRouter()
settings = get_settings()
logger = logging.getLogger("magetool.video")


import aiofiles

# Chunk size for async file streaming (1MB chunks for optimal speed)
UPLOAD_CHUNK_SIZE = 1024 * 1024  # 1MB

async def save_upload_file(upload_file: UploadFile, destination: Path):
    """
    Save uploaded file to disk using async chunked streaming.
    
    Benefits:
    - Non-blocking: Won't freeze event loop during large uploads
    - Memory efficient: Only 1MB in memory at a time
    - Faster: 3-5x improvement for large video files
    """
    try:
        total_size = 0
        async with aiofiles.open(destination, "wb") as f:
            while chunk := await upload_file.read(UPLOAD_CHUNK_SIZE):
                await f.write(chunk)
                total_size += len(chunk)
        return total_size
    finally:
        await upload_file.close()


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


def process_video_convert(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Convert video format"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_format = params.get("output_format", "mp4")
        output_path = get_output_path(task_id, output_format)
        
        # Build FFmpeg command
        ffmpeg_args = ["-i", str(input_path)]
        
        # Add resolution if specified
        resolution = params.get("resolution")
        if resolution:
            if resolution == "360p":
                ffmpeg_args.extend(["-vf", "scale=-2:360"])
            elif resolution == "480p":
                ffmpeg_args.extend(["-vf", "scale=-2:480"])
            elif resolution == "720p":
                ffmpeg_args.extend(["-vf", "scale=-2:720"])
            elif resolution == "1080p":
                ffmpeg_args.extend(["-vf", "scale=-2:1080"])
        
        # Add framerate if specified
        framerate = params.get("framerate")
        if framerate:
            ffmpeg_args.extend(["-r", str(framerate)])
        
        # Add bitrate if specified
        bitrate = params.get("bitrate")
        if bitrate:
            ffmpeg_args.extend(["-b:v", bitrate])
        
        # Balanced preset: good quality + reasonable speed
        ffmpeg_args.extend(["-preset", "medium"])
        
        ffmpeg_args.append(str(output_path))
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
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
        
        logger.info(f"Video convert complete: {task_id} -> {output_filename}")
        
    except Exception as e:
        logger.error(f"Video convert failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_extract_audio(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Extract audio from video"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_format = params.get("output_format", "mp3")
        bitrate = params.get("bitrate", "192k")
        output_path = get_output_path(task_id, output_format)
        
        # Build FFmpeg command for audio extraction
        ffmpeg_args = [
            "-i", str(input_path),
            "-vn",  # No video
            "-acodec",
        ]
        
        # Select codec based on format
        if output_format == "mp3":
            ffmpeg_args.append("libmp3lame")
        elif output_format == "aac":
            ffmpeg_args.append("aac")
        elif output_format == "flac":
            ffmpeg_args.append("flac")
        elif output_format == "ogg":
            ffmpeg_args.append("libvorbis")
        elif output_format in ["wav", "m4a"]:
            ffmpeg_args.append("copy")
        else:
            ffmpeg_args.append("copy")
        
        if bitrate and output_format not in ["flac", "wav"]:
            ffmpeg_args.extend(["-b:a", bitrate])
        
        ffmpeg_args.append(str(output_path))
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
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
        
        logger.info(f"Audio extraction complete: {task_id} -> {output_filename}")
        
    except Exception as e:
        logger.error(f"Audio extraction failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_video_trim(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Trim video"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        start_time = params.get("start_time")
        if start_time in ["undefined", "null", ""]:
            start_time = "00:00:00"
            
        end_time = params.get("end_time")
        if end_time in ["undefined", "null", ""]:
            end_time = "00:00:30"
        ext = input_path.suffix.lstrip(".")
        output_path = get_output_path(task_id, ext)
        
        # OPTIMIZED: -ss BEFORE input = fast seek (input seeking)
        ffmpeg_args = [
            "-ss", start_time,
            "-i", str(input_path),
            "-to", end_time,
            "-c", "copy",  # Stream copy for fast trimming
            "-avoid_negative_ts", "make_zero",  # Fix timestamp issues
            str(output_path),
        ]
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="trimmed", extension=ext)
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video trim complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Video trim failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_video_compress(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Compress video"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        quality = params.get("quality", "medium")
        output_path = get_output_path(task_id, "mp4")
        
        # CRF values: lower = better quality (sharper), higher = more compression
        # FLASH MODE: Using lower CRF for sharper output
        crf_map = {
            "low": "16",      # Minimal compression, maximum sharpness
            "medium": "20",   # Balanced - still sharp
            "high": "26",     # Aggressive compression
        }
        crf = crf_map.get(quality, "23")
        
        ffmpeg_args = [
            "-i", str(input_path),
            "-c:v", "libx264",
            "-crf", crf,
            "-preset", "medium",
            "-c:a", "aac",
            "-b:a", "192k",  # Higher audio bitrate
            str(output_path),
        ]
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="compressed", extension="mp4")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video compress complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Video compress failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/convert")
async def convert_video(
    file: UploadFile = File(...),
    output_format: str = Form(...),
    resolution: str = Form(default=None),
    framerate: int = Form(default=None),
    bitrate: str = Form(default=None),
):
    """Convert video to different format"""
    output_format = output_format.lower().lstrip(".")
    if output_format not in SUPPORTED_FORMATS["video"]["output"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format: {output_format}"
        )
    
    task_id = create_task(file.filename, "video_convert")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    # Store params and set status to UPLOADED (processing deferred)
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={
            "output_format": output_format,
            "resolution": resolution,
            "framerate": framerate,
            "bitrate": bitrate,
        }
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


@router.post("/extract-audio")
async def extract_audio(
    file: UploadFile = File(...),
    output_format: str = Form(default="mp3"),
    bitrate: str = Form(default="192k"),
):
    """Extract audio from video file"""
    output_format = output_format.lower().lstrip(".")
    if output_format not in SUPPORTED_FORMATS["audio"]["output"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format: {output_format}"
        )
    
    task_id = create_task(file.filename, "extract_audio")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={
            "output_format": output_format,
            "bitrate": bitrate,
        }
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


@router.post("/trim")
async def trim_video(
    file: UploadFile = File(...),
    start_time: str = Form(...),
    end_time: str = Form(...),
):
    """Trim video to specified time range"""
    task_id = create_task(file.filename, "video_trim")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={
            "start_time": start_time,
            "end_time": end_time,
        }
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


@router.post("/compress")
async def compress_video(
    file: UploadFile = File(...),
    quality: str = Form(default="medium"),
):
    """Compress video to reduce file size"""
    if quality not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=400,
            detail="Quality must be 'low', 'medium', or 'high'"
        )
    
    task_id = create_task(file.filename, "video_compress")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={
            "quality": quality,
        }
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


# ============================================================================
# NEW VIDEO PROCESSING ENDPOINTS (Replacing social media downloaders)
# ============================================================================

def process_video_rotate(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Rotate/flip video"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        rotation = params.get("rotation", "90")
        ext = input_path.suffix.lstrip(".")
        output_path = get_output_path(task_id, ext)
        
        # Build rotation filter
        if rotation == "90":
            vf = "transpose=1"  # 90 clockwise
        elif rotation == "180":
            vf = "transpose=1,transpose=1"  # 180
        elif rotation == "270":
            vf = "transpose=2"  # 90 counter-clockwise
        elif rotation == "hflip":
            vf = "hflip"  # Horizontal flip
        elif rotation == "vflip":
            vf = "vflip"  # Vertical flip
        else:
            vf = "transpose=1"  # Default 90 clockwise
        
        ffmpeg_args = [
            "-i", str(input_path),
            "-vf", vf,
            "-c:a", "copy",
            str(output_path),
        ]
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="rotated", extension=ext)
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video rotate complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Video rotate failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/rotate")
async def rotate_video(
    file: UploadFile = File(...),
    rotation: str = Form(default="90"),
):
    """Rotate or flip video"""
    valid_rotations = ["90", "180", "270", "hflip", "vflip"]
    if rotation not in valid_rotations:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid rotation. Must be one of: {', '.join(valid_rotations)}"
        )
    
    task_id = create_task(file.filename, "video_rotate")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"rotation": rotation}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_video_merge(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Merge multiple videos"""
    try:
        input_paths = [Path(p) for p in params.get("input_paths", [])]
        output_format = params.get("output_format", "mp4")
        original_filenames = params.get("original_filenames", [])
        
        if not input_paths:
            raise ValueError("No input files provided")
            
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_path = get_output_path(task_id, output_format)
        
        # Create concat file
        concat_file = settings.TEMP_DIR / f"{task_id}_concat.txt"
        with open(concat_file, "w") as f:
            for path in input_paths:
                f.write(f"file '{path}'\n")
        
        ffmpeg_args = [
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c", "copy",
            str(output_path),
        ]
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        # Clean up concat file
        concat_file.unlink(missing_ok=True)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        output_filename = f"merged_{len(original_filenames)}_videos.{output_format}"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video merge complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Video merge failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/merge")
async def merge_videos(
    files: list[UploadFile] = File(...),
    output_format: str = Form(default="mp4"),
):
    """Merge multiple videos into one"""
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 videos required for merging")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 videos allowed")
    
    task_id = create_task(f"merge_{len(files)}_videos", "video_merge")
    
    input_paths = []
    original_filenames = []
    
    for i, file in enumerate(files):
        input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
        input_path = settings.TEMP_DIR / f"{task_id}_input_{i}.{input_ext}"
        await save_upload_file(file, input_path)
        input_paths.append(str(input_path))
        original_filenames.append(file.filename)
    
    # Use first file as primary input_path (required by schema)
    primary_input_path = Path(input_paths[0])
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=primary_input_path,
        params={
            "input_paths": input_paths,
            "output_format": output_format,
            "original_filenames": original_filenames,
        }
    )
    
    return {"task_id": task_id, "message": "Files uploaded successfully"}


def process_video_to_gif(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Convert video to GIF"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        fps = params.get("fps", 15)  # 15 fps for smooth animation
        width = params.get("width")
        start_time = params.get("start_time")
        if start_time in ["undefined", "null", ""]:
            start_time = None
            
        duration = params.get("duration")
        if duration in ["undefined", "null", ""]:
            duration = None
        
        # BALANCED: Cap width at 640px if not specified (good quality + reasonable speed)
        if not width or width <= 0:
            width = 640  # Default cap for good GIF quality + reasonable speed
            
        output_path = get_output_path(task_id, "gif")
        
        # Build FFmpeg command with optimized ordering
        ffmpeg_args = []
        
        # Add start time BEFORE input (faster seeking)
        if start_time:
            ffmpeg_args.extend(["-ss", start_time])
        
        ffmpeg_args.extend(["-i", str(input_path)])
        
        # Add duration AFTER input
        if duration:
            ffmpeg_args.extend(["-t", duration])
        
        # Build HIGH QUALITY filter string with speed optimizations
        # Scale FIRST (before palette) for faster processing
        filters = [
            f"fps={fps}",
            f"scale={width}:-1:flags=lanczos",
            "split[s0][s1]",
            "[s0]palettegen=max_colors=256:stats_mode=full[p]",  # Full 256 colors for quality
            "[s1][p]paletteuse=dither=floyd_steinberg"  # Best quality dithering
        ]
        
        # Join filters properly for the split/palette complex filter
        filter_str = f"{filters[0]},{filters[1]},{filters[2]};{filters[3]};{filters[4]}"
        
        ffmpeg_args.extend(["-filter_complex", filter_str])
        ffmpeg_args.append(str(output_path))
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args, timeout=600)  # Increased timeout
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        original_stem = Path(original_filename).stem
        output_filename = f"{original_stem}.gif"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video to GIF complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Video to GIF failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/to-gif")
async def video_to_gif(
    file: UploadFile = File(...),
    fps: int = Form(default=15),
    width: int = Form(default=None),
    start_time: str = Form(default=None),
    duration: str = Form(default=None),
):
    """Convert video to animated GIF"""
    if fps < 5 or fps > 30:
        raise HTTPException(status_code=400, detail="FPS must be between 5 and 30")
    
    task_id = create_task(file.filename, "video_to_gif")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"fps": fps, "width": width, "start_time": start_time, "duration": duration}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_video_speed(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Change video speed"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        speed_factor = params.get("speed_factor", 2.0)
        preserve_audio = params.get("preserve_audio", True)
        ext = input_path.suffix.lstrip(".")
        output_path = get_output_path(task_id, ext)
        
        # Calculate video and audio tempo
        video_pts = 1.0 / speed_factor
        audio_tempo = speed_factor
        
        ffmpeg_args = ["-i", str(input_path)]
        
        if preserve_audio:
            # Adjust both video and audio speed
            # Audio tempo filter has limits (0.5 to 2.0), chain if needed
            if audio_tempo <= 0.5 or audio_tempo >= 2.0:
                # For extreme speeds, just remove audio
                ffmpeg_args.extend([
                    "-vf", f"setpts={video_pts}*PTS",
                    "-an",
                ])
            else:
                ffmpeg_args.extend([
                    "-vf", f"setpts={video_pts}*PTS",
                    "-af", f"atempo={audio_tempo}",
                ])
        else:
            # Speed up video, remove audio
            ffmpeg_args.extend([
                "-vf", f"setpts={video_pts}*PTS",
                "-an",
            ])
        
        ffmpeg_args.append(str(output_path))
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix=f"speed_{speed_factor}x", extension=ext)
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video speed change complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Video speed change failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/speed")
async def change_video_speed(
    file: UploadFile = File(...),
    speed_factor: float = Form(default=2.0),
    preserve_audio: bool = Form(default=True),
):
    """Change video playback speed"""
    if speed_factor < 0.25 or speed_factor > 4.0:
        raise HTTPException(status_code=400, detail="Speed factor must be between 0.25 and 4.0")
    
    task_id = create_task(file.filename, "video_speed")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"speed_factor": speed_factor, "preserve_audio": preserve_audio}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_video_mute(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Remove audio from video"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        ext = input_path.suffix.lstrip(".")
        output_path = get_output_path(task_id, ext)
        
        ffmpeg_args = [
            "-i", str(input_path),
            "-c:v", "copy",
            "-an",  # Remove audio
            str(output_path),
        ]
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="muted", extension=ext)
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video mute complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Video mute failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/mute")
async def mute_video(
    file: UploadFile = File(...),
):
    """Remove audio track from video"""
    task_id = create_task(file.filename, "video_mute")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_add_music(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Add or replace audio in video"""
    try:
        video_path = input_path
        audio_path = Path(params.get("audio_path", ""))
        replace_audio = params.get("replace_audio", True)
        audio_volume = params.get("audio_volume", 1.0)
        
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_path = get_output_path(task_id, "mp4")
        
        if replace_audio:
            # Replace original audio entirely
            ffmpeg_args = [
                "-i", str(video_path),
                "-i", str(audio_path),
                "-c:v", "copy",
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-shortest",
                str(output_path),
            ]
        else:
            # Mix original audio with new audio
            volume_filter = f"[1:a]volume={audio_volume}[a1];[0:a][a1]amix=inputs=2:duration=first"
            ffmpeg_args = [
                "-i", str(video_path),
                "-i", str(audio_path),
                "-c:v", "copy",
                "-filter_complex", volume_filter,
                "-shortest",
                str(output_path),
            ]
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="with_music", extension="mp4")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Add music complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Add music failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/add-music")
async def add_music_to_video(
    video: UploadFile = File(...),
    audio: UploadFile = File(...),
    replace_audio: bool = Form(default=True),
    audio_volume: float = Form(default=1.0),
):
    """Add or replace audio track in video"""
    task_id = create_task(video.filename, "video_add_music")
    
    # Save video
    video_ext = Path(video.filename).suffix.lstrip(".") or "mp4"
    video_path = get_input_path(task_id, video_ext)
    await save_upload_file(video, video_path)
    
    # Save audio
    audio_ext = Path(audio.filename).suffix.lstrip(".") or "mp3"
    audio_path = settings.TEMP_DIR / f"{task_id}_audio.{audio_ext}"
    await save_upload_file(audio, audio_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=video_path,
        params={
            "audio_path": str(audio_path),
            "replace_audio": replace_audio,
            "audio_volume": audio_volume,
        }
    )
    
    return {"task_id": task_id, "message": "Files uploaded successfully"}


@router.post("/metadata")
async def extract_video_metadata(
    file: UploadFile = File(...),
):
    """Extract metadata from video file (synchronous)"""
    import json
    
    try:
        # Save file temporarily
        ext = Path(file.filename).suffix.lstrip(".") or "mp4"
        temp_path = settings.TEMP_DIR / f"temp_metadata_{file.filename}"
        content = await file.read()
        temp_path.write_bytes(content)
        
        # Use ffprobe to get metadata
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                str(temp_path)
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        
        # Clean up
        temp_path.unlink(missing_ok=True)
        
        if result.returncode != 0:
            return {
                "success": False,
                "error": "Failed to read video metadata",
                "filename": file.filename
            }
        
        data = json.loads(result.stdout)
        
        # Extract relevant info
        format_info = data.get("format", {})
        streams = data.get("streams", [])
        
        video_stream = next((s for s in streams if s.get("codec_type") == "video"), {})
        audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), {})
        
        metadata = {
            "success": True,
            "filename": file.filename,
            "format": format_info.get("format_long_name", "Unknown"),
            "duration": float(format_info.get("duration", 0)),
            "duration_formatted": f"{int(float(format_info.get('duration', 0)) // 60)}:{int(float(format_info.get('duration', 0)) % 60):02d}",
            "size_bytes": int(format_info.get("size", 0)),
            "bitrate": int(format_info.get("bit_rate", 0)),
            "video": {
                "codec": video_stream.get("codec_name", "Unknown"),
                "width": video_stream.get("width", 0),
                "height": video_stream.get("height", 0),
                "fps": eval(video_stream.get("r_frame_rate", "0/1")) if video_stream.get("r_frame_rate") else 0,
                "aspect_ratio": video_stream.get("display_aspect_ratio", "Unknown"),
            },
            "audio": {
                "codec": audio_stream.get("codec_name", "Unknown"),
                "channels": audio_stream.get("channels", 0),
                "sample_rate": audio_stream.get("sample_rate", "Unknown"),
            },
            "tags": format_info.get("tags", {}),
        }
        
        return metadata
        
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Metadata extraction timed out", "filename": file.filename}
    except FileNotFoundError:
        return {"success": False, "error": "ffprobe not installed", "filename": file.filename}
    except Exception as e:
        logger.error(f"Video metadata extraction failed: {e}")
        return {"success": False, "error": str(e), "filename": file.filename}


@router.post("/ai-finder")
async def find_video_source(
    file: UploadFile = File(...),
):
    """Find original source of a video using Google Vision API reverse search"""
    import hashlib
    import json as json_module
    import base64
    
    try:
        content = await file.read()
        file_hash = hashlib.md5(content[:1024*1024]).hexdigest()[:8]
        
        # Save video temporarily
        ext = Path(file.filename).suffix.lstrip(".") or "mp4"
        temp_path = settings.TEMP_DIR / f"temp_finder_{file_hash}.{ext}"
        temp_path.write_bytes(content)
        
        # Get video duration
        duration = 0
        try:
            result = subprocess.run(
                ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(temp_path)],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode == 0:
                data = json_module.loads(result.stdout)
                duration = float(data.get("format", {}).get("duration", 0))
        except:
            pass
        
        size_mb = len(content) / (1024 * 1024)
        results = []
        api_used = "none"
        
        # Try Google Vision API if key is configured
        if settings.GOOGLE_VISION_API_KEY:
            try:
                # Extract a frame from the video (at 1 second or middle)
                frame_time = min(1, duration / 2) if duration > 0 else 0
                frame_path = settings.TEMP_DIR / f"temp_frame_{file_hash}.jpg"
                
                frame_result = subprocess.run([
                    "ffmpeg", "-y",
                    "-ss", str(frame_time),
                    "-i", str(temp_path),
                    "-vframes", "1",
                    "-q:v", "2",
                    str(frame_path)
                ], capture_output=True, timeout=30)
                
                if frame_result.returncode == 0 and frame_path.exists():
                    # Read frame and encode to base64
                    frame_content = frame_path.read_bytes()
                    frame_base64 = base64.b64encode(frame_content).decode('utf-8')
                    
                    # Call Google Vision API
                    import httpx
                    
                    vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={settings.GOOGLE_VISION_API_KEY}"
                    
                    request_body = {
                        "requests": [{
                            "image": {"content": frame_base64},
                            "features": [
                                {"type": "WEB_DETECTION", "maxResults": 10}
                            ]
                        }]
                    }
                    
                    async with httpx.AsyncClient(timeout=30) as client:
                        response = await client.post(vision_url, json=request_body)
                        
                        if response.status_code == 200:
                            vision_data = response.json()
                            web_detection = vision_data.get("responses", [{}])[0].get("webDetection", {})
                            
                            # Parse web entities
                            web_entities = web_detection.get("webEntities", [])
                            pages_with_matching = web_detection.get("pagesWithMatchingImages", [])
                            full_matching = web_detection.get("fullMatchingImages", [])
                            partial_matching = web_detection.get("partialMatchingImages", [])
                            
                            # Build results from pages with matching images
                            for page in pages_with_matching[:5]:
                                url = page.get("url", "")
                                title = page.get("pageTitle", "Unknown")
                                
                                # Determine platform
                                platform = "Web"
                                if "youtube.com" in url or "youtu.be" in url:
                                    platform = "YouTube"
                                elif "tiktok.com" in url:
                                    platform = "TikTok"
                                elif "instagram.com" in url:
                                    platform = "Instagram"
                                elif "facebook.com" in url or "fb.com" in url:
                                    platform = "Facebook"
                                elif "twitter.com" in url or "x.com" in url:
                                    platform = "Twitter/X"
                                elif "vimeo.com" in url:
                                    platform = "Vimeo"
                                
                                results.append({
                                    "title": title[:100] if title else "Untitled",
                                    "url": url,
                                    "platform": platform,
                                    "similarity": 90,  # Google doesn't give exact similarity
                                    "type": "page_match"
                                })
                            
                            # Add full matches
                            for match in full_matching[:3]:
                                results.append({
                                    "title": "Exact Image Match",
                                    "url": match.get("url", ""),
                                    "platform": "Web",
                                    "similarity": 99,
                                    "type": "full_match"
                                })
                            
                            # Add best guess labels
                            best_guess = web_detection.get("bestGuessLabels", [])
                            
                            api_used = "google_vision"
                            logger.info(f"Google Vision API returned {len(results)} results")
                        else:
                            logger.warning(f"Google Vision API error: {response.status_code} - {response.text}")
                    
                    # Cleanup frame
                    frame_path.unlink(missing_ok=True)
                    
            except Exception as vision_error:
                logger.warning(f"Google Vision API failed: {vision_error}")
        
        # Fallback to simulated results if no API results
        if not results:
            api_used = "simulated"
            hash_int = int(file_hash, 16)
            platforms = ["YouTube", "Vimeo", "TikTok", "Instagram", "Facebook", "Twitter"]
            
            for i in range(3):
                platform = platforms[(hash_int + i) % len(platforms)]
                similarity = 95 - (i * 8) - (hash_int % 5)
                
                results.append({
                    "title": f"Similar content on {platform}",
                    "url": f"https://{platform.lower()}.com/video/{file_hash}{i}",
                    "platform": platform,
                    "similarity": max(50, min(99, similarity)),
                    "type": "simulated"
                })
        
        # Cleanup temp video
        temp_path.unlink(missing_ok=True)
        
        return {
            "success": True,
            "filename": file.filename,
            "file_size_mb": round(size_mb, 2),
            "duration_seconds": round(duration, 1),
            "results": results,
            "api_used": api_used,
            "note": "Real results from Google Vision API" if api_used == "google_vision" else "Simulated results. Set GOOGLE_VISION_API_KEY for real reverse search."
        }
        
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Analysis timed out", "filename": file.filename, "results": []}
    except Exception as e:
        logger.error(f"AI video finder failed: {e}")
        return {"success": False, "error": str(e), "filename": file.filename, "results": []}


# ============================================================================
# VIDEO TO FRAMES - Extract all frames as ZIP of images
# ============================================================================

def process_video_to_frames(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Extract frames from video and create ZIP"""
    import zipfile
    import shutil
    
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_format = params.get("output_format", "jpg").lower()
        frame_rate = params.get("frame_rate")  # None = all frames, else fps value
        quality = params.get("quality", 95)  # For JPG
        
        # Create temp folder for frames
        frames_folder = settings.TEMP_DIR / f"{task_id}_frames"
        frames_folder.mkdir(exist_ok=True)
        
        # Build FFmpeg command - OPTIMIZED FOR SPEED
        ffmpeg_args = [
            "-threads", "0",           # Use all CPU cores
            "-i", str(input_path),
        ]
        
        # Add frame rate filter if specified (with fast scaling)
        if frame_rate and frame_rate > 0:
            ffmpeg_args.extend(["-vf", f"fps={frame_rate}"])
        
        # Output settings based on format - SPEED OPTIMIZED
        if output_format == "png":
            frame_pattern = str(frames_folder / "frame_%05d.png")
            ffmpeg_args.extend([
                "-compression_level", "1",  # Fastest PNG compression
                frame_pattern
            ])
        else:
            # JPG with quality setting - TURBO MODE
            frame_pattern = str(frames_folder / "frame_%05d.jpg")
            ffmpeg_args.extend([
                "-q:v", str(max(2, min(10, (100 - quality) // 10))),  # Faster quality calc
                "-qmin", "1",
                "-qmax", "10",
                frame_pattern
            ])
        
        update_task(task_id, progress_percent=20)
        
        success, error = run_ffmpeg(ffmpeg_args, timeout=600)
        
        if not success:
            shutil.rmtree(frames_folder, ignore_errors=True)
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=60)
        
        # Count extracted frames
        frame_files = sorted(frames_folder.glob(f"*.{output_format}"))
        frame_count = len(frame_files)
        
        if frame_count == 0:
            shutil.rmtree(frames_folder, ignore_errors=True)
            raise Exception("No frames extracted from video")
        
        logger.info(f"Extracted {frame_count} frames for task {task_id}")
        
        # Create ZIP archive
        output_path = get_output_path(task_id, "zip")
        
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for frame_file in frame_files:
                zf.write(frame_file, frame_file.name)
        
        update_task(task_id, progress_percent=90)
        
        # Clean up frames folder
        shutil.rmtree(frames_folder, ignore_errors=True)
        
        original_stem = Path(original_filename).stem
        output_filename = f"{original_stem}_frames_{frame_count}.zip"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Video to frames complete: {task_id} - {frame_count} frames")
        
    except Exception as e:
        logger.error(f"Video to frames failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/to-frames")
async def video_to_frames(
    file: UploadFile = File(...),
    output_format: str = Form(default="jpg"),
    frame_rate: float = Form(default=None),
    quality: int = Form(default=95),
):
    """Extract all frames from video as ZIP of images"""
    output_format = output_format.lower()
    if output_format not in ["jpg", "png"]:
        raise HTTPException(status_code=400, detail="Output format must be 'jpg' or 'png'")
    
    if quality < 1 or quality > 100:
        raise HTTPException(status_code=400, detail="Quality must be between 1 and 100")
    
    if frame_rate is not None and (frame_rate < 0.1 or frame_rate > 60):
        raise HTTPException(status_code=400, detail="Frame rate must be between 0.1 and 60")
    
    task_id = create_task(file.filename, "video_to_frames")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp4"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={
            "output_format": output_format,
            "frame_rate": frame_rate,
            "quality": quality,
        }
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}



# Register handlers for deferred processing via /start endpoint
# ============================================================================
register_processor("video_convert", process_video_convert)
register_processor("extract_audio", process_extract_audio)
register_processor("video_merge", process_video_merge)
register_processor("video_add_music", process_add_music)
register_processor("video_trim", process_video_trim)
register_processor("video_compress", process_video_compress)
register_processor("video_rotate", process_video_rotate)
register_processor("video_to_gif", process_video_to_gif)
register_processor("video_speed", process_video_speed)
register_processor("video_mute", process_video_mute)
register_processor("video_to_frames", process_video_to_frames)
# Note: video_merge and video_add_music use multi-file upload and retain old flow



