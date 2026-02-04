from fastapi import APIRouter, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import uuid
import os
import io
from typing import List, Optional
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw, ImageFont
import json
import asyncio

router = APIRouter(prefix="/api/image", tags=["Image Editor"])

TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

# --- HELPER FUNCTIONS ---

def apply_adjustments(img: Image.Image, adjustments: dict) -> Image.Image:
    # Adjustments map: property -> PIL Enhancer
    # Brightness
    if 'brightness' in adjustments:
        enhancer = ImageEnhance.Brightness(img)
        # Frontend sends 0-200, 100 is default. PIL 1.0 is default.
        factor = float(adjustments['brightness']) / 100.0
        img = enhancer.enhance(factor)
    
    # Contrast
    if 'contrast' in adjustments:
        enhancer = ImageEnhance.Contrast(img)
        factor = float(adjustments['contrast']) / 100.0
        img = enhancer.enhance(factor)
        
    # Saturation (Color)
    if 'saturate' in adjustments:
        enhancer = ImageEnhance.Color(img)
        factor = float(adjustments['saturate']) / 100.0
        img = enhancer.enhance(factor)
        
    # Grayscale
    if adjustments.get('grayscale', 0) > 0:
        # Simple convert if 100%, otherwise blend
        gray = ImageOps.grayscale(img).convert("RGB")
        factor = float(adjustments['grayscale']) / 100.0
        img = Image.blend(img, gray, factor)
        
    # Blur
    if adjustments.get('blur', 0) > 0:
        radius = float(adjustments['blur'])
        img = img.filter(ImageFilter.GaussianBlur(radius))
        
    # Sharpen
    if adjustments.get('sharpen', False):
         img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
         
    # Rotation
    rotate = adjustments.get('rotate', 0)
    if rotate != 0:
        img = img.rotate(-rotate, expand=True) # Negative to match CSS clockwise
        
    # Flips
    if adjustments.get('flipH', 1) == -1:
        img = ImageOps.mirror(img)
    if adjustments.get('flipV', 1) == -1:
        img = ImageOps.flip(img)
        
    return img

def create_collage_task(task_id: str, files: List[tuple], layout_id: str, spacing: int, bg_color: str, aspect_ratio: float):
    try:
        images = [Image.open(io.BytesIO(b)).convert("RGBA") for _, b in files]
        
        # Determine canvas size based on first image or fixed standard
        # Let's target a high res standard width
        target_width = 2000
        target_height = int(target_width / aspect_ratio)
        
        canvas = Image.new("RGBA", (target_width, target_height), bg_color)
        
        # Simple Layout Logic (mapping IDs to basic grids)
        # This mirrors the frontend logic roughly
        count = len(images)
        rows, cols = 1, 1
        
        if layout_id == '2h': rows, cols = 2, 1
        elif layout_id == '2v': rows, cols = 1, 2
        elif layout_id == '4grid' or layout_id == 'pp-4': rows, cols = 2, 2
        elif layout_id == '9grid': rows, cols = 3, 3
        # Default fallback to grid
        else:
             import math
             cols = math.ceil(math.sqrt(count))
             rows = math.ceil(count / cols)
             
        cell_w = (target_width - (cols + 1) * spacing) // cols
        cell_h = (target_height - (rows + 1) * spacing) // rows
        
        draw = ImageDraw.Draw(canvas)
        
        idx = 0
        for r in range(rows):
            for c in range(cols):
                if idx >= count: break
                
                img = images[idx]
                # Cover fit
                img_ratio = img.width / img.height
                cell_ratio = cell_w / cell_h
                
                if img_ratio > cell_ratio:
                    # Image is wider, crop width
                    new_h = cell_h
                    new_w = int(new_h * img_ratio)
                    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    # Center crop
                    left = (new_w - cell_w) // 2
                    img = img.crop((left, 0, left + cell_w, cell_h))
                else:
                    # Image is taller, crop height
                    new_w = cell_w
                    new_h = int(new_w / img_ratio)
                    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    top = (new_h - cell_h) // 2
                    img = img.crop((0, top, cell_w, top + cell_h))
                    
                x = spacing + c * (cell_w + spacing)
                y = spacing + r * (cell_h + spacing)
                
                canvas.paste(img, (x, y))
                idx += 1
                
        output_path = os.path.join(TEMP_DIR, f"{task_id}.png")
        canvas.save(output_path, "PNG")
        
    except Exception as e:
        print(f"Error processing task {task_id}: {e}")
        # Write error file
        with open(os.path.join(TEMP_DIR, f"{task_id}.error"), "w") as f:
            f.write(str(e))

def process_image_task(task_id: str, file_bytes: bytes, settings: dict):
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img = apply_adjustments(img, settings)
        
        output_path = os.path.join(TEMP_DIR, f"{task_id}.png")
        img.save(output_path, "PNG", quality=95)
    except Exception as e:
         with open(os.path.join(TEMP_DIR, f"{task_id}.error"), "w") as f:
            f.write(str(e))

# --- ROUTES ---

@router.post("/process")
async def process_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    settings: str = Form(...) # JSON string
):
    task_id = str(uuid.uuid4())
    try:
        settings_dict = json.loads(settings)
        file_bytes = await file.read()
        
        # Write pending status
        with open(os.path.join(TEMP_DIR, f"{task_id}.json"), "w") as f:
             json.dump({"status": "processing"}, f)
             
        background_tasks.add_task(process_image_task, task_id, file_bytes, settings_dict)
        
        return {"task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/collage")
async def create_collage(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    layout: str = Form(...),
    spacing: int = Form(10),
    bgcolor: str = Form("#ffffff"),
    aspect: float = Form(1.0)
):
    task_id = str(uuid.uuid4())
    try:
        # Read all files into memory (careful with size, but user said 20-30 tools not explicitly 100MB files, assuming reasonable use)
        file_data = []
        for f in files:
            b = await f.read()
            file_data.append((f.filename, b))
            
        with open(os.path.join(TEMP_DIR, f"{task_id}.json"), "w") as f:
             json.dump({"status": "processing"}, f)
             
        background_tasks.add_task(create_collage_task, task_id, file_data, layout, spacing, bgcolor, aspect)
        
        return {"task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-remove-bg")
async def ai_remove_bg(file: UploadFile = File(...)):
    """Remove background using Rembg"""
    try:
        from rembg import remove
        input_data = await file.read()
        output_data = remove(input_data)
        
        # Save output to temp folder for retrieval (Subject to 30 min cleanup)
        filename = f"nobg-{uuid.uuid4()}.png"
        path = os.path.join(TEMP_DIR, filename)
        
        with open(path, "wb") as f:
            f.write(output_data)
            
        return {"url": f"/temp/{filename}"}
    except ImportError:
         raise HTTPException(status_code=500, detail="Rembg library not installed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
