"""
Document processing routes
"""

import logging
import json
import csv
import io
import os
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException

from services.tasks import (
    create_task, update_task, get_input_path, get_output_path, TaskStatus
)
from config import get_settings
from routes.core import register_processor

router = APIRouter()
settings = get_settings()
logger = logging.getLogger("magetool.document")


import shutil

async def save_upload_file(upload_file: UploadFile, destination: Path):
    """Save uploaded file to disk using streaming to prevent OOM"""
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return destination.stat().st_size
    finally:
        await upload_file.close()


def process_document_convert(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Convert document format"""
    output_format = params.get("output_format", "txt")
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        input_ext = input_path.suffix.lstrip(".").lower()
        output_path = get_output_path(task_id, output_format)
        
        update_task(task_id, progress_percent=30)
        
        # Handle different conversion types
        # ==========================================
        # EXCEL/PPT TO PDF (LibreOffice)
        # ==========================================
        if input_ext in ["xlsx", "xls", "pptx", "ppt", "odp", "ods"] and output_format == "pdf":
            import subprocess
            import shutil
            
            # Find LibreOffice executable
            libreoffice_cmd = None
            for cmd in ["libreoffice", "soffice", "/usr/bin/libreoffice", "/usr/bin/soffice"]:
                if shutil.which(cmd):
                    libreoffice_cmd = cmd
                    break
            
            if not libreoffice_cmd:
                raise Exception("LibreOffice not installed. Required for Excel/PPT to PDF conversion.")
            
            temp_output_dir = input_path.parent
            
            logger.info(f"Starting LibreOffice Excel/PPT conversion: {input_path} -> PDF")
            
            # Run LibreOffice conversion with environment fixes
            env = os.environ.copy()
            env["HOME"] = "/tmp"  # Fix for Docker/non-root user
            
            result = subprocess.run([
                libreoffice_cmd,
                "--headless",
                "--invisible",
                "--nologo",
                "--nofirststartwizard",
                "--norestore",
                "--convert-to", "pdf",
                "--outdir", str(temp_output_dir),
                str(input_path)
            ], capture_output=True, text=True, timeout=180, env=env)
            
            expected_output = temp_output_dir / (input_path.stem + ".pdf")
            
            if expected_output.exists() and expected_output.stat().st_size > 0:
                shutil.move(str(expected_output), str(output_path))
                logger.info(f"LibreOffice Excel/PPT conversion successful: {task_id}")
            else:
                error_msg = result.stderr or result.stdout or "Unknown error"
                logger.error(f"LibreOffice output not found. stderr: {error_msg}")
                raise Exception(f"Excel/PPT to PDF conversion failed: {error_msg}")

        # ==========================================
        # DATA FORMATS (CSV, JSON, XML, XLSX)
        # ==========================================
        elif input_ext in ["json", "csv", "xml", "xlsx", "xls"] and output_format in ["json", "csv", "xml", "xlsx"]:
            import pandas as pd
            
            # Read Input
            df = None
            if input_ext == "json":
                df = pd.read_json(input_path)
            elif input_ext == "csv":
                df = pd.read_csv(input_path)
            elif input_ext in ["xlsx", "xls"]:
                df = pd.read_excel(input_path)
            elif input_ext == "xml":
                try:
                    df = pd.read_xml(input_path)
                except ValueError:
                    # Fallback for complex XML
                    import xmltodict
                    with open(input_path) as f:
                        doc = xmltodict.parse(f.read())
                    # Flatten simplisticly or take first root
                    root_key = list(doc.keys())[0]
                    df = pd.DataFrame(doc[root_key])
            
            if df is None:
                raise ValueError(f"Could not read input file: {input_ext}")

            # Write Output
            if output_format == "csv":
                df.to_csv(output_path, index=False)
            elif output_format == "json":
                df.to_json(output_path, orient="records", indent=2)
            elif output_format == "xlsx":
                df.to_excel(output_path, index=False)
            elif output_format == "xml":
                df.to_xml(output_path, index=False)

        # ==========================================
        # PDF TO DOCX
        # ==========================================
        elif input_ext == "pdf" and output_format == "docx":
            try:
                from pdf2docx import Converter
            except ImportError:
                raise Exception("pdf2docx not installed")
            
            cv = Converter(str(input_path))
            cv.convert(str(output_path), start=0, end=None)
            cv.close()

        # ==========================================
        # DOCX/DOC/ODT/RTF CONVERSIONS (LibreOffice)
        # ==========================================
        elif input_ext in ["docx", "doc", "odt", "rtf"]:
            if output_format == "pdf":
                # Use LibreOffice ONLY for pixel-perfect conversion
                import subprocess
                import shutil
                
                # Find LibreOffice executable
                libreoffice_cmd = None
                for cmd in ["libreoffice", "soffice", "/usr/bin/libreoffice", "/usr/bin/soffice"]:
                    if shutil.which(cmd):
                        libreoffice_cmd = cmd
                        break
                
                if not libreoffice_cmd:
                    raise Exception("LibreOffice not installed. Please install LibreOffice for document conversion.")
                
                # Create temp output directory
                temp_output_dir = input_path.parent
                
                logger.info(f"Starting LibreOffice conversion: {input_path} -> PDF")
                
                # Run LibreOffice conversion with environment fixes
                env = os.environ.copy()
                env["HOME"] = "/tmp"  # Fix for Docker/non-root user
                
                result = subprocess.run([
                    libreoffice_cmd,
                    "--headless",
                    "--invisible",
                    "--nologo",
                    "--nofirststartwizard",
                    "--norestore",
                    "--convert-to", "pdf",
                    "--outdir", str(temp_output_dir),
                    str(input_path)
                ], capture_output=True, text=True, timeout=180, env=env)
                
                # LibreOffice creates file with same name but .pdf extension
                expected_output = temp_output_dir / (input_path.stem + ".pdf")
                
                if expected_output.exists() and expected_output.stat().st_size > 0:
                    # Move to final output path
                    shutil.move(str(expected_output), str(output_path))
                    logger.info(f"LibreOffice conversion successful: {task_id}")
                else:
                    error_msg = result.stderr or result.stdout or "Unknown error"
                    logger.error(f"LibreOffice output not found. stderr: {error_msg}")
                    raise Exception(f"LibreOffice conversion failed: {error_msg}")
                    
            elif output_format == "html":
                import mammoth
                with open(input_path, "rb") as docx_file:
                    result = mammoth.convert_to_html(docx_file)
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(result.value)
                        
            elif output_format == "txt":
                import mammoth
                with open(input_path, "rb") as docx_file:
                    result = mammoth.extract_raw_text(docx_file)
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(result.value)

        # ==========================================
        # TEXT TO PDF
        # ==========================================
        elif input_ext in ["txt", "md"] and output_format == "pdf":
            from weasyprint import HTML
            import markdown
            
            text_content = input_path.read_text(encoding="utf-8")
            
            if input_ext == "md":
                html_body = markdown.markdown(text_content)
            else:
                # Text to simple HTML with line breaks
                import html
                escaped = html.escape(text_content)
                html_body = f"<pre style='white-space: pre-wrap;'>{escaped}</pre>"
            
            html_doc = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @page {{ 
                        margin: 2cm; 
                        size: A4;
                        @bottom-center {{
                            content: counter(page);
                            font-size: 10px;
                            color: #666;
                        }}
                    }}
                    body {{ 
                        font-family: 'Consolas', 'Monaco', 'Courier New', monospace; 
                        font-size: 11pt;
                        line-height: 1.5;
                        color: #333;
                    }}
                    pre {{
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        margin: 0;
                    }}
                    /* Markdown specific styles */
                    h1 {{ font-size: 22pt; margin: 20pt 0 12pt 0; border-bottom: 2px solid #333; padding-bottom: 6pt; }}
                    h2 {{ font-size: 18pt; margin: 18pt 0 10pt 0; border-bottom: 1px solid #666; padding-bottom: 4pt; }}
                    h3 {{ font-size: 14pt; margin: 14pt 0 8pt 0; }}
                    p {{ margin: 0 0 10pt 0; font-family: 'Segoe UI', Arial, sans-serif; }}
                    code {{ background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }}
                    blockquote {{ border-left: 4px solid #ddd; margin: 12pt 0; padding: 8pt 16pt; background: #f9f9f9; }}
                    ul, ol {{ margin: 10pt 0; padding-left: 24pt; }}
                    a {{ color: #0066cc; }}
                </style>
            </head>
            <body>{html_body}</body>
            </html>
            """
            HTML(string=html_doc).write_pdf(str(output_path))

        # ==========================================
        # PDF TO TEXT
        # ==========================================
        elif input_ext == "pdf" and output_format == "txt":
            from PyPDF2 import PdfReader
            reader = PdfReader(str(input_path))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            output_path.write_text(text, encoding="utf-8")

        else:
            # Fallback for direct copies or unhandled pairs
            import shutil
            shutil.copy(input_path, output_path)

        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, extension=output_format)
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Document convert complete: {task_id} -> {output_filename}")
        
    except Exception as e:
        logger.error(f"Document convert failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_pdf_merge(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Merge multiple PDFs"""
    try:
        input_paths = [Path(p) for p in params.get("input_paths", [])]
        
        if not input_paths:
            raise ValueError("No input files provided")

        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        try:
            from PyPDF2 import PdfMerger
        except ImportError:
            raise Exception("PyPDF2 not installed")
        
        merger = PdfMerger()
        
        update_task(task_id, progress_percent=30)
        
        for i, pdf_path in enumerate(input_paths):
            merger.append(str(pdf_path))
            progress = 30 + int((i + 1) / len(input_paths) * 50)
            update_task(task_id, progress_percent=progress)
        
        output_path = get_output_path(task_id, "pdf")
        merger.write(str(output_path))
        merger.close()
        
        update_task(task_id, progress_percent=90)
        
        output_filename = "merged.pdf"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"PDF merge complete: {task_id}")
        
    except Exception as e:
        logger.error(f"PDF merge failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


def process_pdf_split(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Split PDF pages"""
    pages = params.get("pages", "1")
    try:
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        try:
            from PyPDF2 import PdfReader, PdfWriter
        except ImportError:
            raise Exception("PyPDF2 not installed")
        
        reader = PdfReader(str(input_path))
        writer = PdfWriter()
        
        update_task(task_id, progress_percent=30)
        
        # Parse page ranges (e.g., "1-5, 10, 15-20")
        page_numbers = []
        for part in pages.split(","):
            part = part.strip()
            if "-" in part:
                start, end = part.split("-")
                page_numbers.extend(range(int(start) - 1, int(end)))
            else:
                page_numbers.append(int(part) - 1)
        
        # Add selected pages
        for page_num in page_numbers:
            if 0 <= page_num < len(reader.pages):
                writer.add_page(reader.pages[page_num])
        
        update_task(task_id, progress_percent=70)
        
        output_path = get_output_path(task_id, "pdf")
        with open(output_path, "wb") as f:
            writer.write(f)
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="split", extension="pdf")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"PDF split complete: {task_id}")
        
    except Exception as e:
        logger.error(f"PDF split failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/document/convert")
async def convert_document(
    file: UploadFile = File(...),
    output_format: str = Form(...),
):
    """Convert document to different format"""
    output_format = output_format.lower().lstrip(".")
    
    task_id = create_task(file.filename, "document_convert")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "txt"
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


@router.post("/pdf/merge")
async def merge_pdfs(
    files: List[UploadFile] = File(...),
):
    """Merge multiple PDF files into one"""
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 PDF files are required for merging"
        )
    
    if len(files) > 40:
        raise HTTPException(
            status_code=400,
            detail="Maximum 40 files allowed for merging"
        )
    
    task_id = create_task("multiple_pdfs", "pdf_merge")
    
    # Save all files
    input_paths = []
    for i, file in enumerate(files):
        input_path = get_input_path(f"{task_id}_{i}", "pdf")
        await save_upload_file(file, input_path)
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
        }
    )
    
    return {"task_id": task_id, "message": "Files uploaded successfully"}


@router.post("/pdf/split")
async def split_pdf(
    file: UploadFile = File(...),
    pages: str = Form(...),
):
    """Split PDF by extracting specified pages"""
    task_id = create_task(file.filename, "pdf_split")
    
    input_path = get_input_path(task_id, "pdf")
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"pages": pages}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_pdf_compress(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Compress PDF to reduce file size while preserving images"""
    try:
        quality = params.get("quality", "medium")
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        output_path = get_output_path(task_id, "pdf")
        original_size = input_path.stat().st_size
        
        compression_success = False
        
        # Method 1: Try Ghostscript first (best for image PDFs)
        try:
            import subprocess
            import platform
            
            update_task(task_id, progress_percent=20)
            
            # Ghostscript quality settings
            gs_quality = {
                "low": "/screen",      # 72 dpi - smallest
                "medium": "/ebook",    # 150 dpi - balanced
                "high": "/printer"     # 300 dpi - high quality
            }.get(quality, "/ebook")
            
            # Find Ghostscript executable
            if platform.system() == "Windows":
                gs_cmd = "gswin64c" if Path("C:/Program Files/gs").exists() else "gs"
            else:
                gs_cmd = "gs"
            
            update_task(task_id, progress_percent=40)
            
            result = subprocess.run([
                gs_cmd,
                "-sDEVICE=pdfwrite",
                f"-dPDFSETTINGS={gs_quality}",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                "-dCompatibilityLevel=1.4",
                "-dColorImageResolution=150",
                "-dGrayImageResolution=150",
                "-dMonoImageResolution=150",
                f"-sOutputFile={output_path}",
                str(input_path)
            ], capture_output=True, text=True, timeout=300)
            
            update_task(task_id, progress_percent=80)
            
            if result.returncode == 0 and output_path.exists() and output_path.stat().st_size > 0:
                compression_success = True
                logger.info(f"PDF compressed using Ghostscript: {task_id}")
            else:
                logger.warning(f"Ghostscript failed: {result.stderr}")
                
        except FileNotFoundError:
            logger.info("Ghostscript not available, trying PyPDF2")
        except subprocess.TimeoutExpired:
            logger.warning("Ghostscript timeout, trying PyPDF2")
        except Exception as e:
            logger.warning(f"Ghostscript error: {e}, trying PyPDF2")
        
        # Method 2: Fallback to PyPDF2 (may not preserve all images)
        if not compression_success:
            try:
                from PyPDF2 import PdfReader, PdfWriter
                
                update_task(task_id, progress_percent=50)
                
                reader = PdfReader(str(input_path))
                writer = PdfWriter()
                
                # Copy all pages without modification
                for i, page in enumerate(reader.pages):
                    writer.add_page(page)
                    progress = 50 + int((i + 1) / len(reader.pages) * 30)
                    update_task(task_id, progress_percent=progress)
                
                # Only remove metadata, don't compress content streams (preserves images)
                writer.add_metadata({})
                
                update_task(task_id, progress_percent=85)
                
                with open(output_path, "wb") as f:
                    writer.write(f)
                
                compression_success = True
                logger.info(f"PDF processed using PyPDF2: {task_id}")
                
            except Exception as e:
                logger.error(f"PyPDF2 failed: {e}")
        
        # Method 3: Last resort - just copy the file
        if not compression_success or not output_path.exists():
            import shutil
            shutil.copy(input_path, output_path)
            logger.warning(f"PDF compression fallback to copy: {task_id}")
        
        update_task(task_id, progress_percent=95)
        
        final_size = output_path.stat().st_size
        compression_ratio = (1 - final_size / original_size) * 100 if original_size > 0 else 0
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="compressed", extension="pdf")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=final_size,
        )
        
        logger.info(f"PDF compress complete: {task_id} - {compression_ratio:.1f}% reduction")
        
    except Exception as e:
        logger.error(f"PDF compress failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/pdf/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    quality: str = Form(default="medium"),
):
    """Compress PDF to reduce file size using real compression"""
    task_id = create_task(file.filename, "pdf_compress")
    
    input_path = get_input_path(task_id, "pdf")
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"quality": quality}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_pdf_protect(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Add password protection to PDF"""
    try:
        password = params.get("password", "")
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        try:
            from PyPDF2 import PdfReader, PdfWriter
        except ImportError:
            raise Exception("PyPDF2 not installed")
        
        reader = PdfReader(str(input_path))
        writer = PdfWriter()
        
        update_task(task_id, progress_percent=30)
        
        for page in reader.pages:
            writer.add_page(page)
        
        writer.encrypt(password)
        
        update_task(task_id, progress_percent=70)
        
        output_path = get_output_path(task_id, "pdf")
        with open(output_path, "wb") as f:
            writer.write(f)
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="protected", extension="pdf")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"PDF protect complete: {task_id}")
        
    except Exception as e:
        logger.error(f"PDF protect failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/pdf/protect")
async def protect_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    """Add password protection to PDF"""
    task_id = create_task(file.filename, "pdf_protect")
    
    input_path = get_input_path(task_id, "pdf")
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"password": password}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


def process_pdf_unlock(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Remove password protection from PDF"""
    try:
        password = params.get("password", "")
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        try:
            from PyPDF2 import PdfReader, PdfWriter
        except ImportError:
            raise Exception("PyPDF2 not installed")
        
        reader = PdfReader(str(input_path))
        
        if reader.is_encrypted:
            reader.decrypt(password)
        
        update_task(task_id, progress_percent=40)
        
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        
        update_task(task_id, progress_percent=70)
        
        output_path = get_output_path(task_id, "pdf")
        with open(output_path, "wb") as f:
            writer.write(f)
        
        update_task(task_id, progress_percent=90)
        
        from services.tasks import get_output_filename
        output_filename = get_output_filename(original_filename, suffix="unlocked", extension="pdf")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"PDF unlock complete: {task_id}")
        
    except Exception as e:
        logger.error(f"PDF unlock failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/pdf/unlock")
async def unlock_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    """Remove password protection from PDF"""
    task_id = create_task(file.filename, "pdf_unlock")
    
    input_path = get_input_path(task_id, "pdf")
    await save_upload_file(file, input_path)
    
    update_task(
        task_id,
        status=TaskStatus.UPLOADED,
        progress_percent=100,
        input_path=input_path,
        params={"password": password}
    )
    
    return {"task_id": task_id, "message": "File uploaded successfully"}


@router.post("/to-image")
async def file_to_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    output_format: str = Form(default="png"),
):
    """Convert document pages to images"""
    task_id = create_task(file.filename, "file_to_image")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "pdf"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    def process_file_to_image(task_id: str, input_path: Path, output_format: str, original_filename: str):
        try:
            import zipfile
            
            update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
            
            try:
                from pdf2image import convert_from_path
                images = convert_from_path(str(input_path), dpi=150)
            except ImportError:
                # Fallback: just save first page as preview
                from PIL import Image
                logger.warning("pdf2image not installed, using placeholder")
                images = []
            except Exception as e:
                logger.warning(f"pdf2image failed: {e}, using placeholder")
                images = []
            
            update_task(task_id, progress_percent=50)
            
            output_path = get_output_path(task_id, "zip")
            
            with zipfile.ZipFile(output_path, 'w') as zf:
                if images:
                    for i, img in enumerate(images):
                        import io
                        buffer = io.BytesIO()
                        img.save(buffer, format=output_format.upper())
                        buffer.seek(0)
                        zf.writestr(f"page_{i+1}.{output_format}", buffer.read())
                else:
                    # Create placeholder
                    zf.writestr("readme.txt", "PDF conversion requires pdf2image and poppler to be installed.")
            
            update_task(task_id, progress_percent=90)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, suffix="images", extension="zip")
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"File to image complete: {task_id}")
            
        except Exception as e:
            logger.error(f"File to image failed: {task_id} - {e}")
            update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))
    
    background_tasks.add_task(process_file_to_image, task_id, input_path, output_format, file.filename)
    
    return {"task_id": task_id, "message": "File to image conversion started"}


@router.post("/data-convert")
async def convert_data_format(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    output_format: str = Form(...),
):
    """Convert between data formats (CSV, JSON, XML)"""
    task_id = create_task(file.filename, "data_convert")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "csv"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    def process_data_convert(task_id: str, input_path: Path, output_format: str, original_filename: str):
        try:
            update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
            
            input_ext = input_path.suffix.lstrip(".").lower()
            output_format = output_format.lower()
            
            # Read input
            data = None
            if input_ext == "json":
                with open(input_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            elif input_ext == "csv":
                with open(input_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    data = list(reader)
            elif input_ext == "xml":
                # Simple XML parsing
                with open(input_path, "r", encoding="utf-8") as f:
                    content = f.read()
                # For simplicity, treat as text for now
                data = [{"xml_content": content}]
            
            update_task(task_id, progress_percent=50)
            
            output_path = get_output_path(task_id, output_format)
            
            # Write output
            if output_format == "json":
                with open(output_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            elif output_format == "csv":
                if data and isinstance(data, list) and len(data) > 0:
                    fieldnames = list(data[0].keys()) if isinstance(data[0], dict) else ["value"]
                    with open(output_path, "w", newline="", encoding="utf-8") as f:
                        writer = csv.DictWriter(f, fieldnames=fieldnames)
                        writer.writeheader()
                        for row in data:
                            writer.writerow(row if isinstance(row, dict) else {"value": row})
                else:
                    output_path.write_text("No data")
            elif output_format == "xml":
                xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n'
                if isinstance(data, list):
                    for i, item in enumerate(data):
                        xml_content += f"  <item index=\"{i}\">\n"
                        if isinstance(item, dict):
                            for k, v in item.items():
                                xml_content += f"    <{k}>{v}</{k}>\n"
                        else:
                            xml_content += f"    <value>{item}</value>\n"
                        xml_content += "  </item>\n"
                xml_content += "</root>"
                output_path.write_text(xml_content, encoding="utf-8")
            
            update_task(task_id, progress_percent=90)
            
            from services.tasks import get_output_filename
            output_filename = get_output_filename(original_filename, extension=output_format)
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=output_path.stat().st_size,
            )
            
            logger.info(f"Data convert complete: {task_id}")
            
        except Exception as e:
            logger.error(f"Data convert failed: {task_id} - {e}")
            update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))
    
    background_tasks.add_task(process_data_convert, task_id, input_path, output_format, file.filename)
    
    return {"task_id": task_id, "message": "Data format conversion started"}


@router.post("/metadata")
async def edit_metadata(
    file: UploadFile = File(...),
    action: str = Form(default="view"),
):
    """View or remove document metadata (synchronous)"""
    try:
        content = await file.read()
        ext = Path(file.filename).suffix.lstrip(".").lower()
        
        if ext == "pdf":
            try:
                from PyPDF2 import PdfReader
                import io
                
                reader = PdfReader(io.BytesIO(content))
                meta = reader.metadata or {}
                
                return {
                    "success": True,
                    "filename": file.filename,
                    "metadata": {
                        "title": meta.get("/Title", ""),
                        "author": meta.get("/Author", ""),
                        "subject": meta.get("/Subject", ""),
                        "creator": meta.get("/Creator", ""),
                        "producer": meta.get("/Producer", ""),
                        "creation_date": str(meta.get("/CreationDate", "")),
                        "modification_date": str(meta.get("/ModDate", "")),
                        "pages": len(reader.pages),
                    }
                }
            except Exception as e:
                return {"success": False, "error": str(e), "filename": file.filename}
        else:
            return {
                "success": True,
                "filename": file.filename,
                "metadata": {
                    "size_bytes": len(content),
                    "type": ext,
                    "note": "Detailed metadata extraction only supported for PDF files"
                }
            }
            
    except Exception as e:
        logger.error(f"Metadata extraction failed: {e}")
        return {"success": False, "error": str(e), "filename": file.filename}


@router.post("/text-edit")
async def text_editor_save(
    content: str = Form(...),
    filename: str = Form(default="edited.txt"),
):
    """Save text editor content as downloadable file"""
    task_id = create_task(filename, "text_edit")
    
    try:
        ext = Path(filename).suffix.lstrip(".") or "txt"
        output_path = get_output_path(task_id, ext)
        output_path.write_text(content, encoding="utf-8")
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        return {"task_id": task_id, "message": "File saved", "filename": filename}
        
    except Exception as e:
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))
        return {"success": False, "error": str(e)}


@router.post("/size-adjust")
async def adjust_file_size(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mode: str = Form(...),  # "increase" or "decrease"
    target_size: int = Form(...),  # target size in bytes
):
    """Adjust file size by adding padding or compressing"""
    task_id = create_task(file.filename, "size_adjust")
    
    input_ext = Path(file.filename).suffix.lstrip(".") or "bin"
    input_path = get_input_path(task_id, input_ext)
    await save_upload_file(file, input_path)
    
    def process_size_adjust(task_id: str, input_path: Path, mode: str, target_size: int, original_filename: str):
        try:
            import zipfile
            import zlib
            
            update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
            
            original_content = input_path.read_bytes()
            original_size = len(original_content)
            ext = Path(original_filename).suffix.lstrip(".")
            
            update_task(task_id, progress_percent=30)
            
            if mode == "increase":
                if target_size <= original_size:
                    raise Exception(f"Target size must be larger than original ({original_size} bytes)")
                
                # Add padding bytes at the end
                padding_size = target_size - original_size
                
                # Use null bytes for padding (safe for most file types)
                # For specific formats, we could add format-specific padding
                padding = b'\x00' * padding_size
                
                output_content = original_content + padding
                
                output_path = get_output_path(task_id, ext)
                output_path.write_bytes(output_content)
                
            elif mode == "decrease":
                if target_size >= original_size:
                    raise Exception(f"Target size must be smaller than original ({original_size} bytes)")
                
                # Try compression, create a zip file
                output_path = get_output_path(task_id, "zip")
                
                with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
                    zf.writestr(original_filename, original_content)
                
                # If compressed file is still larger than target, add note
                compressed_size = output_path.stat().st_size
                if compressed_size > target_size:
                    logger.warning(f"Could not compress to target size. Best: {compressed_size}")
                    
            else:
                raise Exception(f"Invalid mode: {mode}. Use 'increase' or 'decrease'")
            
            update_task(task_id, progress_percent=80)
            
            final_size = output_path.stat().st_size
            
            from services.tasks import get_output_filename
            if mode == "increase":
                output_filename = get_output_filename(original_filename, suffix="padded", extension=ext)
            else:
                output_filename = get_output_filename(original_filename, suffix="compressed", extension="zip")
            
            update_task(
                task_id,
                status=TaskStatus.COMPLETE,
                progress_percent=100,
                output_filename=output_filename,
                output_path=output_path,
                file_size=final_size,
            )
            
            logger.info(f"Size adjust complete: {task_id} ({original_size} -> {final_size})")
            
        except Exception as e:
            logger.error(f"Size adjust failed: {task_id} - {e}")
            update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))
    
    background_tasks.add_task(process_size_adjust, task_id, input_path, mode, target_size, file.filename)
    
    return {"task_id": task_id, "message": "File size adjustment started"}


# ============================================================================
# PROCESSOR REGISTRATION
# Register handlers for deferred processing via /start endpoint
# ============================================================================
register_processor("document_convert", process_document_convert)
register_processor("pdf_split", process_pdf_split)
register_processor("pdf_merge", process_pdf_merge)
register_processor("pdf_compress", process_pdf_compress)
register_processor("pdf_protect", process_pdf_protect)
register_processor("pdf_unlock", process_pdf_unlock)
# Note: to_image, data_convert, size_adjust still use inline functions


# ============================================================================
# IMAGE TO PDF WITH QUALITY OPTIONS
# ============================================================================

def process_pdf_from_images(task_id: str, input_path: Path, original_filename: str, **params):
    """Background task: Create PDF from images with quality options"""
    try:
        input_paths = [Path(p) for p in params.get("input_paths", [])]
        quality = params.get("quality", "medium")  # low, medium, high
        
        if not input_paths:
            raise ValueError("No input images provided")
        
        update_task(task_id, status=TaskStatus.PROCESSING, progress_percent=10)
        
        from PIL import Image
        import io
        
        # Quality settings
        quality_map = {
            "low": {"max_size": 1000, "jpg_quality": 50},
            "medium": {"max_size": 2000, "jpg_quality": 75},
            "high": {"max_size": None, "jpg_quality": 95},
        }
        
        settings = quality_map.get(quality, quality_map["medium"])
        max_size = settings["max_size"]
        jpg_quality = settings["jpg_quality"]
        
        pdf_images = []
        
        total_images = len(input_paths)
        
        for i, img_path in enumerate(input_paths):
            try:
                with Image.open(img_path) as img:
                    # Convert to RGB (PDF doesn't like RGBA usually, or for consistency)
                    if img.mode != "RGB":
                        img = img.convert("RGB")
                    
                    # Resize if needed
                    if max_size:
                        width, height = img.size
                        if width > max_size or height > max_size:
                            ratio = min(max_size / width, max_size / height)
                            new_size = (int(width * ratio), int(height * ratio))
                            img = img.resize(new_size, Image.Resampling.LANCZOS)
                    
                    # Compress in memory
                    buffer = io.BytesIO()
                    img.save(buffer, format="JPEG", quality=jpg_quality)
                    buffer.seek(0)
                    
                    # Re-open optimized image
                    optimized_img = Image.open(buffer)
                    # Load data to keep it in memory
                    optimized_img.load()
                    pdf_images.append(optimized_img)
            
            except Exception as e:
                logger.warning(f"Failed to process image {img_path}: {e}")
            
            # Update progress
            progress = 10 + int((i + 1) / total_images * 60)
            update_task(task_id, progress_percent=progress)
        
        update_task(task_id, progress_percent=80)
        
        if not pdf_images:
            raise Exception("No valid images to convert")
        
        output_path = get_output_path(task_id, "pdf")
        
        # Save first image as PDF and append others
        pdf_images[0].save(
            output_path,
            "PDF",
            resolution=100.0,
            save_all=True,
            append_images=pdf_images[1:]
        )
        
        update_task(task_id, progress_percent=90)
        
        output_filename = "images_combined.pdf"
        
        update_task(
            task_id,
            status=TaskStatus.COMPLETE,
            progress_percent=100,
            output_filename=output_filename,
            output_path=output_path,
            file_size=output_path.stat().st_size,
        )
        
        logger.info(f"Image to PDF complete: {task_id} (Quality: {quality})")
        
    except Exception as e:
        logger.error(f"Image to PDF failed: {task_id} - {e}")
        update_task(task_id, status=TaskStatus.FAILED, error_message=str(e))


@router.post("/pdf/create")
async def create_pdf_from_images(
    files: List[UploadFile] = File(...),
    quality: str = Form(default="medium"),
):
    """Create PDF from uploaded images with quality control"""
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided")
    
    if len(files) > 50:
         raise HTTPException(status_code=400, detail="Maximum 50 files allowed")
         
    if quality not in ["low", "medium", "high"]:
        quality = "medium"
    
    task_id = create_task("images_to_pdf", "pdf_from_images")
    
    # Save all files
    input_paths = []
    for i, file in enumerate(files):
        ext = Path(file.filename).suffix.lstrip(".") or "jpg"
        input_path = get_input_path(f"{task_id}_{i}", ext)
        await save_upload_file(file, input_path)
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
            "quality": quality,
        }
    )
    
    return {"task_id": task_id, "message": "Files uploaded successfully"}


# Register processor
register_processor("pdf_from_images", process_pdf_from_images)
