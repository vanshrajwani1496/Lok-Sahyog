import sys
import os
import cv2
import time
import h3
import json
import requests
from ultralytics import YOLO
from datetime import datetime, timezone
from urllib.error import URLError
from urllib.request import Request, urlopen

# Path binding so we can natively import the localized tracking architectures
sys.path.append(os.path.abspath('VehicleDetection_ByteTrack'))
from incident_ai import IncidentEngine
from schema import BusDataStreamEvent, LocationDatapoint, HazardDetection

# Mock device info
DEVICE_ID = "Proto-Node-1"
# Simulated GPS coordinate (e.g. some location in India)
SIMULATED_LAT = 17.3770  # Begum Bazar
SIMULATED_LON = 78.4730

current_lat = 0.0
current_lon = 0.0

def get_h3_index(lat, lon, resolution=10):
    # Using actual Uber H3 native integration
    return h3.latlng_to_cell(lat, lon, resolution) if hasattr(h3, 'latlng_to_cell') else h3.geo_to_h3(lat, lon, resolution)

def send_bytetrack_incident(server_url, bus_id, camera_id, latitude, longitude, alert, detection):
    """Send one alert using Lok-Sahyog's existing data_stream payload shape."""
    # Reuse event categories already understood by the existing dashboard.
    event_types = {
        "congestion": "traffic_congestion",
        "pedestrian_hazard": "pedestrian_risk",
        "stalled_vehicle": "incident_vehicle",
    }
    payload = {
        "bus_id": bus_id,
        "event_id": alert.get("incident_id"),
        "camera_id": camera_id,
        "timestamp": alert.get("timestamp", datetime.now(timezone.utc).isoformat()),
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "h3_index": "",
        },
        "detection": {
            "type": event_types.get(alert["incident_type"], alert["incident_type"]),
            "confidence": alert["confidence"],
            "bbox": detection.get("bbox") if detection else None,
            "track_id": alert.get("track_id"),
        },
        "evidence": alert.get("evidence"),
    }
    try:
        resp = requests.post(server_url, json=payload, timeout=2)
        if resp.status_code >= 400:
            print(f"Lok-Sahyog rejected incident: HTTP {resp.status_code}")
        else:
            print(f"Incident sent to Lok-Sahyog: {payload['detection']['type']}")
    except (requests.exceptions.RequestException) as error:
        print(f"Could not send incident to Lok-Sahyog: {error}")

def run_inference(model_path=r'runs\detect\runs\train\sih_pothole_model-7\weights\last.pt', source='0', server_url='http://localhost:8000/api/v1/data_stream'):
    print(f"Loading primary hazard model {model_path}...")
    model_hazards = YOLO(model_path)
    
    print("Loading secondary companion model (IDD Vehicle Tracker)...")
    # Bind directly to the unified ByteTrack architecture
    model_vehicles = YOLO(r'VehicleDetection_ByteTrack\runs\detect\sih_incident_ai\yolo11n_idd_8cls_run2-3\weights\best.pt')
    
    # RELAXED DEMO PARAMETERS: 
    # Since our laptop webcams rarely view a full avenue, drop the congestion trigger down 
    # to 2 vehicles rather than 12 so that local demonstrations don't look completely empty!
    incident_engine = IncidentEngine(congestion_vehicle_count=2, history_size=10, alert_cooldown_frames=45)
    
    # In a real environment, source would be the Pi Camera or a video stream
    cap = cv2.VideoCapture(source if not source.isdigit() else int(source))
    
    frame_count = 0
    # Automatically determine physical location via IP Geolocation so the map centers correctly anywhere you travel!
    try:
        print("Acquiring GPS coordinates via IP Node...")
        req = Request('https://ipapi.co/json/')
        req.add_header('User-Agent', 'Mozilla/5.0')
        geo_data = json.loads(urlopen(req, timeout=3).read())
        base_lat, base_lon = float(geo_data['latitude']), float(geo_data['longitude'])
        print(f"Locked onto physical coordinates: {base_lat}, {base_lon} ({geo_data.get('city')})")
    except Exception as e:
        print(f"Could not fetch live GPS. Defaulting to Charminar. {e}")
        base_lat, base_lon = (17.3616, 78.4747)
        
    global current_lat, current_lon
    current_lat = base_lat
    current_lon = base_lon
    
    last_post_times = {}
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        current_h3 = get_h3_index(current_lat, current_lon)
        mock_bus_id = "ME (Demo Camera)"
            
        # 1. Run inference on custom hazards (Potholes, Signage, Waterlogging)
        # Added imgsz=640 (standardize scale), augment=True (TTA boosts recall), 
        # iou=0.45 (strict NMS prevents duplicate boxes), and half=True (FP16 speeds up augment)
        results_hazards = model_hazards(frame, verbose=False, conf=0.15, imgsz=640, augment=True, iou=0.45, half=True)
        
        # 2. Run stateful inference on IDD traffic elements via ByteTrack
        results_vehicles = model_vehicles.track(frame, verbose=False, conf=0.25, persist=True, tracker="bytetrack.yaml", imgsz=640, augment=True, iou=0.50, half=True)
        
        # Process structural hazards
        for r in results_hazards:
            boxes = r.boxes
            for box in boxes:
                b = box.xyxyn[0].cpu().numpy()
                conf = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                
                # Custom confidence thresholding: Potholes (Class 3) must hit 55%
                if cls_id == 3 and conf < 0.55:
                    continue
                    
                # Fix Context: Prevent black external desktop monitors with white text from being parsed as "Waterlogging"
                if cls_id == 4 and conf < 0.70:
                    continue
                    
                # Strict floor for Damaged Signs (Class 5) so they still get captured
                if cls_id == 5 and conf < 0.20:
                    continue
                
                if cls_id in [0, 1, 2, 3, 4, 5]:
                    if cls_id == 3: det_type = "pothole"
                    elif cls_id == 4: det_type = "waterlogging"
                    elif cls_id == 5: det_type = "damaged_sign"
                    else: det_type = "road_damage"
                    
                    # Temporal Debounce check
                    now = time.time()
                    if now - last_post_times.get(det_type, 0) < 1.0:
                        continue
                    
                    data_stream = BusDataStreamEvent(
                        bus_id=mock_bus_id,
                        timestamp=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        location=LocationDatapoint(
                            latitude=round(current_lat, 5),
                            longitude=round(current_lon, 5),
                            h3_index=current_h3
                        ),
                        detection=HazardDetection(
                            type=det_type,
                            confidence=float(round(conf, 2)),
                            bbox=[float(round(b[0], 4)), float(round(b[1], 4)), float(round(b[2], 4)), float(round(b[3], 4))]
                        )
                    )
                    
                    json_payload = data_stream.to_compact_json()
                    last_post_times[det_type] = now
                    
                    try:
                        resp = requests.post(server_url, data=json_payload, headers={'Content-Type': 'application/json'}, timeout=1)
                    except requests.exceptions.RequestException as e:
                        pass
        
        # Process vehicular behaviors & trajectories
        detections = []
        for r in results_vehicles:
            for box in r.boxes:
                if box.id is None:
                    continue
                class_id = int(box.cls[0].item())
                class_name = r.names[class_id]
                detections.append({
                    "track_id": int(box.id[0].item()),
                    "class_name": class_name,
                    "bbox": box.xyxyn[0].tolist(),
                    "confidence": float(box.conf[0].item()),
                })

        # Inject ByteTrack pipeline vectors into the spatial reasoning processor
        for alert in incident_engine.update(detections):
            if alert:
                print(f"TEMPORAL INCIDENT ALERT: {alert}")
                trigger_detection = next((item for item in detections if item["track_id"] == alert.get("track_id")), None)
                send_bytetrack_incident(server_url, mock_bus_id, "front_cam", current_lat, current_lon, alert, trigger_detection)
                
        frame_count += 1
        
        # UI Overlay Compositing
        res_plot = results_hazards[0].plot()
        
        for r in results_vehicles:
            for box in r.boxes:
                if box.id is None:
                    continue
                x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                lbl = f"{r.names[cls_id]} #{int(box.id[0].item())}"
                cv2.rectangle(res_plot, (x1, y1), (x2, y2), (255, 100, 100), 2)
                cv2.putText(res_plot, lbl, (x1, max(15, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 100, 100), 2)
        
        res_plot = cv2.resize(res_plot, (800, 600))
        cv2.imshow("Urban Sense Prototype: Multiplexed Dual-Inference Mode", res_plot)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

def nmea_to_dec(value, dir):
    if not value or not dir: return 0.0
    try:
        dot_idx = value.find('.')
        if dot_idx == -1: return 0.0
        deg_len = dot_idx - 2
        dec = float(value[:deg_len]) + float(value[deg_len:]) / 60.0
        if dir in ['S', 'W']: dec = -dec
        return dec
    except:
        return 0.0

def start_gps_daemon(port):
    import serial
    global current_lat, current_lon
    print(f"Starting hardware GPS daemon on port {port}...")
    try:
        ser = serial.Serial(port, baudrate=9600, timeout=1)
        while True:
            line = ser.readline().decode('ascii', errors='replace').strip()
            if line.startswith('$GPGGA'):
                parts = line.split(',')
                if len(parts) >= 6:
                    lat_val, lat_dir = parts[2], parts[3]
                    lon_val, lon_dir = parts[4], parts[5]
                    lat = nmea_to_dec(lat_val, lat_dir)
                    lon = nmea_to_dec(lon_val, lon_dir)
                    if lat != 0.0 and lon != 0.0:
                        current_lat = lat
                        current_lon = lon
    except Exception as e:
        print(f"GPS Hardware failed: {e}")

if __name__ == '__main__':
    import argparse
    import threading
    parser = argparse.ArgumentParser(description="Run Dual Engine Edge Inference Prototype")
    parser.add_argument('--weights', type=str, default=r'runs\detect\runs\train\sih_pothole_model-7\weights\last.pt')
    parser.add_argument('--source', type=str, default='0', help="Camera index or video file")
    parser.add_argument('--server', type=str, default='http://localhost:8000/api/v1/data_stream')
    parser.add_argument('--gps', type=str, default=None, help="Serial port for hardware GPS (e.g., COM3, /dev/ttyUSB0)")
    args = parser.parse_args()
    
    if args.gps:
        threading.Thread(target=start_gps_daemon, args=(args.gps,), daemon=True).start()
    
    run_inference(args.weights, args.source, args.server)
