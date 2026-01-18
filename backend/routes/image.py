"""
Image processing routes
"""

import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from typing import List
from PIL import Image
import io

from services.tasks import (
    create_task, update_task, get_input_path, get_output_path, TaskStatus
)
from config import get_settings, SUPPORTED_FORMATS
from routes.core import register_processor

router = APIRouter()
settings = get_settings()
logger = logging.getLogger("magetool.image")


import shutil

async def save_upload_file(upload_file: UploadFile, destination: Path):
    """Save uploaded file to disk using streaming to prevent OOM"""
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return destination.stat().st_size
    finally:
        await upload_file.close()


def process_image_convert(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Convert image format"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_format = params.get("output_format", "png")
        
        # Open image
        with Image.open(input_path) as img:
            update_task(task_id, progress_percent=30)
            
            # Convert mode if needed for certain formats
            if output_format.lower() in ["jpg", "jpeg"] and img.mode in ["RGBA", "P"]:
                img = img.convert("RGB")
            elif output_format.lower() == "png" and img.mode not in ["RGBA", "RGB", "L", "P"]:
                img = img.convert("RGBA")
            
            update_task(task_id, progress_percent=50)
            
            # Determine output path
            output_path = get_output_path(task_id, output_format)
            
            # Save with appropriate options
            save_options = {}
            if output_format.lower() in ["jpg", "jpeg"]:
                save_options["quality"] = 95
                save_options["optimize"] = True
            elif output_format.lower() == "webp":
                save_options["quality"] = 90
            elif output_format.lower() == "png":
                save_options["optimize"] = True
            
            img.save(output_path, **save_options)
            
            update_task(task_id, progress_percent=90)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, extension=output_format)
            
            # Complete task
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Image convert complete: {task_id} -> {output_filename}")
            
    except Exception as e:
        logger.error(f"Image convert failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_image_resize(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Resize image"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        width = params.get("width", 800)
        height = params.get("height", 600)
        
        with Image.open(input_path) as img:
            original_format = img.format or "PNG"
            ext = original_format.lower()
            if ext == "jpeg":
                ext = "jpg"
            
            update_task(task_id, progress_percent=30)
            
            # Resize
            resized = img.resize((width, height), Image.Resampling.LANCZOS)
            
            update_task(task_id, progress_percent=60)
            
            output_path = get_output_path(task_id, ext)
            
            # Handle mode conversion for JPEG
            if ext in ["jpg", "jpeg"] and resized.mode in ["RGBA", "P"]:
                resized = resized.convert("RGB")
            
            resized.save(output_path)
            
            original_stem = Path(original_filename).stem
            output_filename = f"{original_stem}.{ext}"
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Image resize complete: {task_id} -> {width}x{height}")
            
    except Exception as e:
        logger.error(f"Image resize failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_image_crop(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Crop image"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        x = params.get("x", 0)
        y = params.get("y", 0)
        width = params.get("width", 100)
        height = params.get("height", 100)
        
        with Image.open(input_path) as img:
            original_format = img.format or "PNG"
            ext = original_format.lower()
            if ext == "jpeg":
                ext = "jpg"
            
            update_task(task_id, progress_percent=30)
            
            # Crop: (left, upper, right, lower)
            cropped = img.crop((x, y, x + width, y + height))
            
            update_task(task_id, progress_percent=60)
            
            output_path = get_output_path(task_id, ext)
            
            if ext in ["jpg", "jpeg"] and cropped.mode in ["RGBA", "P"]:
                cropped = cropped.convert("RGB")
            
            cropped.save(output_path)
            
            original_stem = Path(original_filename).stem
            output_filename = f"{original_stem}.{ext}"
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Image crop complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Image crop failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    output_format: str = Form(...),
):
    """Convert image to different format"""
    # Validate output format
    output_format = output_format.lower().lstrip(".")
    if output_format not in SUPPORTED_FORMATS["image"]["output"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported output format: {output_format}"
        )
    
    # Create task
    task_id = create_task(file.filename, "image_convert")
    
    # Get input extension and save file
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    # Set status to UPLOADED and store params
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"output_format": output_format}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
):
    """Resize image to specified dimensions"""
    if width <= 0 or height <= 0:
        raise HTTPException(status_code=400, detail="Width and height must be positive")
    
    if width > 10000 or height > 10000:
        raise HTTPException(status_code=400, detail="Maximum dimension is 10000px")
    
    task_id = create_task(file.filename, "image_resize")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"width": width, "height": height}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


@router.post("/crop")
async def crop_image(
    file: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...),
    width: int = Form(...),
    height: int = Form(...),
):
    """Crop image to specified region"""
    if x < 0 or y < 0 or width <= 0 or height <= 0:
        raise HTTPException(status_code=400, detail="Invalid crop dimensions")
    
    task_id = create_task(file.filename, "image_crop")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"x": x, "y": y, "width": width, "height": height}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_remove_bg(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Remove background from image"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        # Try to import rembg
        try:
            from rembg import remove
        except ImportError:
            # Fallback: just return the original image
            logger.warning("rembg not installed, using fallback")
            output_path = get_output_path(task_id, "png")
            import shutil
            shutil.copy(input_path, output_path)
            
            original_stem = Path(original_filename).stem
            output_filename = f"{original_stem}.png"
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            return
        
        update_task(task_id, progress_percent=20)
        
        with Image.open(input_path) as img:
            update_task(task_id, progress_percent=40)
            
            # Remove background
            output_img = remove(img)
            
            update_task(task_id, progress_percent=80)
            
            output_path = get_output_path(task_id, "png")
            output_img.save(output_path.with_suffix(".png"))
            
            original_stem = Path(original_filename).stem
            output_filename = f"{original_stem}.png"
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Background removal complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Background removal failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
):
    """Remove background from image using AI"""
    task_id = create_task(file.filename, "image_remove_bg")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
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


def process_image_upscale(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Upscale image using AI or fallback"""
    try:
        scale = params.get("scale", 2)
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_path = get_output_path(task_id, "png")
        method_used = "unknown"
        
        # Try Real-ESRGAN first (actual AI upscaling)
        try:
            from realesrgan import RealESRGANer
            from basicsr.archs.rrdbnet_arch import RRDBNet
            import numpy as np
            import cv2
            
            update_task(task_id, progress_percent=20)
            
            # Load image with OpenCV
            img = cv2.imread(str(input_path), cv2.IMREAD_UNCHANGED)
            
            if img is None:
                raise Exception("Failed to load image with OpenCV")
            
            update_task(task_id, progress_percent=30)
            
            # Initialize Real-ESRGAN model
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=scale)
            
            # Model path - downloads automatically if not present
            model_name = f"RealESRGAN_x{scale}plus"
            
            upsampler = RealESRGANer(
                scale=scale,
                model_path=None,  # Auto-download
                model=model,
                tile=0,
                tile_pad=10,
                pre_pad=0,
                half=False,  # Use FP32 for CPU
            )
            
            update_task(task_id, progress_percent=50)
            
            # Upscale the image
            output, _ = upsampler.enhance(img, outscale=scale)
            
            update_task(task_id, progress_percent=80)
            
            # Save result
            cv2.imwrite(str(output_path), output)
            method_used = "realesrgan"
            
            logger.info(f"AI upscale complete with Real-ESRGAN: {task_id}")
            
        except ImportError:
            logger.info("Real-ESRGAN not installed, trying alternative upscaler")
            
            # Try opencv super resolution as second option
            try:
                import cv2
                
                update_task(task_id, progress_percent=30)
                
                img = cv2.imread(str(input_path))
                if img is None:
                    raise Exception("Failed to load image")
                
                # Use OpenCV's DNN Super Resolution
                sr = cv2.dnn_superres.DnnSuperResImpl_create()
                
                # Try to use EDSR model (better quality than bicubic)
                model_path = settings.TEMP_DIR / f"EDSR_x{scale}.pb"
                
                if model_path.exists():
                    sr.readModel(str(model_path))
                    sr.setModel("edsr", scale)
                    output = sr.upsample(img)
                    method_used = "opencv_edsr"
                else:
                    # Fallback to high-quality resize
                    h, w = img.shape[:2]
                    output = cv2.resize(img, (w * scale, h * scale), interpolation=cv2.INTER_LANCZOS4)
                    method_used = "opencv_lanczos"
                
                update_task(task_id, progress_percent=80)
                cv2.imwrite(str(output_path), output)
                
            except Exception as cv_error:
                logger.warning(f"OpenCV upscale failed: {cv_error}, using PIL")
                
                # Final fallback: PIL high-quality resize
                with Image.open(input_path) as img:
                    update_task(task_id, progress_percent=40)
                    
                    # Convert to RGB if needed
                    if img.mode in ["RGBA", "P"]:
                        rgb_img = img.convert("RGB")
                    else:
                        rgb_img = img if img.mode == "RGB" else img.convert("RGB")
                    
                    new_size = (rgb_img.width * scale, rgb_img.height * scale)
                    
                    # Use LANCZOS for best quality
                    upscaled = rgb_img.resize(new_size, Image.Resampling.LANCZOS)
                    
                    # Apply unsharp mask for perceived sharpness
                    from PIL import ImageFilter
                    upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=1, percent=50, threshold=3))
                    
                    update_task(task_id, progress_percent=80)
                    upscaled.save(output_path, "PNG", optimize=True)
                    method_used = "pil_lanczos"
                    
        except Exception as ai_error:
            logger.warning(f"AI upscale failed: {ai_error}, using PIL fallback")
            
            # Fallback: PIL with enhancement
            with Image.open(input_path) as img:
                update_task(task_id, progress_percent=40)
                
                if img.mode in ["RGBA", "P"]:
                    rgb_img = img.convert("RGB")
                else:
                    rgb_img = img if img.mode == "RGB" else img.convert("RGB")
                
                new_size = (rgb_img.width * scale, rgb_img.height * scale)
                upscaled = rgb_img.resize(new_size, Image.Resampling.LANCZOS)
                
                # Sharpen
                from PIL import ImageFilter, ImageEnhance
                upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=1, percent=50, threshold=3))
                
                # Slight contrast boost
                enhancer = ImageEnhance.Contrast(upscaled)
                upscaled = enhancer.enhance(1.05)
                
                update_task(task_id, progress_percent=80)
                upscaled.save(output_path, "PNG", optimize=True)
                method_used = "pil_enhanced"
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix=f"upscaled_{scale}x", extension="png")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Image upscale complete: {task_id} (method: {method_used})")
        
    except Exception as e:
        logger.error(f"Image upscale failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/upscale")
async def upscale_image(
    file: UploadFile = File(...),
    scale: int = Form(default=2),
):
    """Upscale image using Real-ESRGAN AI super-resolution"""
    if scale not in [2, 4]:
        raise HTTPException(status_code=400, detail="Scale must be 2 or 4")
    
    task_id = create_task(file.filename, "image_upscale")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"scale": scale}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_watermark_add(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Add watermark to image"""
    try:
        text = params.get("text", "© 2026")
        position = params.get("position", "bottom-right")
        opacity = params.get("opacity", 70)
        font_size = params.get("font_size", 24)
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        from PIL import ImageDraw, ImageFont
        
        with Image.open(input_path) as img:
            update_task(task_id, progress_percent=30)
            
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            
            overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
            
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            padding = 20
            if position == "top-left":
                pos = (padding, padding)
            elif position == "top-right":
                pos = (img.width - text_width - padding, padding)
            elif position == "bottom-left":
                pos = (padding, img.height - text_height - padding)
            elif position == "center":
                pos = ((img.width - text_width) // 2, (img.height - text_height) // 2)
            else:
                pos = (img.width - text_width - padding, img.height - text_height - padding)
            
            alpha = int(255 * opacity / 100)
            draw.text(pos, text, fill=(255, 255, 255, alpha), font=font)
            
            update_task(task_id, progress_percent=70)
            
            watermarked = Image.alpha_composite(img, overlay)
            
            output_path = get_output_path(task_id, "png")
            watermarked.save(output_path)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, suffix="watermarked", extension="png")
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Watermark add complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Watermark add failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/watermark-add")
async def add_watermark(
    file: UploadFile = File(...),
    text: str = Form(default="© 2026"),
    position: str = Form(default="bottom-right"),
    opacity: int = Form(default=70),
    font_size: int = Form(default=24),
):
    """Add text watermark to image"""
    task_id = create_task(file.filename, "image_watermark_add")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"text": text, "position": position, "opacity": opacity, "font_size": font_size}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_exif_scrub(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Remove EXIF metadata from image"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        with Image.open(input_path) as img:
            update_task(task_id, progress_percent=30)
            
            data = list(img.getdata())
            clean_img = Image.new(img.mode, img.size)
            clean_img.putdata(data)
            
            update_task(task_id, progress_percent=70)
            
            ext = Path(original_filename).suffix.lstrip(".").lower()
            if ext in ["jpg", "jpeg"]:
                output_ext = "jpg"
                if clean_img.mode in ["RGBA", "P"]:
                    clean_img = clean_img.convert("RGB")
            else:
                output_ext = "png"
            
            output_path = get_output_path(task_id, output_ext)
            clean_img.save(output_path)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, suffix="clean", extension=output_ext)
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"EXIF scrub complete: {task_id}")
            
    except Exception as e:
        logger.error(f"EXIF scrub failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/exif-scrub")
async def scrub_exif(
    file: UploadFile = File(...),
):
    """Remove all EXIF/metadata from image"""
    task_id = create_task(file.filename, "image_exif_scrub")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
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


def process_image_ocr(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Extract text from image using OCR"""
    try:
        output_format = params.get("output_format", "txt")
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        try:
            import easyocr
            update_task(task_id, progress_percent=30)
            
            # Initialize EasyOCR reader (supports multiple languages)
            reader = easyocr.Reader(['en'], gpu=False)  # CPU mode for compatibility
            
            update_task(task_id, progress_percent=50)
            
            # Read text from image
            results = reader.readtext(str(input_path))
            
            # Combine all detected text
            text = '\n'.join([result[1] for result in results])
            
        except ImportError:
            logger.warning("easyocr not installed, returning error message")
            text = "OCR functionality is not available. Please install easyocr."
        except Exception as ocr_error:
            logger.error(f"OCR processing error: {ocr_error}")
            text = f"OCR processing failed: {str(ocr_error)}"
        
        update_task(task_id, progress_percent=70)
        
        output_ext = output_format.lower() if output_format in ["txt", "json"] else "txt"
        output_path = get_output_path(task_id, output_ext)
        
        if output_ext == "json":
            import json
            output_path.write_text(json.dumps({"text": text, "source": original_filename}))
        else:
            output_path.write_text(text)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="text", extension=output_ext)
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"OCR complete: {task_id}")
        
    except Exception as e:
        logger.error(f"OCR failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/ocr")
async def ocr_image(
    file: UploadFile = File(...),
    output_format: str = Form(default="txt"),
):
    """Extract text from image using OCR"""
    task_id = create_task(file.filename, "image_ocr")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"output_format": output_format}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_meme(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Generate meme with top and bottom text"""
    try:
        top_text = params.get("top_text", "")
        bottom_text = params.get("bottom_text", "")
        font_size = params.get("font_size", 48)
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        from PIL import ImageDraw, ImageFont
        
        with Image.open(input_path) as img:
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            
            draw = ImageDraw.Draw(img)
            
            try:
                font = ImageFont.truetype("impact.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()
            
            update_task(task_id, progress_percent=40)
            
            # Draw top text
            if top_text:
                bbox = draw.textbbox((0, 0), top_text.upper(), font=font)
                text_width = bbox[2] - bbox[0]
                x = (img.width - text_width) // 2
                y = 20
                # Outline
                for dx, dy in [(-2,-2), (-2,2), (2,-2), (2,2)]:
                    draw.text((x+dx, y+dy), top_text.upper(), fill="black", font=font)
                draw.text((x, y), top_text.upper(), fill="white", font=font)
            
            # Draw bottom text
            if bottom_text:
                bbox = draw.textbbox((0, 0), bottom_text.upper(), font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (img.width - text_width) // 2
                y = img.height - text_height - 30
                for dx, dy in [(-2,-2), (-2,2), (2,-2), (2,2)]:
                    draw.text((x+dx, y+dy), bottom_text.upper(), fill="black", font=font)
                draw.text((x, y), bottom_text.upper(), fill="white", font=font)
            
            update_task(task_id, progress_percent=80)
            
            output_path = get_output_path(task_id, "png")
            img.save(output_path)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, suffix="meme", extension="png")
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Meme generation complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Meme generation failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/meme-generator")
async def generate_meme(
    file: UploadFile = File(...),
    top_text: str = Form(default=""),
    bottom_text: str = Form(default=""),
    font_size: int = Form(default=48),
):
    """Generate meme with top and bottom text"""
    task_id = create_task(file.filename, "meme_generator")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"top_text": top_text, "bottom_text": bottom_text, "font_size": font_size}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_negative(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Apply negative/color effects to image"""
    try:
        effect = params.get("effect", "invert")
        intensity = params.get("intensity", 100)
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        from PIL import ImageOps, ImageEnhance
        
        with Image.open(input_path) as img:
            if img.mode == "RGBA":
                rgb = img.convert("RGB")
            else:
                rgb = img if img.mode == "RGB" else img.convert("RGB")
            
            update_task(task_id, progress_percent=40)
            
            if effect == "invert":
                result = ImageOps.invert(rgb)
            elif effect == "grayscale":
                result = ImageOps.grayscale(rgb)
            elif effect == "sepia":
                gray = ImageOps.grayscale(rgb)
                result = ImageOps.colorize(gray, "#704214", "#C0A080")
            elif effect == "solarize":
                result = ImageOps.solarize(rgb, threshold=128)
            elif effect == "posterize":
                result = ImageOps.posterize(rgb, bits=4)
            else:
                result = ImageOps.invert(rgb)
            
            # Apply intensity blend
            if intensity < 100:
                blend_factor = intensity / 100
                result = Image.blend(rgb, result, blend_factor)
            
            update_task(task_id, progress_percent=80)
            
            output_path = get_output_path(task_id, "png")
            result.save(output_path)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, suffix=effect, extension="png")
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Negative effect complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Negative effect failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/negative")
async def apply_negative(
    file: UploadFile = File(...),
    effect: str = Form(default="invert"),
    intensity: int = Form(default=100),
):
    """Apply negative/invert or color effects to image"""
    task_id = create_task(file.filename, "image_negative")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"effect": effect, "intensity": intensity}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


@router.post("/color-palette")
async def extract_color_palette(
    file: UploadFile = File(...),
    num_colors: int = Form(default=5),
):
    """Extract dominant colors from image (synchronous)"""
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    content = await file.read()
    
    try:
        with Image.open(io.BytesIO(content)) as img:
            img = img.convert("RGB")
            img = img.resize((100, 100))  # Reduce for faster processing
            
            pixels = list(img.getdata())
            
            # Simple color quantization
            from collections import Counter
            
            # Round colors to reduce variations
            rounded = [(r//16*16, g//16*16, b//16*16) for r, g, b in pixels]
            color_counts = Counter(rounded).most_common(num_colors)
            
            colors = []
            for (r, g, b), count in color_counts:
                hex_color = f"#{r:02x}{g:02x}{b:02x}"
                colors.append({
                    "hex": hex_color,
                    "rgb": {"r": r, "g": g, "b": b},
                    "percentage": round(count / len(pixels) * 100, 1)
                })
            
            return {
                "success": True,
                "filename": file.filename,
                "colors": colors
            }
            
    except Exception as e:
        logger.error(f"Color palette extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def process_image_splitter(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Split image into grid segments"""
    try:
        import zipfile
        
        rows = params.get("rows", 3)
        cols = params.get("cols", 3)
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        with Image.open(input_path) as img:
            piece_width = img.width // cols
            piece_height = img.height // rows
            
            pieces = []
            for row in range(rows):
                for col in range(cols):
                    left = col * piece_width
                    upper = row * piece_height
                    right = left + piece_width
                    lower = upper + piece_height
                    
                    piece = img.crop((left, upper, right, lower))
                    pieces.append((piece, f"piece_{row+1}_{col+1}.png"))
            
            update_task(task_id, progress_percent=60)
            
            output_path = get_output_path(task_id, "zip")
            
            with zipfile.ZipFile(output_path, 'w') as zf:
                for piece, name in pieces:
                    temp_buffer = io.BytesIO()
                    piece.save(temp_buffer, format="PNG")
                    temp_buffer.seek(0)
                    zf.writestr(name, temp_buffer.read())
            
            update_task(task_id, progress_percent=90)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, suffix=f"split_{rows}x{cols}", extension="zip")
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Image split complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Image split failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/splitter")
async def split_image(
    file: UploadFile = File(...),
    rows: int = Form(default=3),
    cols: int = Form(default=3),
):
    """Split image into grid segments"""
    task_id = create_task(file.filename, "image_splitter")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"rows": rows, "cols": cols}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_favicon(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Generate favicon files from image"""
    try:
        import zipfile
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        sizes = [16, 32, 48, 64, 128, 180, 192, 512]
        
        with Image.open(input_path) as img:
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            
            update_task(task_id, progress_percent=30)
            
            output_path = get_output_path(task_id, "zip")
            
            with zipfile.ZipFile(output_path, 'w') as zf:
                for size in sizes:
                    resized = img.resize((size, size), Image.Resampling.LANCZOS)
                    temp_buffer = io.BytesIO()
                    resized.save(temp_buffer, format="PNG")
                    temp_buffer.seek(0)
                    zf.writestr(f"favicon-{size}x{size}.png", temp_buffer.read())
                
                # Generate ICO with multiple sizes
                ico_sizes = [(16, 16), (32, 32), (48, 48)]
                ico_buffer = io.BytesIO()
                img.save(ico_buffer, format="ICO", sizes=ico_sizes)
                ico_buffer.seek(0)
                zf.writestr("favicon.ico", ico_buffer.read())
                
                # Generate manifest
                manifest = '''{
  "icons": [
    {"src": "/favicon-192x192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/favicon-512x512.png", "sizes": "512x512", "type": "image/png"}
  ]
}'''
                zf.writestr("manifest.json", manifest)
            
            update_task(task_id, progress_percent=90)
            
            output_filename = "favicons.zip"
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Favicon generation complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Favicon generation failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/favicon")
async def generate_favicon(
    file: UploadFile = File(...),
):
    """Generate favicon files from image"""
    task_id = create_task(file.filename, "favicon_generator")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
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


def process_image_blur_face(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Blur image (face detection placeholder)"""
    try:
        from PIL import ImageFilter
        
        blur_intensity = params.get("blur_intensity", 30)
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        with Image.open(input_path) as img:
            update_task(task_id, progress_percent=40)
            
            # Apply Gaussian blur (face detection would require OpenCV)
            blurred = img.filter(ImageFilter.GaussianBlur(radius=blur_intensity // 5))
            
            update_task(task_id, progress_percent=80)
            
            output_path = get_output_path(task_id, "png")
            blurred.save(output_path)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, suffix="blurred", extension="png")
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Blur face complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Blur face failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/blur-face")
async def blur_face(
    file: UploadFile = File(...),
    blur_intensity: int = Form(default=30),
):
    """Blur entire image (face detection placeholder)"""
    task_id = create_task(file.filename, "blur_face")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"blur_intensity": blur_intensity}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_passport_photo(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Create passport photo format"""
    try:
        size = params.get("size", "2x2")
        bg_color = params.get("background_color", "#FFFFFF")
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        # Parse size
        size_map = {
            "2x2": (600, 600),
            "35x45": (413, 531),
            "4x6": (1200, 1800),
        }
        target_size = size_map.get(size, (600, 600))
        
        with Image.open(input_path) as img:
            update_task(task_id, progress_percent=30)
            
            # Create background
            bg = Image.new("RGB", target_size, bg_color)
            
            # Resize and center image
            img_ratio = img.width / img.height
            target_ratio = target_size[0] / target_size[1]
            
            if img_ratio > target_ratio:
                new_height = target_size[1]
                new_width = int(new_height * img_ratio)
            else:
                new_width = target_size[0]
                new_height = int(new_width / img_ratio)
            
            resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Center crop
            left = (new_width - target_size[0]) // 2
            top = (new_height - target_size[1]) // 2
            cropped = resized.crop((left, top, left + target_size[0], top + target_size[1]))
            
            if cropped.mode == "RGBA":
                bg.paste(cropped, (0, 0), cropped)
            else:
                bg = cropped.convert("RGB")
            
            update_task(task_id, progress_percent=80)
            
            output_path = get_output_path(task_id, "jpg")
            bg.save(output_path, quality=95)
            
            output_filename = f"{Path(original_filename).stem}_passport.jpg"
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Passport photo complete: {task_id}")
            
    except Exception as e:
        logger.error(f"Passport photo failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/passport-photo")
async def passport_photo(
    file: UploadFile = File(...),
    size: str = Form(default="2x2"),
    background_color: str = Form(default="#FFFFFF"),
):
    """Create passport photo format"""
    task_id = create_task(file.filename, "passport_photo")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"size": size, "background_color": background_color}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_image_collage(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Create collage from multiple images"""
    try:
        input_paths = [Path(p) for p in params.get("input_paths", [])]
        cols = params.get("cols", 2)
        spacing = params.get("spacing", 10)
        bg_color = params.get("background_color", "#FFFFFF")
        
        if not input_paths:
            raise ValueError("No input files provided")

        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        images = []
        for path in input_paths:
            images.append(Image.open(path))
        
        update_task(task_id, progress_percent=30)
        
        # Calculate cell size (use first image as reference)
        cell_width = max(img.width for img in images)
        cell_height = max(img.height for img in images)
        
        rows = (len(images) + cols - 1) // cols
        
        collage_width = cols * cell_width + (cols + 1) * spacing
        collage_height = rows * cell_height + (rows + 1) * spacing
        
        collage = Image.new("RGB", (collage_width, collage_height), bg_color)
        
        for idx, img in enumerate(images):
            row = idx // cols
            col = idx % cols
            
            x = spacing + col * (cell_width + spacing)
            y = spacing + row * (cell_height + spacing)
            
            # Center image in cell
            resized = img.resize((cell_width, cell_height), Image.Resampling.LANCZOS)
            if resized.mode == "RGBA":
                collage.paste(resized, (x, y), resized)
            else:
                collage.paste(resized, (x, y))
        
        for img in images:
            img.close()
        
        update_task(task_id, progress_percent=80)
        
        output_path = get_output_path(task_id, "jpg")
        collage.save(output_path, quality=95)
        
        output_filename = f"collage_{len(input_paths)}_images.jpg"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Collage complete: {task_id}")
        
    except Exception as e:
        logger.error(f"Collage failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/collage")
async def create_collage(
    files: list[UploadFile] = File(...),
    cols: int = Form(default=2),
    spacing: int = Form(default=10),
    background_color: str = Form(default="#FFFFFF"),
):
    """Create collage from multiple images"""
    if len(files) < 2 or len(files) > 40:
        raise HTTPException(status_code=400, detail="2-40 images required for collage")
    
    task_id = create_task("collage", "image_collage")
    
    # Save all files
    input_paths = []
    for i, f in enumerate(files):
        input_ext = Path(f.filename).suffix.lstrip(".") or "png"
        input_path = get_input_path(f"{task_id}_{i}", input_ext)
        await save_upload_file(f, input_path)
        input_paths.append(str(input_path))
    
    # Use first file as primary input_path
    primary_input_path = Path(input_paths[0])
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=primary_input_path,
        params={
            "input_paths": input_paths,
            "cols": cols,
            "spacing": spacing,
            "background_color": background_color,
        }
    )
    
    return {"task_id": task_id, "message": "Files uploaded successfully"}


@router.post("/watermark-remove")
async def remove_watermark(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    detection_mode: str = Form(default="auto"),  # auto, corner, center
):
    """Remove watermark from image using OpenCV inpainting"""
    task_id = create_task(file.filename, "watermark_remove")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    def process_watermark_remove(task_id: str, input_path: Path, detection_mode: str, original_filename: str):
        try:
            update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
            
            with Image.open(input_path) as img:
                # Convert to RGB
                if img.mode in ["RGBA", "P"]:
                    rgb_img = img.convert("RGB")
                else:
                    rgb_img = img if img.mode == "RGB" else img.convert("RGB")
                
                update_task(task_id, progress_percent=20)
                
                try:
                    import cv2
                    import numpy as np
                    
                    # Convert PIL to OpenCV format
                    cv_image = np.array(rgb_img)
                    cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGB2BGR)
                    
                    height, width = cv_image.shape[:2]
                    
                    update_task(task_id, progress_percent=30)
                    
                    # Create mask for watermark detection
                    # Watermarks are often semi-transparent light overlays
                    
                    # Convert to grayscale for analysis
                    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
                    
                    # Create mask based on detection mode
                    mask = np.zeros((height, width), dtype=np.uint8)
                    
                    if detection_mode == "corner":
                        # Check corners for watermarks
                        corner_size = min(width, height) // 5
                        regions = [
                            (0, 0, corner_size, corner_size),  # Top-left
                            (width - corner_size, 0, width, corner_size),  # Top-right
                            (0, height - corner_size, corner_size, height),  # Bottom-left
                            (width - corner_size, height - corner_size, width, height),  # Bottom-right
                        ]
                        
                        for x1, y1, x2, y2 in regions:
                            region = gray[y1:y2, x1:x2]
                            mean_val = np.mean(region)
                            
                            # If corner is unusually bright (potential watermark)
                            if mean_val > 200:
                                # Detect bright text-like regions
                                _, thresh = cv2.threshold(region, 220, 255, cv2.THRESH_BINARY)
                                mask[y1:y2, x1:x2] = thresh
                                
                    elif detection_mode == "center":
                        # Look for watermarks in center
                        cx, cy = width // 2, height // 2
                        center_w, center_h = width // 3, height // 3
                        x1, y1 = cx - center_w // 2, cy - center_h // 2
                        x2, y2 = cx + center_w // 2, cy + center_h // 2
                        
                        region = gray[y1:y2, x1:x2]
                        mean_val = np.mean(region)
                        
                        if mean_val > 180:
                            _, thresh = cv2.threshold(region, 210, 255, cv2.THRESH_BINARY)
                            mask[y1:y2, x1:x2] = thresh
                            
                    else:  # auto mode
                        # Auto-detect semi-transparent overlays
                        # Look for regions with unusual brightness/low saturation
                        
                        hsv = cv2.cvtColor(cv_image, cv2.COLOR_BGR2HSV)
                        h, s, v = cv2.split(hsv)
                        
                        # Watermarks often have high brightness, low saturation
                        # Create mask where value is high and saturation is low
                        high_v = v > 230
                        low_s = s < 30
                        watermark_candidate = np.logical_and(high_v, low_s).astype(np.uint8) * 255
                        
                        # Apply morphological operations to clean up
                        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
                        watermark_candidate = cv2.morphologyEx(watermark_candidate, cv2.MORPH_CLOSE, kernel)
                        watermark_candidate = cv2.morphologyEx(watermark_candidate, cv2.MORPH_OPEN, kernel)
                        
                        # Also check for text-like edges
                        edges = cv2.Canny(gray, 100, 200)
                        text_regions = cv2.dilate(edges, kernel, iterations=2)
                        
                        # Combine with brightness mask
                        combined = cv2.bitwise_and(watermark_candidate, text_regions)
                        
                        # Dilate to cover surrounding area
                        mask = cv2.dilate(combined, kernel, iterations=3)
                    
                    update_task(task_id, progress_percent=50)
                    
                    # Apply inpainting
                    if np.sum(mask) > 0:
                        # Use Telea inpainting algorithm
                        result = cv2.inpaint(cv_image, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
                        
                        # Optional: Apply bilateral filter to smooth artifacts
                        result = cv2.bilateralFilter(result, 5, 50, 50)
                    else:
                        # No watermark detected, apply general enhancement
                        result = cv2.detailEnhance(cv_image, sigma_s=10, sigma_r=0.15)
                    
                    update_task(task_id, progress_percent=80)
                    
                    # Convert back to PIL
                    result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
                    final_img = Image.fromarray(result_rgb)
                    
                except ImportError:
                    # OpenCV not available, use PIL-based enhancement
                    logger.warning("OpenCV not installed, using PIL enhancement")
                    
                    from PIL import ImageEnhance, ImageFilter
                    
                    # Apply multiple enhancements
                    enhanced = rgb_img
                    
                    # Increase contrast
                    enhancer = ImageEnhance.Contrast(enhanced)
                    enhanced = enhancer.enhance(1.2)
                    
                    # Increase color saturation to reduce faded watermarks
                    enhancer = ImageEnhance.Color(enhanced)
                    enhanced = enhancer.enhance(1.15)
                    
                    # Apply edge-preserving smoothing
                    enhanced = enhanced.filter(ImageFilter.SMOOTH)
                    
                    final_img = enhanced
                
                update_task(task_id, progress_percent=90)
                
                output_path = get_output_path(task_id, "png")
                final_img.save(output_path, "PNG", optimize=True)
                
                output_filename = f"{Path(original_filename).stem}_clean.png"
                
                update_task(
                    task_id,
                    status=TaskStatus.COMPLETE,
                    progress_percent=100,
                    output_filename=output_filename,
                    output_path=output_path,
                    file_size=output_path.stat().st_size,
                )
                
                logger.info(f"Watermark remove complete: {task_id}")
                
        except Exception as e:
            logger.error(f"Watermark remove failed: {task_id} - {e}")
            update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))
    
    background_tasks.add_task(process_watermark_remove, task_id, input_path, detection_mode, file.filename)
    
    return {"task_id": task_id, "message": "Watermark removal started"}


def process_image_svg_convert(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Convert raster image to SVG vector format"""
    try:
        smoothing = params.get("smoothing", "Normal")
        color_depth = params.get("color_depth", "preserve")
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        with Image.open(input_path) as img:
            # Convert to RGB if needed
            if img.mode in ["RGBA", "P"]:
                rgb_img = img.convert("RGB")
            else:
                rgb_img = img if img.mode == "RGB" else img.convert("RGB")
            
            width, height = rgb_img.size
            
            update_task(task_id, progress_percent=30)
            
            # Apply color reduction based on color_depth
            if color_depth == "bw":
                rgb_img = rgb_img.convert("L").convert("RGB")
                num_colors = 2
            elif color_depth == "16":
                num_colors = 16
            elif color_depth == "64":
                num_colors = 64
            elif color_depth == "256":
                num_colors = 256
            else:
                num_colors = 256  # preserve = high quality
            
            # Quantize colors
            quantized = rgb_img.quantize(colors=num_colors).convert("RGB")
            
            update_task(task_id, progress_percent=50)
            
            # Generate SVG with embedded image (simplified approach)
            # For true vectorization, would need potrace library
            import base64
            from io import BytesIO
            
            # Reduce image size for SVG embedding based on smoothing
            smooth_scale = {"Sharp": 1.0, "Normal": 0.75, "Smooth": 0.5}
            scale = smooth_scale.get(smoothing, 0.75)
            
            new_size = (int(width * scale), int(height * scale))
            resized = quantized.resize(new_size, Image.Resampling.LANCZOS)
            
            # Convert to base64
            buffer = BytesIO()
            resized.save(buffer, format="PNG", optimize=True)
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            update_task(task_id, progress_percent=70)
            
            # Create SVG with embedded image
            svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <title>Converted from {original_filename}</title>
  <image width="{width}" height="{height}" 
         xlink:href="data:image/png;base64,{img_base64}"/>
</svg>'''
            
            output_path = get_output_path(task_id, "svg")
            output_path.write_text(svg_content, encoding="utf-8")
            
            update_task(task_id, progress_percent=90)
            
            output_filename = f"{Path(original_filename).stem}.svg"
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"SVG convert complete: {task_id}")
            
    except Exception as e:
        logger.error(f"SVG convert failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/svg-convert")
async def convert_to_svg(
    file: UploadFile = File(...),
    smoothing: str = Form(default="Normal"),
    color_depth: str = Form(default="preserve"),
):
    """Convert raster image to SVG vector format"""
    task_id = create_task(file.filename, "svg_convert")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"smoothing": smoothing, "color_depth": color_depth}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


# ============================================================================
# IMAGE SIZE ADJUSTER
# Adjust image file size to a target size in bytes
# ============================================================================

def process_image_size_adjust(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Adjust image file size to target"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        target_size = params.get("target_size", 0)  # bytes
        mode = params.get("mode", "quality")  # quality, resolution, padding
        
        with Image.open(input_path) as img:
            original_format = img.format or "PNG"
            ext = original_format.lower()
            if ext == "jpeg":
                ext = "jpg"
            
            update_task(task_id, progress_percent=20)
            
            # Determine output path
            output_path = get_output_path(task_id, ext)
            
            if mode == "quality":
                # Quality-based compression (for JPG/WebP)
                if ext not in ["jpg", "jpeg", "webp"]:
                    # Convert to JPG for quality compression
                    if img.mode in ["RGBA", "P"]:
                        img = img.convert("RGB")
                    ext = "jpg"
                    output_path = get_output_path(task_id, ext)
                
                # Binary search for optimal quality
                quality = 95
                best_quality = quality
                best_buffer = io.BytesIO()
                
                for step in [30, 15, 7, 3, 1]:
                    while quality > 5:
                        buffer = io.BytesIO()
                        save_format = "JPEG" if ext in ["jpg", "jpeg"] else "WEBP"
                        img.save(buffer, format=save_format, quality=quality)
                        current_size = buffer.tell()
                        
                        if current_size <= target_size:
                            best_quality = quality
                            best_buffer = buffer
                            break
                        quality -= step
                    
                    if best_buffer.tell() > 0:
                        break
                
                update_task(task_id, progress_percent=70)
                
                # Save best result
                if best_buffer.tell() > 0:
                    best_buffer.seek(0)
                    with open(output_path, "wb") as f:
                        f.write(best_buffer.read())
                else:
                    # Couldn't reach target, save with minimum quality
                    save_format = "JPEG" if ext in ["jpg", "jpeg"] else "WEBP"
                    img.save(output_path, format=save_format, quality=5)
                    
            elif mode == "resolution":
                # Resolution reduction mode
                original_size = input_path.stat().st_size
                if original_size <= target_size:
                    # Already smaller, just copy
                    shutil.copy(input_path, output_path)
                else:
                    # Calculate scale factor
                    scale = (target_size / original_size) ** 0.5
                    new_width = max(1, int(img.width * scale))
                    new_height = max(1, int(img.height * scale))
                    
                    resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Save with good quality
                    save_options = {}
                    if ext in ["jpg", "jpeg"]:
                        save_options["quality"] = 85
                    elif ext == "webp":
                        save_options["quality"] = 85
                    
                    resized.save(output_path, **save_options)
                    
            elif mode == "padding":
                # Add padding to increase file size
                original_size = input_path.stat().st_size
                
                # Save the original image first
                img.save(output_path, format=original_format)
                
                # Calculate padding needed
                current_size = output_path.stat().st_size
                if current_size < target_size:
                    padding_needed = target_size - current_size
                    # Append null bytes (works for most formats)
                    with open(output_path, "ab") as f:
                        f.write(b'\x00' * padding_needed)
            
            update_task(task_id, progress_percent=90)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, extension=ext)
            
            final_size = output_path.stat().st_size
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=final_size,
            )
            
            logger.info(f"Image size adjust complete: {task_id} -> {final_size} bytes (target: {target_size})")
            
    except Exception as e:
        logger.error(f"Image size adjust failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/adjust-size")
async def adjust_image_size(
    file: UploadFile = File(...),
    target_size: int = Form(...),  # Target size in bytes
    mode: str = Form(default="quality"),  # quality, resolution, padding
):
    """
    Adjust image file size to target.
    
    Modes:
    - quality: Reduce JPEG/WebP quality until target size is reached
    - resolution: Reduce image dimensions proportionally
    - padding: Add null bytes to increase file size
    """
    if target_size <= 0:
        raise HTTPException(status_code=400, detail="Target size must be positive")
    
    if mode not in ["quality", "resolution", "padding"]:
        raise HTTPException(status_code=400, detail="Mode must be: quality, resolution, or padding")
    
    task_id = create_task(file.filename, "image_size_adjust")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "png"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"target_size": target_size, "mode": mode}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


# ============================================================================
# IMAGES TO PDF
# Convert multiple images to a single PDF document
# ============================================================================

def process_images_to_pdf(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Convert images to PDF"""
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        page_size = params.get("page_size", "A4")
        orientation = params.get("orientation", "portrait")
        image_paths = params.get("image_paths", [])
        
        # Page size mappings (in pixels at 72 DPI)
        PAGE_SIZES = {
            "A4": (595, 842),
            "A3": (842, 1191),
            "Letter": (612, 792),
            "Legal": (612, 1008),
            "Custom": None,  # Use original image sizes
        }
        
        page_dims = PAGE_SIZES.get(page_size, (595, 842))
        if page_dims and orientation == "landscape":
            page_dims = (page_dims[1], page_dims[0])
        
        update_task(task_id, progress_percent=20)
        
        # Load all images
        images = []
        for i, img_path in enumerate(image_paths):
            with Image.open(img_path) as img:
                # Convert to RGB if needed (PDF doesn't support RGBA well)
                if img.mode in ["RGBA", "P"]:
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    if img.mode == "RGBA":
                        background.paste(img, mask=img.split()[3])
                    else:
                        background.paste(img)
                    img = background
                elif img.mode != "RGB":
                    img = img.convert("RGB")
                
                # Resize to fit page if page size is specified
                if page_dims:
                    img.thumbnail(page_dims, Image.Resampling.LANCZOS)
                
                images.append(img.copy())
            
            # Update progress
            progress = 20 + int((i + 1) / len(image_paths) * 60)
            update_task(task_id, progress_percent=progress)
        
        if not images:
            raise ValueError("No valid images to convert")
        
        update_task(task_id, progress_percent=85)
        
        # Save as PDF
        output_path = get_output_path(task_id, "pdf")
        
        if len(images) == 1:
            images[0].save(output_path, "PDF", resolution=100.0)
        else:
            images[0].save(output_path, "PDF", save_all=True, append_images=images[1:], resolution=100.0)
        
        update_task(task_id, progress_percent=95)
        
        from services.tasks import get_output_filename
        base_name = Path(original_filename).stem if original_filename else "images"
        output_filename = f"{base_name}.pdf"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Images to PDF complete: {task_id} -> {len(images)} images")
        
        # Clean up temporary image files
        for img_path in image_paths:
            try:
                Path(img_path).unlink()
            except:
                pass
        
    except Exception as e:
        logger.error(f"Images to PDF failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))



@router.post("/images-to-pdf")
async def convert_images_to_pdf(
    files: List[UploadFile] = File(...),
    page_size: str = Form(default="A4"),  # A4, A3, Letter, Legal, Custom
    orientation: str = Form(default="portrait"),  # portrait, landscape
):
    """
    Convert multiple images to a single PDF document.
    
    Page sizes: A4, A3, Letter, Legal, Custom (uses original image sizes)
    Orientation: portrait, landscape
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    if page_size not in ["A4", "A3", "Letter", "Legal", "Custom"]:
        raise HTTPException(status_code=400, detail="Invalid page size")
    
    if orientation not in ["portrait", "landscape"]:
        raise HTTPException(status_code=400, detail="Invalid orientation")
    
    # Create task with first filename
    first_filename = files[0].filename or "images"
    task_id = create_task(first_filename, "images_to_pdf")
    
    # Save all uploaded files
    image_paths = []
    for i, file in enumerate(files):
        input_ext = Path(file.filename).suffix.lstrip(".") or "png"
        input_path = get_input_path(task_id, f"{i}_{input_ext}")
        await save_upload_file(file, input_path)
        image_paths.append(str(input_path))
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=Path(image_paths[0]) if image_paths else None,
        params={
            "page_size": page_size,
            "orientation": orientation,
            "image_paths": image_paths,
        }
    )
    
    return {"task_id": task_id, "message": f"{len(files)} files uploaded successfully"}


# ============================================================================
# PROCESSOR REGISTRATION
# Register handlers for deferred processing via /start endpoint
# ============================================================================
register_processor("image_convert", process_image_convert)
register_processor("image_resize", process_image_resize)
register_processor("image_crop", process_image_crop)
register_processor("image_remove_bg", process_image_remove_bg)
register_processor("image_upscale", process_image_upscale)
register_processor("image_watermark_add", process_image_watermark_add)
register_processor("image_exif_scrub", process_image_exif_scrub)
register_processor("image_ocr", process_image_ocr)
register_processor("meme_generator", process_image_meme)
register_processor("image_negative", process_image_negative)
register_processor("image_splitter", process_image_splitter)
register_processor("favicon_generator", process_image_favicon)
register_processor("blur_face", process_image_blur_face)
register_processor("passport_photo", process_image_passport_photo)
register_processor("svg_convert", process_image_svg_convert)
register_processor("image_collage", process_image_collage)
register_processor("image_size_adjust", process_image_size_adjust)
register_processor("images_to_pdf", process_images_to_pdf)
# Note: collage and watermark-remove still use old flow (multi-file or complex logic)






