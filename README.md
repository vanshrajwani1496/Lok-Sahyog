# Lok-Sahyog Multi-Hazard Platform

Lok-Sahyog is an AI-powered urban infrastructure analysis platform designed for edge-to-cloud road hazard detection. It dynamically detects potholes, waterlogging, damaged signage, and vehicles using parallel YOLO neural networks.

## Repository Structure
- `/pothole_backend`: FastAPI Cloud Gateway & Supabase Postgres Models
- `/urban-sense-live-main`: React / TypeScript interactive interactive Map Dashboard
- `inference.py`: Edge Node inference loop utilizing YOLO tracking.

## Quick Start Guide

### 1. Edge Inference (AI Node)
Ensure you have Python 3.11 installed.
```bash
# Install dependencies
pip install -r requirements.txt

# Run the Inference Engine (using IP WebCam or 0 for local webcam)
python inference.py --source http://<YOUR_PHONE_IP>:8080/video
```

### 2. Cloud Server (FastAPI Backend)
Runs the telemetry receiver and fleet simulator.
```bash
cd pothole_backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Web Dashboard (React)
Runs the interactive H3 Hexagonal overlay map.
```bash
cd urban-sense-live-main
npm install
npm run dev
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

