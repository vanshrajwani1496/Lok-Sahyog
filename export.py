from ultralytics import YOLO
import argparse
import os

def export_model(model_path='yolo11n.pt', export_format='onnx', int8=True):
    print(f"Loading model from {model_path}...")
    if not os.path.exists(model_path):
        print(f"Warning: {model_path} not found. Attempting to download standard weights.")
    
    model = YOLO(model_path)
    
    print(f"Exporting model to {export_format} (INT8 quantization={int8})...")
    # Using Ultralytics export utility. For INT8 ONNX, it may require a representative dataset for calibration.
    # In prototyping, this command triggers the export logic.
    exported_path = model.export(format=export_format, int8=int8, imgsz=640)
    print(f"Export complete. Model saved to {exported_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Export YOLOv11 for Edge Deployment")
    parser.add_argument('--weights', type=str, default='yolo11n.pt', help='Model weights path')
    parser.add_argument('--format', type=str, default='onnx', help='Format to export (onnx, tflite, openvino)')
    parser.add_argument('--int8', action='store_true', default=True, help='Enable INT8 quantization')
    args = parser.parse_args()
    
    export_model(args.weights, args.format, args.int8)
