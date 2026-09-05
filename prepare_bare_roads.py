import os
import random
import shutil
import uuid
from pathlib import Path

base_dir = Path('c:/SIH MODEL/New_Datasets/bare roads.v6i.yolov8')
dest_img_train = Path('c:/SIH MODEL/RDD_Combined/images/train')
dest_lbl_train = Path('c:/SIH MODEL/RDD_Combined/labels/train')
dest_img_val = Path('c:/SIH MODEL/RDD_Combined/images/val')
dest_lbl_val = Path('c:/SIH MODEL/RDD_Combined/labels/val')

count = 0
for ext in ['*.jpg', '*.png', '*.jpeg']:
    for img_path in list(base_dir.rglob(ext)):
        is_train = random.random() < 0.85
        img_dest_dir = dest_img_train if is_train else dest_img_val
        lbl_dest_dir = dest_lbl_train if is_train else dest_lbl_val
        
        uid = uuid.uuid4().hex[:8]
        new_name = f'bg_road_{uid}'
        
        # Copy image
        shutil.copy(img_path, img_dest_dir / f'{new_name}{img_path.suffix}')
        
        # Write empty label file
        with open(lbl_dest_dir / f'{new_name}.txt', 'w') as label_f:
            label_f.write("")
        count += 1
print(f'Processed {count} background bare roads images directly into RDD_Combined.')
