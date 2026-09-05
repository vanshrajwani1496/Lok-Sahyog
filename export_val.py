from ultralytics import YOLO
import json

model = YOLO(r"runs\detect\runs\train\sih_pothole_model-6\weights\last.pt")
metrics = model.val(data="dataset.yaml", split="val", verbose=False, workers=0)

# Extract the dict directly from memory
output = {}
for k, v in metrics.results_dict.items():
    if isinstance(v, float):
        output[k] = v

try:
    class_indices = metrics.ap_class_index
    class_maps = metrics.box.map50
    for i, c in enumerate(class_indices):
        name = model.names[c]
        output[f'mAP50_{name}'] = float(class_maps[i])
except:
    pass

with open('val_metrics.json', 'w') as f:
    json.dump(output, f, indent=4)
