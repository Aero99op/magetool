
import io
import os
from PIL import Image

def test_compression():
    # Create a dummy image (random noise to be compressible but not trivial)
    img = Image.new('RGB', (1000, 1000), color='red')
    
    # Draw some patterns to ensure it has some data size
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    for i in range(0, 1000, 10):
        draw.line([(i, 0), (1000-i, 1000)], fill='blue', width=2)
        draw.line([(0, i), (1000, 1000-i)], fill='green', width=2)

    # Save initial to see size
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=95)
    print(f"Initial size (Q95): {buf.tell()} bytes")
    
    target_size = 40 * 1024 # 40KB
    print(f"Target size: {target_size} bytes")

    # --- LOGIC COPIED FROM backend/routes/image.py ---
    ext = "jpg"
    save_format = "JPEG"
    
    # 1. Try Highest Quality first
    buffer = io.BytesIO()
    img.save(buffer, format=save_format, quality=95, optimize=True)
    size_at_max = buffer.tell()
    
    best_buffer = None
    
    if size_at_max <= target_size:
        print("Fits at max quality")
        best_buffer = buffer
    else:
        print(f"Max quality {size_at_max} > target. Starting binary search.")
        # 2. Binary Search
        low = 1
        high = 95
        
        while low <= high:
            mid = (low + high) // 2
            buffer = io.BytesIO()
            img.save(buffer, format=save_format, quality=mid, optimize=True)
            size = buffer.tell()
            
            # print(f"Trying Q{mid}: {size} bytes")
            
            if size <= target_size:
                best_buffer = buffer
                low = mid + 1 
            else:
                high = mid - 1
                
        # 3. Resizing Fallback
        if best_buffer is None:
            print("Binary search failed. Starting resize fallback.")
            w, h = img.size
            fallback_quality = 75
            
            while True:
                w = int(w * 0.95)
                h = int(h * 0.95)
                
                if w < 10 or h < 10:
                    buffer = io.BytesIO()
                    img.save(buffer, format=save_format, quality=1)
                    best_buffer = buffer
                    break
                
                resized = img.resize((w, h), Image.Resampling.LANCZOS)
                buffer = io.BytesIO()
                resized.save(buffer, format=save_format, quality=fallback_quality, optimize=True)
                
                if buffer.tell() <= target_size:
                    print(f"Resize fit at {w}x{h}: {buffer.tell()} bytes")
                    best_buffer = buffer
                    break
    
    # 4. Padding
    if best_buffer:
        current_size = best_buffer.tell()
        print(f"Size before padding: {current_size} bytes")
        if current_size < target_size:
            padding_needed = target_size - current_size
            print(f"Padding needed: {padding_needed} bytes")
            best_buffer.seek(0, 2)
            best_buffer.write(b'\0' * padding_needed)
            
    # Verification
    final_size = best_buffer.tell()
    print(f"Final size in buffer: {final_size} bytes")
    
    with open("test_output.jpg", "wb") as f:
        best_buffer.seek(0)
        f.write(best_buffer.read())
        
    on_disk = os.path.getsize("test_output.jpg")
    print(f"Final size on disk: {on_disk} bytes")
    
    if on_disk != target_size:
        print("FAIL: Disk size doesn't match target!")
    else:
        print("SUCCESS: Target hit exactly.")

if __name__ == "__main__":
    test_compression()
