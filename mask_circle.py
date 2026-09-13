from PIL import Image, ImageDraw
import sys

def mask_circle(input_path, output_path):
    try:
        # Load the image
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Create a circular mask
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        
        # Draw a circle. We use a slightly smaller radius to ensure the stand is clipped.
        # Assuming the stand is at the very bottom, let's make the circle diameter slightly less than height.
        # For a perfect sphere, the rings usually span almost the full width/height.
        # Let's use 47% of the size as radius.
        margin = int(width * 0.04) 
        draw.ellipse((margin, margin, width - margin, height - margin), fill=255)
        
        # Apply the mask to the image
        result = Image.new("RGBA", (width, height))
        result.paste(img, (0, 0), mask=mask)
        
        result.save(output_path, "PNG")
        print(f"Circular mask applied. Saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    mask_circle(sys.argv[1], sys.argv[2])
