import os
import shutil
from pathlib import Path
import uuid

base_dir = Path('c:/SIH MODEL')
combined_dir = base_dir / 'RDD_Combined'
new_water_dir = base_dir / 'New_Datasets'
signs_dir = base_dir / 'New_Datasets/BrokenSigns'

def process_dataset_custom(source_images_dir, source_labels_dir, dest_split, output_id_map, ignore_ids=[]):
    dest_images = combined_dir / 'images' / dest_split
    dest_labels = combined_dir / 'labels' / dest_split
    
    os.makedirs(dest_images, exist_ok=True)
    os.makedirs(dest_labels, exist_ok=True)
    
    if not source_images_dir.exists():
        return
    
    print(f'Processing {source_images_dir} -> {dest_split}...')
    count = 0
    for ext in ['*.jpg', '*.png', '*.jpeg']:
        for img_path in source_images_dir.glob(ext):
            label_path = source_labels_dir / (img_path.stem + '.txt')
            
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
                        new_lines.append(' '.join(parts))
            
            uid = uuid.uuid4().hex[:8]
            new_stem = f'{img_path.stem}_{uid}'
            
            new_img_dest = dest_images / f'{new_stem}{img_path.suffix}'
            new_label_dest = dest_labels / f'{new_stem}.txt'
            
            shutil.copy(img_path, new_img_dest)
            
            with open(new_label_dest, 'w') as f:
                f.write('\n'.join(new_lines))
            
            count += 1
    print(f'-> Merged {count} images/labels.')

print('--- Integrating New Datasets ---')

process_dataset_custom(new_water_dir / 'train' / 'images', new_water_dir / 'train' / 'labels', 'train', {0: 4})
process_dataset_custom(new_water_dir / 'valid' / 'images', new_water_dir / 'valid' / 'labels', 'val', {0: 4})

process_dataset_custom(signs_dir / 'train' / 'images', signs_dir / 'train' / 'labels', 'train', {0: 5, 1: 5, 2: 5, 3: 5, 5: 5}, ignore_ids=[4])
process_dataset_custom(signs_dir / 'valid' / 'images', signs_dir / 'valid' / 'labels', 'val', {0: 5, 1: 5, 2: 5, 3: 5, 5: 5}, ignore_ids=[4])

print('DONE.')
