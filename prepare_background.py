import os
import tarfile
import random
from pathlib import Path
import uuid
import shutil

base_dir = Path('c:/SIH MODEL/New_Datasets/India_Traffic_Signs')
dest_img_train = Path('c:/SIH MODEL/RDD_Combined/images/train')
dest_lbl_train = Path('c:/SIH MODEL/RDD_Combined/labels/train')
dest_img_val = Path('c:/SIH MODEL/RDD_Combined/images/val')
dest_lbl_val = Path('c:/SIH MODEL/RDD_Combined/labels/val')

os.makedirs(dest_img_train, exist_ok=True)
os.makedirs(dest_lbl_train, exist_ok=True)
os.makedirs(dest_img_val, exist_ok=True)
os.makedirs(dest_lbl_val, exist_ok=True)

temp_dir = Path('c:/SIH MODEL/New_Datasets/TempExtraction')
os.makedirs(temp_dir, exist_ok=True)

for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.tar.gz'):
            print(f'Extracting {f}...')
            try:
                with tarfile.open(os.path.join(root, f), 'r:gz') as tar:
                    tar.extractall(path=temp_dir)
            except Exception as e:
                print(e)
        elif f.lower().endswith(('.jpg', '.png', '.jpeg')):
            shutil.copy(os.path.join(root, f), temp_dir / f"{uuid.uuid4().hex[:8]}{os.path.splitext(f)[1]}")

count = 0
for root, dirs, files in os.walk(temp_dir):
    for f in files:
        if f.lower().endswith(('.jpg', '.png', '.jpeg')):
            is_train = random.random() < 0.85
            img_dest_dir = dest_img_train if is_train else dest_img_val
            lbl_dest_dir = dest_lbl_train if is_train else dest_lbl_val
            
            uid = uuid.uuid4().hex[:8]
            ext = os.path.splitext(f)[1]
            new_name = f'bg_sign_{uid}'
            
            shutil.copy(os.path.join(root, f), img_dest_dir / f'{new_name}{ext}')
            
            with open(lbl_dest_dir / f'{new_name}.txt', 'w') as label_f:
                label_f.write("")
            count += 1

shutil.rmtree(temp_dir)
print(f'Processed {count} background indicator images directly into RDD_Combined.')
