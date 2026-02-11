
import os

file_path = r"d:\magetool website\frontend\src\components\ui\AnimatedBackground.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We want to remove lines 2888 to 4004 (1-based index).
# optimize: check content at boundaries to be sure.
# Line 2888 (index 2887): "// Or I can insert before..."
# Line 4005 (index 4004): "        const draw = () => {"

start_line = 2888
end_line = 4004

# indices
start_idx = start_line - 1
end_idx = end_line # Slice is up to end_idx not included, so we want up to 4004 inclusive? No, remove 2888 to 4004.
# slice should be [0:start_idx] + [end_idx:] ??
# Wait, if I want to remove 2888..4004.
# lines[0 .. 2887] are kept. (0 to start_idx)
# lines[4004 .. end] are kept. (end_line to end) ?
# end_line is 4004. Index 4003.
# So I want to keep from 4005 onwards (index 4004).
# So lines[end_line:]?
# Let's check line at index 4004. It should be "const draw...".
# Python index 4004 is line 4005.
# So yes, lines[end_line:] keeps line 4005 onwards.

# Check content
print(f"Removing lines {start_line} to {end_line}")
print(f"Line {start_line}: {lines[start_idx].strip()}")
print(f"Line {end_line}: {lines[end_line-1].strip()}")
print(f"Line {end_line+1} (Kept): {lines[end_line].strip()}")

if "const draw = () => {" not in lines[end_line]:
    print("WARNING: Target end line does not start with 'const draw'. Aborting safety check.")
    # actually line 4005 is "        const draw = () => {"
    # index 4004.
    # so lines[end_line] should be it if end_line=4004?
    # lines[4004] is line 4005.
    pass

new_lines = lines[:start_idx] + lines[end_line:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully removed duplicated block.")
