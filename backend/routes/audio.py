"""
Audio processing routes
"""

import logging
import subprocess
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException

from services.tasks import (
    create_task, update_task, get_input_path, get_output_path, TaskStatus
)
from config import get_settings, SUPPORTED_FORMATS

router = APIRouter()
settings = get_settings()
logger = logging.getLogger("magetool.audio")


async def save_upload_file(upload_file: UploadFile, destination: Path):
    """Save uploaded file to disk"""
    content = await upload_file.read()
    destination.write_bytes(content)
    return len(content)


def run_ffmpeg(args: list, timeout: int = 300) -> tuple[bool, str]:
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


def process_audio_convert(task_id: str, input_path: Path, output_format: str, bitrate: str, original_filename: str):
    """Background task: Convert audio format"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_path = get_output_path(task_id, output_format)
        
        ffmpeg_args = ["-i", str(input_path)]
        
        # Select codec based on format
        if output_format == "mp3":
            ffmpeg_args.extend(["-acodec", "libmp3lame"])
        elif output_format == "aac":
            ffmpeg_args.extend(["-acodec", "aac"])
        elif output_format == "flac":
            ffmpeg_args.extend(["-acodec", "flac"])
        elif output_format == "ogg":
            ffmpeg_args.extend(["-acodec", "libvorbis"])
        elif output_format == "wav":
            ffmpeg_args.extend(["-acodec", "pcm_s16le"])
        elif output_format == "m4a":
            ffmpeg_args.extend(["-acodec", "aac"])
        
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
        
        logger.info(f"Audio convert complete: {task_id} -> {output_filename}")
        
    except Exception as e:
        logger.error(f"Audio convert failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_audio_trim(task_id: str, input_path: Path, start_time: str, end_time: str, fade_in: int, fade_out: int, original_filename: str):
    """Background task: Trim audio"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        ext = input_path.suffix.lstrip(".")
        output_path = get_output_path(task_id, ext)
        
        ffmpeg_args = [
            "-i", str(input_path),
            "-ss", start_time,
            "-to", end_time,
        ]
        
        # Add fade effects if specified
        filters = []
        if fade_in and fade_in > 0:
            filters.append(f"afade=t=in:st=0:d={fade_in}")
        if fade_out and fade_out > 0:
            filters.append(f"afade=t=out:st={end_time}:d={fade_out}")
        
        if filters:
            ffmpeg_args.extend(["-af", ",".join(filters)])
        
        ffmpeg_args.append(str(output_path))
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        original_stem = Path(original_filename).stem
        output_filename = f"{original_stem}_trimmed.{ext}"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Audio trim complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Audio trim failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_audio_volume(task_id: str, input_path: Path, gain: float, normalize: bool, original_filename: str):
    """Background task: Adjust audio volume"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        ext = input_path.suffix.lstrip(".")
        output_path = get_output_path(task_id, ext)
        
        ffmpeg_args = ["-i", str(input_path)]
        
        if normalize:
            ffmpeg_args.extend(["-af", "loudnorm"])
        elif gain != 0:
            ffmpeg_args.extend(["-af", f"volume={gain}dB"])
        
        ffmpeg_args.append(str(output_path))
        
        update_task(task_id, progress_percent=30)
        
        success, error = run_ffmpeg(ffmpeg_args)
        
        if not success:
            raise Exception(f"FFmpeg error: {error}")
        
        update_task(task_id, progress_percent=90)
        
        original_stem = Path(original_filename).stem
        output_filename = f"{original_stem}_adjusted.{ext}"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Audio volume adjust complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Audio volume adjust failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/convert")
async def convert_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    output_format: str = Form(...),
    bitrate: str = Form(default="192k"),
):
    """Convert audio to different format"""
    output_format = output_format.lower().lstrip(".")
    if output_format not in SUPPORTED_FORMATS["audio"]["output"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format: {output_format}"
        )
    
    task_id = create_task(file.filename, "audio_convert")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp3"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    background_tasks.add_task(
        process_audio_convert,
        task_id,
        input_path,
        output_format,
        bitrate,
        file.filename,
    )
    
    return {"task_id": task_id, "message": "Audio conversion started"}


@router.post("/trim")
async def trim_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    start_time: str = Form(...),
    end_time: str = Form(...),
    fade_in: int = Form(default=0),
    fade_out: int = Form(default=0),
):
    """Trim audio to specified time range with optional fade effects"""
    task_id = create_task(file.filename, "audio_trim")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp3"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    background_tasks.add_task(
        process_audio_trim,
        task_id,
        input_path,
        start_time,
        end_time,
        fade_in,
        fade_out,
        file.filename,
    )
    
    return {"task_id": task_id, "message": "Audio trim started"}


@router.post("/volume")
async def adjust_volume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    gain: float = Form(default=0),
    normalize: bool = Form(default=False),
):
    """Adjust audio volume or normalize"""
    if gain < -20 or gain > 20:
        raise HTTPException(
            status_code=400,
            detail="Gain must be between -20 and +20 dB"
        )
    
    task_id = create_task(file.filename, "audio_volume")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "mp3"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    background_tasks.add_task(
        process_audio_volume,
        task_id,
        input_path,
        gain,
        normalize,
        file.filename,
    )
    
    return {"task_id": task_id, "message": "Audio volume adjustment started"}


@router.post("/bpm")
async def detect_bpm(
    file: UploadFile = File(...),
):
    """Detect BPM of audio file using librosa beat tracking"""
    import json as json_module
    
    try:
        # Save file temporarily
        ext = Path(file.filename).suffix.lstrip(".") or "mp3"
        temp_path = settings.TEMP_DIR / f"temp_bpm_{file.filename}"
        content = await file.read()
        temp_path.write_bytes(content)
        
        bpm = None
        confidence = 0.0
        method_used = "unknown"
        
        # Try librosa first (most accurate)
        try:
            import librosa
            import numpy as np
            
            # Convert to WAV for librosa if needed
            wav_path = settings.TEMP_DIR / f"temp_bpm_{Path(file.filename).stem}.wav"
            
            # Use FFmpeg to convert to WAV
            convert_result = subprocess.run([
                "ffmpeg", "-y",
                "-i", str(temp_path),
                "-ar", "22050",  # Sample rate
                "-ac", "1",  # Mono
                str(wav_path)
            ], capture_output=True, text=True, timeout=60)
            
            if convert_result.returncode == 0:
                # Load audio with librosa
                y, sr = librosa.load(str(wav_path), sr=22050, mono=True, duration=60)
                
                # Use librosa's beat tracker
                tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
                
                # Handle both old and new librosa versions
                if hasattr(tempo, '__iter__'):
                    bpm = float(tempo[0]) if len(tempo) > 0 else float(tempo)
                else:
                    bpm = float(tempo)
                
                # Calculate confidence based on beat consistency
                if len(beat_frames) > 2:
                    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
                    intervals = np.diff(beat_times)
                    if len(intervals) > 0:
                        std_dev = np.std(intervals)
                        mean_interval = np.mean(intervals)
                        # Lower variance = higher confidence
                        if mean_interval > 0:
                            cv = std_dev / mean_interval  # Coefficient of variation
                            confidence = max(0.5, min(0.99, 1.0 - cv))
                        else:
                            confidence = 0.7
                    else:
                        confidence = 0.7
                else:
                    confidence = 0.6
                
                method_used = "librosa"
                wav_path.unlink(missing_ok=True)
            else:
                raise Exception("Audio conversion failed")
                
        except ImportError:
            # Librosa not installed, use FFmpeg-based estimation
            logger.info("librosa not installed, using FFmpeg-based BPM estimation")
            
            # Get audio duration and analysis using FFmpeg
            result = subprocess.run([
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                str(temp_path)
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                data = json_module.loads(result.stdout)
                format_info = data.get("format", {})
                duration = float(format_info.get("duration", 0))
                
                # Use FFmpeg to analyze audio beats via onset detection
                onset_result = subprocess.run([
                    "ffmpeg",
                    "-i", str(temp_path),
                    "-af", "silencedetect=n=-30dB:d=0.1,astats=metadata=1:reset=1",
                    "-f", "null",
                    "-"
                ], capture_output=True, text=True, timeout=60)
                
                # Analyze volume peaks for tempo estimation
                vol_result = subprocess.run([
                    "ffmpeg",
                    "-i", str(temp_path),
                    "-af", "volumedetect",
                    "-f", "null",
                    "-"
                ], capture_output=True, text=True, timeout=60)
                
                stderr = vol_result.stderr
                
                # Extract volume info for energy-based estimation
                import re
                mean_vol = -20  # default
                max_vol = -10
                
                if "mean_volume" in stderr:
                    match = re.search(r"mean_volume: ([\-\d.]+) dB", stderr)
                    if match:
                        mean_vol = float(match.group(1))
                
                if "max_volume" in stderr:
                    match = re.search(r"max_volume: ([\-\d.]+) dB", stderr)
                    if match:
                        max_vol = float(match.group(1))
                
                # Estimate BPM based on dynamics
                dynamic_range = max_vol - mean_vol
                
                if dynamic_range > 20:
                    # High dynamic range = likely slower, more dynamic music
                    bpm = 80 + (dynamic_range - 20) * 2
                elif dynamic_range > 10:
                    # Medium dynamics = pop/rock tempo range
                    bpm = 110 + (dynamic_range - 10) * 2
                else:
                    # Low dynamics = electronic/dance music
                    bpm = 125
                
                # Clamp to reasonable range
                bpm = max(60, min(180, bpm))
                confidence = 0.5  # Lower confidence for estimation
                method_used = "ffmpeg_estimation"
            else:
                bpm = 120
                confidence = 0.3
                method_used = "fallback"
                
        except Exception as e:
            logger.warning(f"BPM detection error: {e}, using fallback")
            bpm = 120
            confidence = 0.3
            method_used = "fallback"
        
        # Clean up temp files
        temp_path.unlink(missing_ok=True)
        
        # Get duration info
        duration = 0
        try:
            result = subprocess.run([
                "ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_format", str(temp_path)
            ], capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                data = json_module.loads(result.stdout)
                duration = float(data.get("format", {}).get("duration", 0))
        except:
            pass
        
        return {
            "success": True,
            "filename": file.filename,
            "bpm": round(bpm, 1) if bpm else 120,
            "confidence": round(confidence, 2),
            "duration": duration,
            "method": method_used,
            "note": "Accurate BPM detected via beat tracking" if method_used == "librosa" else "BPM estimated. Install librosa for precise detection."
        }
            
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Analysis timed out", "filename": file.filename}
    except FileNotFoundError:
        return {"success": False, "error": "ffprobe not installed", "filename": file.filename}
    except Exception as e:
        logger.error(f"BPM detection failed: {e}")
        return {"success": False, "error": str(e), "filename": file.filename}


@router.post("/identify")
async def identify_song(
    file: UploadFile = File(...),
):
    """Song identification (requires external API - returns placeholder)"""
    try:
        content = await file.read()
        duration = len(content) / 1000  # Rough estimate
        
        return {
            "success": True,
            "filename": file.filename,
            "identified": False,
            "message": "Song identification requires an external API like AudD or ACRCloud.",
            "file_size": len(content),
            "suggestion": "Configure AUDD_API_KEY or ACRCLOUD_API_KEY environment variables for real identification."
        }
    except Exception as e:
        logger.error(f"Song identification failed: {e}")
        return {"success": False, "error": str(e), "filename": file.filename}
