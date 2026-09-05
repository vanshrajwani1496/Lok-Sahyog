import os
import shutil
from pathlib import Path
import uuid

base_dir = Path('c:/SIH MODEL')
combined_dir = base_dir / 'RDD_Combined'
water_dir = base_dir / 'New_Datasets/WaterLogging'
signs_dir = base_dir / 'New_Datasets/BrokenSigns'

def process_dataset(source_dir, split, output_id_map, ignore_ids=[]):
    images_dir = source_dir / split / 'images'
    labels_dir = source_dir / split / 'labels'
    
    # In Roboflow, validations are sometimes named 'valid' instead of 'val'
    dest_split = 'val' if split == 'valid' else split
    dest_images = combined_dir / 'images' / dest_split
    dest_labels = combined_dir / 'labels' / dest_split
    
    os.makedirs(dest_images, exist_ok=True)
    os.makedirs(dest_labels, exist_ok=True)
    
    if not images_dir.exists():
        return
    
    print(f'Processing {source_dir.name} - {split}...')
    count = 0
    # Roboflow images are either .jpg or .txt in labels. Use jpg for now.
    for img_path in images_dir.glob('*.jpg'):
        label_path = labels_dir / (img_path.stem + '.txt')
        
        new_lines = []
        if label_path.exists():
            with open(label_path, 'r') as f:
                lines = f.readlines()
            
            for line in lines:
                parts = line.strip().split()
                if not parts: continue
                class_id = int(parts[0])
                
                if class_id in ignore_ids:
                    continue
                
                if class_id in output_id_map:
                    parts[0] = str(output_id_map[class_id])
                    new_lines.append(' '.join(parts))
                else:
                    # just in case
                    new_lines.append(' '.join(parts))
        
        uid = uuid.uuid4().hex[:8]
        new_stem = f'{img_path.stem}_{uid}'
        
        new_img_dest = dest_images / f'{new_stem}.jpg'
        new_label_dest = dest_labels / f'{new_stem}.txt'
        
        shutil.copy(img_path, new_img_dest)
        
        with open(new_label_dest, 'w') as f:
            f.write('\n'.join(new_lines))
        
        count += 1
    print(f'-> Merged {count} images/labels.')

print('--- Starting Unified Dataset Merging ---')

# Water: map 0, 1 -> 4
process_dataset(water_dir, 'train', {0: 4, 1: 4})
process_dataset(water_dir, 'valid', {0: 4, 1: 4})

# Signs: map 0,1,2,3,5 -> 5. Ignore 4 (not-damaged).
process_dataset(signs_dir, 'train', {0: 5, 1: 5, 2: 5, 3: 5, 5: 5}, ignore_ids=[4])
process_dataset(signs_dir, 'valid', {0: 5, 1: 5, 2: 5, 3: 5, 5: 5}, ignore_ids=[4])

print('\n--- Updating dataset.yaml ---')
yaml_path = combined_dir.parent / 'dataset.yaml'
with open(yaml_path, 'r') as f:
    yaml_data = f.read()

if 'waterlogging' not in yaml_data:
    with open(yaml_path, 'a') as f:
        f.write("  4: 'waterlogging'\n")
        f.write("  5: 'damaged sign'\n")
    print('-> Updated dataset.yaml with IDs 4 and 5.')
else:
    print('-> dataset.yaml already updated.')

print('DONE.')
