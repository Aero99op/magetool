import re

def parse_pdf_pages(pages, total_pages):
    page_indices = set()
    try:
        # First, clean up spaces around dashes to prevent split errors
        clean_pages = re.sub(r'\s*([-–—])\s*', r'\1', pages)
        
        # Split by common delimiters (comma, semicolon, pipe, slash, space)
        parts = re.split(r'[|,;/ \s]+', clean_pages)
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            # Handle various dash types (hyphen, en-dash, em-dash)
            if '-' in part or '–' in part or '—' in part:
                # Use regex to split by any of these dashes
                range_parts = re.split(r'[-–—]', part)
                if len(range_parts) == 2:
                    try:
                        start_str, end_str = range_parts
                        start = int(start_str.strip())
                        end = int(end_str.strip())
                        
                        # Respect structural order: treat both 1-5 and 5-1 as structural 1 to 5
                        if start <= end:
                            nums = range(start - 1, end)
                        else:
                            nums = range(end - 1, start)
                        
                        page_indices.update(nums)
                    except ValueError:
                        raise ValueError(f"Invalid range values: {part}")
                else:
                    raise ValueError(f"Invalid range format: {part}")
            else:
                try:
                    page_indices.add(int(part) - 1)
                except ValueError:
                    raise ValueError(f"Invalid page number: {part}")
        
        if not page_indices:
            raise ValueError("No valid page numbers provided")
            
        sorted_pages = sorted(list(page_indices))
        
        for p in sorted_pages:
            if p < 0 or p >= total_pages:
                raise ValueError(f"Page number {p+1} is out of bounds (PDF has {total_pages} pages)")
                
        return sorted_pages
    except ValueError as ve:
        return f"Error: {ve}"
    except Exception as e:
        return f"Error: {e}"

# Test cases
test_cases = [
    ("1-5", 10, [0, 1, 2, 3, 4]),
    ("1, 3, 5", 10, [0, 2, 4]),
    ("1 - 3 ; 5 | 7/9", 10, [0, 1, 2, 4, 6, 8]), # Now handles spaces!
    ("5-1", 10, [0, 1, 2, 3, 4]), # Sorted for structural order
    ("1-5, 3-7", 10, [0, 1, 2, 3, 4, 5, 6]), # De-duplicated and sorted
    ("5, 1, 2", 10, [0, 1, 4]), # Respects structural order (sorted)
    ("10-12", 10, "Error: Page number 11 is out of bounds (PDF has 10 pages)"),
    ("abc", 10, "Error: Invalid page number: abc"),
    ("1-2-3", 10, "Error: Invalid range format: 1-2-3"),
]

print("Running ENHANCED PDF Range Parsing Tests...")
failed = False
for pages, total, expected in test_cases:
    result = parse_pdf_pages(pages, total)
    status = "PASS" if result == expected else "FAIL"
    print(f"{status} Input: '{pages}', PDF Pages: {total}")
    if result != expected:
        print(f"   Expected: {expected}")
        print(f"   Got:      {result}")
        failed = True

if not failed:
    print("\nAll tests passed! PDF Splitter logic is now robust and respects structural order.")
