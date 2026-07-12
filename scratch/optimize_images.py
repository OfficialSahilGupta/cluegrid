import os
from PIL import Image

def optimize_images():
    src_red_dir = "/Volumes/Sahil's Space/Trinetra/cluegrid/cards-overlay-flip-picture/red-team-card"
    src_blue_dir = "/Volumes/Sahil's Space/Trinetra/cluegrid/cards-overlay-flip-picture/blue-team-cards"
    
    dest_red_dir = "/Volumes/Sahil's Space/Trinetra/cluegrid/apps/web/public/game-board-card/red-team-card"
    dest_blue_dir = "/Volumes/Sahil's Space/Trinetra/cluegrid/apps/web/public/game-board-card/blue-team-cards"
    
    os.makedirs(dest_red_dir, exist_ok=True)
    os.makedirs(dest_blue_dir, exist_ok=True)
    
    # Process Red Team Cards
    print("Processing Red Team Cards...")
    for filename in sorted(os.listdir(src_red_dir)):
        if filename.endswith(".png"):
            src_path = os.path.join(src_red_dir, filename)
            base_name = os.path.splitext(filename)[0]
            dest_path = os.path.join(dest_red_dir, f"{base_name}.webp")
            
            with Image.open(src_path) as img:
                # Resize if larger than 400px
                max_size = 400
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                # Convert to RGB if it has alpha but we want webp transparent/non-transparent depending on image
                # Let's keep RGBA if it exists to preserve transparency if there is any, else convert
                img.save(dest_path, "WEBP", quality=80)
            
            print(f"Compressed {filename} ({os.path.getsize(src_path)/1024/1024:.2f}MB) -> {base_name}.webp ({os.path.getsize(dest_path)/1024:.2f}KB)")

    # Process Blue Team Cards
    print("\nProcessing Blue Team Cards...")
    for filename in sorted(os.listdir(src_blue_dir)):
        if filename.endswith(".png"):
            src_path = os.path.join(src_blue_dir, filename)
            base_name = os.path.splitext(filename)[0]
            dest_path = os.path.join(dest_blue_dir, f"{base_name}.webp")
            
            with Image.open(src_path) as img:
                max_size = 400
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                img.save(dest_path, "WEBP", quality=80)
            
            print(f"Compressed {filename} ({os.path.getsize(src_path)/1024/1024:.2f}MB) -> {base_name}.webp ({os.path.getsize(dest_path)/1024:.2f}KB)")

if __name__ == "__main__":
    optimize_images()
