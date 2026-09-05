import os
import glob
from pathlib import Path

# This script removes all labels that are NOT class 0 (assuming D40 Pothole is mapped to 0)
# and removes the corresponding image if the text file becomes empty (no potholes).
# Run this after you download the India dataset to shrink it down vastly!

def filter_dataset_to_potholes_only(dataset_dir, target_class="3"):
    print(f"Scanning labels in {dataset_dir} for class {target_class}...")
    
    label_files = glob.glob(os.path.join(dataset_dir, '**', '*.txt'), recursive=True)
    images_deleted = 0
    
    for txt_file in label_files:
        # Don't touch classes.txt if it exists
        if 'classes.txt' in txt_file:
            continue
            
        with open(txt_file, 'r') as f:
            lines = f.readlines()
            
        # Keep only lines that start with our target class (e.g., '3 ')
        filtered_lines = [line for line in lines if line.startswith(f'{target_class} ')]
        
        # If no target found in this image, remove the label and the image
        if len(filtered_lines) == 0:
            os.remove(txt_file)
            
            # Find the corresponding image
            img_types = ['.jpg', '.png', '.jpeg']
            txt_path = Path(txt_file)
            # Try substituting 'labels' for 'images' in the path
            parent_dir = str(txt_path.parent).replace('labels', 'images')
            base_name = txt_path.stem
            
            found_img = False
            for ext in img_types:
                img_path = os.path.join(parent_dir, base_name + ext)
                if os.path.exists(img_path):
                    os.remove(img_path)
                    images_deleted += 1
                    found_img = True
                    break
        else:
            # Overwrite the text file with only the pothole annotations
            with open(txt_file, 'w') as f:
                f.writelines(filtered_lines)
                
    print(f"Filtering complete! Deleted {images_deleted} images that contained no potholes.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Filter dataset to keep only specific class")
    parser.add_argument('--dir', type=str, required=True, help="Path to your 'datasets' folder")
    parser.add_argument('--class_id', type=str, default='3', help="Class ID to keep (default 3 for Potholes)")
    args = parser.parse_args()
    
    filter_dataset_to_potholes_only(args.dir, args.class_id)
