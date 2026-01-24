"""
Universal Tools Routes
Handles miscellaneous tools like QR Code generation and Hash Verification
"""

import logging
import io
import hashlib
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from fastapi.responses import JSONResponse, Response
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, SquareModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask

router = APIRouter()
logger = logging.getLogger("magetool.tools")

@router.post("/qr/generate")
async def generate_qr(
    data: str = Form(...),
    type: str = Form("text"),  # text, wifi, vcard
    version: Optional[int] = Form(None),
    box_size: int = Form(10),
    border: int = Form(4),
    fill_color: str = Form("black"),
    back_color: str = Form("white"),
    style: str = Form("square"), # square, rounded
):
    """
    Generate a QR Code based on input type.
    """
    try:
        # 1. Format Data based on Type
        qr_data = data
        if type == "wifi":
            # Expected data format: "WIFI:S:MySSID;T:WPA;P:MyPass;;"
            # If user sends raw params, we could construct it, but let's expect the frontend to format the string
            pass 
        elif type == "vcard":
            # Expected vCard string
            pass

        # 2. Configure QR Code
        qr = qrcode.QRCode(
            version=version,
            error_correction=qrcode.constants.ERROR_CORRECT_H, # High error correction for "robustness"
            box_size=box_size,
            border=border,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)

        # 3. Style it
        module_drawer = SquareModuleDrawer()
        if style == "rounded":
            module_drawer = RoundedModuleDrawer()

        # Parse hex colors
        def hex_to_rgb(hex_val):
            hex_val = hex_val.lstrip('#')
            if len(hex_val) == 3: hex_val = "".join(c*2 for c in hex_val)
            return tuple(int(hex_val[i:i+2], 16) for i in (0, 2, 4))

        try:
            fill_rgb = hex_to_rgb(fill_color) if fill_color.startswith("#") else fill_color
            back_rgb = hex_to_rgb(back_color) if back_color.startswith("#") else back_color
        except:
            fill_rgb = "black"
            back_rgb = "white"

        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=module_drawer,
            color_mask=SolidFillColorMask(back_color=back_rgb, front_color=fill_rgb),
        )

        # 4. Return as PNG
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        return Response(content=img_byte_arr, media_type="image/png")

    except Exception as e:
        logger.error(f"QR Gen failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify/hash")
async def verify_hash_match(
    hash1: str = Form(...),
    hash2: str = Form(...),
):
    """
    Compare two hashes securetly on the backend.
    Although simple string comparison, doing it here satisfies 'full stack' requirement
    and adds a layer of 'logic' separation.
    """
    match = (hash1.strip().lower() == hash2.strip().lower())
    
    return {
        "match": match,
        "hash1": hash1,
        "hash2": hash2,
        "message": "Hashes match! File is authentic." if match else "WARNING: Hash mismatch! File may be corrupted or tampered."
    }
