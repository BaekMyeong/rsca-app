from PIL import Image, ImageDraw
import sys

def mask_tighter(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        
        # Center of the image
        cx, cy = width / 2, height / 2
        
        # Tighter radius to completely exclude the base and shadow at the bottom
        # The base seems to protrude quite a bit. Let's use 42% of width as radius.
        r = width * 0.42 
        
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
        
        result = Image.new("RGBA", (width, height))
        result.paste(img, (0, 0), mask=mask)
        
        result.save(output_path, "PNG")
        print(f"Tighter mask applied. Saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    mask_tighter(sys.argv[1], sys.argv[2])
