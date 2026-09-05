import os
import argparse
from ultralytics import YOLO

def train_yolo(data_yaml, epochs=50, batch_size=16, imgsz=640, model_name='yolo11n.yaml'):
    # Load a YAML for configuring the architecture, or load pretrained weights
    # For YOLOv11 nano we start from a preset if available, otherwise yolo11n.pt
    print(f"Initializing YOLO with model: {model_name}")
    # Initialize the model (Note: Ensure YOLOv11 is supported in the ultralytics version being used)
    # yolo11n as a placeholder for ultralytics next model version
    try:
        model = YOLO(model_name)
    except Exception as e:
        print(f"Failed to load {model_name}. Attempting to fallback to yolov8n.pt if 11 isn't found locally: {e}")
        model = YOLO('yolov8n.pt') 

    print(f"Starting training on dataset {data_yaml} for {epochs} epochs...")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=imgsz,
        name='sih_pothole_model',
        project='runs/train',
        device='', # auto-selects GPU if available, else CPU
        optimizer='auto',
        resume=True if 'sih_pothole_model' in model_name else False
    )
    print("Training complete!")
    print(results)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Train YOLO model for SIH26124 Edge Pothole Detection")
    parser.add_argument('--data', type=str, default='dataset.yaml', help='Path to dataset.yaml (RDD2022 format)')
    parser.add_argument('--epochs', type=int, default=50, help='Number of training epochs')
    parser.add_argument('--batch', type=int, default=16, help='Batch size (Restored to 16 for 6GB VRAM)')
    parser.add_argument('--model', type=str, default='yolo11n.pt', help='Base model to use (yolo11n, yolo11s)')
    args = parser.parse_args()
    
    # Ensure data yaml exists
    if not os.path.exists(args.data):
        print(f"WARNING: Dataset config '{args.data}' not found. Please setup RDD2022 data.yaml before running.")
    else:
        train_yolo(args.data, args.epochs, args.batch, model_name=args.model)
