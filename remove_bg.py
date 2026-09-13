from PIL import Image
import sys

def remove_background(input_path, output_path, tolerance=30):
    try:
        # Load the image
        img = Image.open(input_path).convert("RGBA")
        
        # Get background color from top-left corner
        bg_color = img.getpixel((0, 0))
        
        # Create a new image data list
        new_data = []
        for item in img.getdata():
            # Check if pixel is within tolerance of the background color
            if all(abs(item[i] - bg_color[i]) <= tolerance for i in range(3)):
                new_data.append((255, 255, 255, 0)) # Transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print("Background removed successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_background(sys.argv[1], sys.argv[2])
