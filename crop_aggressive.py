from PIL import Image, ImageDraw
import sys

def mask_aggressive(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        
        cx, cy = width / 2, height / 2
        
        # Aggressive radius to ensure only the central rings remain.
        # Reduced from 0.42 to 0.38
        r = width * 0.38 
        
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
        
        result = Image.new("RGBA", (width, height))
        result.paste(img, (0, 0), mask=mask)
        
        result.save(output_path, "PNG")
        print(f"Aggressive mask applied. Saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    mask_aggressive(sys.argv[1], sys.argv[2])
