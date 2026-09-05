import os
import shutil
from pathlib import Path

# Paths configuration
BASE_DIR = Path(r"C:\SIH MODEL\RDD_Combined")
OUTPUT_DIR = Path(r"C:\SIH MODEL\RDD_D40_Only")

# Class index 3 corresponds to 'Potholes' (D40) in RDD2022
TARGET_CLASS_ID = "3" 

def filter_dataset_robust():
    print(f"⚡ Running recursive D40 dataset scanner on: {BASE_DIR}")
    
    out_img_dir = OUTPUT_DIR / "images"
    out_lbl_dir = OUTPUT_DIR / "labels"
    out_img_dir.mkdir(parents=True, exist_ok=True)
    out_lbl_dir.mkdir(parents=True, exist_ok=True)
    
    if not BASE_DIR.exists():
        print(f"❌ Error: Base directory not found at {BASE_DIR}")
        return

    # Find ALL .txt files recursively (handles train/val/labels subfolders)
    all_txt_files = list(BASE_DIR.rglob("*.txt"))
    label_files = [
        f for f in all_txt_files 
        if OUTPUT_DIR not in f.parents 
        and f.name.lower() not in ["classes.txt", "dataset.yaml", "readme.txt"]
    ]
    
    print(f"📁 Found {len(label_files)} label files across all subdirectories...")

    # Pre-index all image files for instant lookup regardless of folder structure
    print("🔍 Indexing image files...")
    image_extensions = {".jpg", ".jpeg", ".png", ".JPG", ".PNG"}
    image_map = {}
    for img_path in BASE_DIR.rglob("*"):
        if img_path.suffix in image_extensions and OUTPUT_DIR not in img_path.parents:
            image_map[img_path.stem] = img_path

    print(f"🖼️ Found {len(image_map)} images indexed.")

    kept_count = 0

    for lbl_path in label_files:
        try:
            with open(lbl_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except Exception:
            continue

        d40_lines = []
        for line in lines:
            parts = line.strip().split()
            if parts and parts[0] == TARGET_CLASS_ID:
                # Remap class index to 0 for single-class YOLO training
                parts[0] = "0" 
                d40_lines.append(" ".join(parts))

        if d40_lines:
            base_name = lbl_path.stem
            
            # Match image via fast dictionary lookup
            if base_name in image_map:
                img_src = image_map[base_name]
                
                # Write filtered label with re-mapped class ID
                with open(out_lbl_dir / f"{base_name}.txt", "w", encoding="utf-8") as f:
                    f.write("\n".join(d40_lines) + "\n")
                
                # Copy matching image
                shutil.copy2(img_src, out_img_dir / f"{base_name}{img_src.suffix}")
                kept_count += 1

    print(f"✅ Finished! Successfully isolated {kept_count} images containing D40 (Potholes).")
    print(f"📂 Single-class dataset ready at: {OUTPUT_DIR}")

if __name__ == "__main__":
    filter_dataset_robust()