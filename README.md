# Urban-Sense Multi-Hazard Platform

Urban-Sense is an AI-powered urban infrastructure analysis platform designed for edge-to-cloud road hazard detection. It dynamically detects potholes, waterlogging, damaged signage, and vehicles using parallel YOLO neural networks.

## Repository Structure
- `/pothole_backend`: FastAPI Cloud Gateway & Supabase Postgres Models
- `/urban-sense-live-main`: React / TypeScript interactive interactive Map Dashboard
- `inference.py`: Edge Node inference loop utilizing YOLO tracking.

## 🚀 SIH Judge Evaluation: How to Run the Project

Welcome! This system is designed for a seamless local evaluation of the **Urban-Sense Edge-to-Cloud multi-hazard mapping project**. You will need three separate terminal windows to run all structural layers of the stack.

### 1. Cloud Server (FastAPI Backend)
The backend acts as the data telemetry receiver and manages spatial state across cities. It uses an off-site Supabase Postgres Database that has already been seeded with spatial data.
```bash
# Terminal Window 1
cd pothole_backend
pip install -r requirements.txt
# Start the Uvicorn cloud gateway
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Web Dashboard (React)
The immersive analytical dashboard mapping telemetry data via real-time hexagonal grids.
```bash
# Terminal Window 2
cd urban-sense-live-main
npm install
npm run dev
```
> **Seamless Authentication:** Open `localhost:5173`. When accessing the platform, click one of the pre-configured **Restricted Regional Instances (Demo) Cards** for instant credentials. Click *Initialize Session*. The application will **securely auto-fill the dynamically generated 6-digit Multi-Factor SMS code** from the server to bypass manual logging!

### 3. Edge Inference Engine (AI Node)
To test the custom deep learning models running natively, launch the localized Python prototype daemon which parallel-processes the custom trained **YOLOv11 Pothole Detector** and the baseline **ByteTrack Vehicle Object Detector**.

```bash
# Terminal Window 3 (ensure your Python virtual environment is active)
pip install -r requirements.txt

# Option A: Run using your laptop's integrated Webcam
python inference.py --source 0

# Option B: Run using an IP Webcam (if you prefer phone mounting)
python inference.py --source http://<YOUR_PHONE_IP>:8080/video
```

> Note: To test the telemetry dashboard flowing without keeping your webcam active, you can optionally invoke our telemetry mock traffic generator in the browser: `http://localhost:8000/api/v1/simulation/start`.

## Model Lifecycle (Training, Validation & Export)

To independently train, validate, or export the object detection models used in this platform, you can use the provided utility scripts:

```bash
# 1. Train the Pothole Model
# You can customize parameters, or rely on defaults (50 epochs, batch 16, yolo11n.pt)
python train.py --data dataset.yaml --epochs 50 --batch 16 --model yolo11n.pt

# 2. Validate a Trained Model
# Calculates metrics (Precision, Recall, mAP) and extracts the validation matrix
python run_val.py

# 3. Export the Model for Edge
# Export to optimized formats like ONNX, TFLite, or OpenVINO with INT8 quantization
python export.py --weights yolo11n.pt --format onnx --int8
```

## Model Statistics

### 1. Pothole Detection (original YOLO v11 model)
- **Precision:** 56.0% (0.55973)
- **Recall:** 54.3% (0.54333)
- **mAP50:** 54.6% (0.54613)
- **mAP50-95:** 32.2% (0.32211)

### 2. Vehicle Detection & Tracking (vehicledetection_bytetrack - YOLO 11n)
- **Precision:** 80.0% (0.80042)
- **Recall:** 49.9% (0.49885)
- **mAP50:** 57.9% (0.57854)
- **mAP50-95:** 38.6% (0.38585)

---

## 🚗 Vehicle incident AI (IDD YOLO11n)

The `/VehicleDetection_ByteTrack` directory contains an end-to-end computer vision pipeline for traffic scene understanding in unstructured Indian road conditions (trained on the **India Driving Dataset**).

### Dataset Preparation
Download the dataset from [Kaggle](https://www.kaggle.com/datasets/redzapdos123/indian-driving-dataset-detections-yolov11), then extract and place the dataset split folders — `train/`, `val/`, and `test/` — directly into the `/VehicleDetection_ByteTrack` directory before running scripts.

### Vehicle Pipeline Execution
Navigate to `cd VehicleDetection_ByteTrack` and run these sequentially if you want to rebuild the model:

1. **Clean Dataset & Verify Schema:** `python cleaning_IDD.py`
2. **Base YOLO11n Training:** `python training.py`
3. **Controlled Fine-Tuning (AdamW):** `python fine_tuning.py`
4. **Standalone Inference:** `python inference.py`
5. **Urban-Sense Live Deployment:** Send incidents to the centralized dashboard using:
   ```bash
   python inference.py --source 0 --server http://localhost:8000/api/v1/telemetry --bus-id "ME (Demo Camera)" --latitude 17.3770 --longitude 78.4730
   ```

