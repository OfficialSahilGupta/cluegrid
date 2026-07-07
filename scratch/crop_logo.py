import os
from PIL import Image

# Path to the source image
src_path = "/Users/sahil/.gemini/antigravity-cli/brain/9d83084b-af62-4faf-a0e8-972f10500981/cluegrid_spy_logo_icon_1783413635745.jpg"
dest_png = "/Volumes/Sahil's Space/Trinetra/cluegrid/apps/web/public/favicon.png"
dest_jpg = "/Volumes/Sahil's Space/Trinetra/cluegrid/apps/web/public/cluegrid_spy_logo.jpg"

def crop_and_center():
    if not os.path.exists(src_path):
        print(f"Error: Source image not found at {src_path}")
        return

    img = Image.open(src_path).convert("RGB")
    width, height = img.size

    # Find the bounding box of non-black pixels (threshold = 25)
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b = img.getpixel((x, y))
            # If the pixel is not dark (brightness threshold > 25)
            if max(r, g, b) > 25:
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y

    w = max_x - min_x
    h = max_y - min_y
    cx = min_x + w // 2
    cy = min_y + h // 2

    # Add a clean 25% margin padding around the icon
    margin = int(max(w, h) * 0.25)
    size = max(w, h) + 2 * margin

    # Crop bounds
    left = max(0, cx - size // 2)
    top = max(0, cy - size // 2)
    right = min(width, cx + size // 2)
    bottom = min(height, cy + size // 2)

    # Force square crop
    crop_w = right - left
    crop_h = bottom - top
    crop_size = min(crop_w, crop_h)

    # Adjust to make a perfect square centered on cx, cy
    left = cx - crop_size // 2
    top = cy - crop_size // 2
    right = left + crop_size
    bottom = top + crop_size

    # Crop and resize to 512x512 for a perfect favicon and logo file
    cropped = img.crop((left, top, right, bottom))
    resized = cropped.resize((512, 512), Image.Resampling.LANCZOS)

    # Save outputs
    resized.save(dest_png, "PNG")
    resized.save(dest_jpg, "JPEG", quality=95)
    print(f"Success: Cropped and saved perfectly centered logo to {dest_png} and {dest_jpg}")

if __name__ == "__main__":
    crop_and_center()
