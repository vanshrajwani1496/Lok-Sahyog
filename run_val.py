from ultralytics import YOLO
import sys

if __name__ == '__main__':
    # Load the best/last weights from the halted training run
    model = YOLO(r"runs\detect\runs\train\sih_pothole_model-6\weights\last.pt")
    
    # Execute a native validation pass which forces YOLO to print the isolated class matrix
    print("\n--- Initiating Validation Matrix Generation ---\n")
    try:
        metrics = model.val(data="dataset.yaml", split="val", verbose=True)
        print("\n--- Validation Complete ---\n")
    except Exception as e:
        print("Validation Error:", e)
        sys.exit(1)
