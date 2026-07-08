import os
from PIL import Image

src_path = './public/Kinefit foto perfil.png'
dest_paths = [
    './src/app/apple-icon.png',
    './public/apple-touch-icon.png'
]

print("Generating Apple Touch Icons...")

if os.path.exists(src_path):
    img = Image.open(src_path)
    # Resize to 180x180 pixels for iOS Safari Apple Touch Icon standard
    img_resized = img.resize((180, 180), Image.Resampling.LANCZOS)
    
    for path in dest_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img_resized.save(path, 'PNG', optimize=True)
        print(f"Generated icon: {path} (size: {os.path.getsize(path)} bytes)")
else:
    print(f"Error: source image not found at {src_path}")
