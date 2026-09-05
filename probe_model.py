from ultralytics import YOLO
import sys

try:
    m = YOLO(r"c:\SIH MODEL\weights\yolo26n.pt")
    print("FRIEND MODEL CLASSES:")
    print(m.names)
except Exception as e:
    print(e)

# Also check native default model classes for motorcycles
try:
    m2 = YOLO('yolo11n.pt')
    print("NATIVE COCO CLASSES:")
    print(m2.names)
except:
    pass
