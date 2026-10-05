# Lok-Sahyog Multi-Hazard Platform

Lok-Sahyog is an AI-powered urban infrastructure analysis platform designed for edge-to-cloud road hazard detection. It dynamically detects potholes, waterlogging, damaged signage, and vehicles using parallel YOLO neural networks.

## Repository Structure
- `/pothole_backend`: FastAPI Cloud Gateway & Supabase Postgres Models
- `/urban-sense-live-main`: React / TypeScript interactive interactive Map Dashboard
- `inference.py`: Edge Node inference loop utilizing YOLO tracking.

## 🚀 SIH Judge Evaluation: How to Run the Project

Welcome! This system is designed for a seamless local evaluation of the **Lok-Sahyog Edge-to-Cloud multi-hazard mapping project**. You will need three separate terminal windows to run all structural layers of the stack.

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

