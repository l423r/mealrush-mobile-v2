import os
import sys
from PIL import Image

def resize_icon(source_path, output_dir=None, project_root=None):
    if not os.path.exists(source_path):
        print(f"Error: Source file not found at {source_path}")
        return

    try:
        img = Image.open(source_path)
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    # Android sizes (mipmap)
    android_sizes = {
        'mipmap-mdpi': (48, 48),
        'mipmap-hdpi': (72, 72),
        'mipmap-xhdpi': (96, 96),
        'mipmap-xxhdpi': (144, 144),
        'mipmap-xxxhdpi': (192, 192),
    }

    # iOS sizes (App Icon)
    ios_sizes = {
        'icon-20': (20, 20),
        'icon-20@2x': (40, 40),
        'icon-20@3x': (60, 60),
        'icon-29': (29, 29),
        'icon-29@2x': (58, 58),
        'icon-29@3x': (87, 87),
        'icon-40': (40, 40),
        'icon-40@2x': (80, 80),
        'icon-40@3x': (120, 120),
        'icon-60': (60, 60),
        'icon-60@2x': (120, 120),
        'icon-60@3x': (180, 180),
        'icon-1024': (1024, 1024)
    }

    if output_dir:
        print(f"Generating icons in {output_dir}...")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        print("Generating Android icons...")
        android_dir = os.path.join(output_dir, 'android')
        os.makedirs(android_dir, exist_ok=True)
        for name, size in android_sizes.items():
            resized = img.resize(size, Image.Resampling.LANCZOS)
            if name.startswith('mipmap'):
                mipmap_dir = os.path.join(android_dir, name)
                os.makedirs(mipmap_dir, exist_ok=True)
                resized.save(os.path.join(mipmap_dir, 'ic_launcher.png'))
            else:
                resized.save(os.path.join(android_dir, f'{name}.png'))
            print(f"Saved {name} ({size[0]}x{size[1]})")

        print("\nGenerating iOS icons...")
        ios_dir = os.path.join(output_dir, 'ios')
        os.makedirs(ios_dir, exist_ok=True)
        for name, size in ios_sizes.items():
            resized = img.resize(size, Image.Resampling.LANCZOS)
            resized.save(os.path.join(ios_dir, f'{name}.png'))
            print(f"Saved {name} ({size[0]}x{size[1]})")

    if project_root:
        print(f"\nApplying icons to project at {project_root}...")
        
        # 1. Update assets/icon.png and assets/adaptive-icon.png
        assets_dir = os.path.join(project_root, 'assets')
        if os.path.exists(assets_dir):
            icon_1024 = img.resize((1024, 1024), Image.Resampling.LANCZOS)
            icon_1024.save(os.path.join(assets_dir, 'icon.png'))
            icon_1024.save(os.path.join(assets_dir, 'adaptive-icon.png'))
            print("Updated assets/icon.png and assets/adaptive-icon.png")
        
        # 2. Update Android resources
        android_res_dir = os.path.join(project_root, 'android', 'app', 'src', 'main', 'res')
        if os.path.exists(android_res_dir):
            for name, size in android_sizes.items():
                mipmap_dir = os.path.join(android_res_dir, name)
                if os.path.exists(mipmap_dir):
                    resized = img.resize(size, Image.Resampling.LANCZOS)
                    # Save as WebP since that's what is currently used
                    resized.save(os.path.join(mipmap_dir, 'ic_launcher.webp'), 'WEBP')
                    resized.save(os.path.join(mipmap_dir, 'ic_launcher_round.webp'), 'WEBP')
                    resized.save(os.path.join(mipmap_dir, 'ic_launcher_foreground.webp'), 'WEBP')
                    print(f"Updated {name} resources (WebP)")
        
        print("Project icons updated.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python resize_icon.py <source_image_path> [output_directory] [--project-root <path>]")
        sys.exit(1)

    source = sys.argv[1]
    output = None
    project_root = None
    
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == '--project-root':
            if i + 1 < len(args):
                project_root = args[i+1]
                i += 2
            else:
                print("Error: --project-root requires a path argument")
                sys.exit(1)
        else:
            output = args[i]
            i += 1
            
    resize_icon(source, output, project_root)
