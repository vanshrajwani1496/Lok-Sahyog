import cv2
import time
import h3
import json
import requests
from ultralytics import YOLO
from schema import BusTelemetryEvent, LocationDatapoint, HazardDetection

# Mock device info
DEVICE_ID = "Proto-Node-1"
# Simulated GPS coordinate (e.g. some location in India)
SIMULATED_LAT = 17.3770  # Begum Bazar
SIMULATED_LON = 78.4730

def get_h3_index(lat, lon, resolution=10):
    # Using actual Uber H3 native integration
    return h3.latlng_to_cell(lat, lon, resolution) if hasattr(h3, 'latlng_to_cell') else h3.geo_to_h3(lat, lon, resolution)

def run_inference(model_path=r'runs\detect\runs\train\sih_pothole_model-6\weights\last.pt', source='0', server_url='http://localhost:8080/api/telemetry'):
    print(f"Loading primary hazard model {model_path}...")
    model_hazards = YOLO(model_path)
    print("Loading secondary companion model (yolo26n.pt) for vehicles...")
    model_vehicles = YOLO(r'weights\yolo26n.pt')
    
    # In a real environment, source would be the Pi Camera or a video stream
    cap = cv2.VideoCapture(source if not source.isdigit() else int(source))
    
    frame_count = 0
    import random
    # Override IP geolocator to hardcode Vasavi College of Engineering as the physical origin for the live pitch
    base_lat, base_lon = (17.3808, 78.3821)
    current_lat = base_lat
    current_lon = base_lon
    
    # Establish a randomized trajectory vector so the 'Bus' physically drives over the map
    lat_momentum = (random.random() - 0.5) * 0.0006
    lon_momentum = (random.random() - 0.5) * 0.0006
    
    # Throttle matrix to prevent database explosion (1 request per second per hazard type)
    last_post_times = {}
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Lock GPS coordinates to a fixed real-world location for the pitch demo
        current_h3 = get_h3_index(current_lat, current_lon)
        mock_bus_id = "ME (Demo Camera)"
            
        # 1. Run inference on custom hazards
        results_hazards = model_hazards(frame, verbose=False, conf=0.35)
        
        # 2. Run inference using friend's model (COCO classes 1=bike, 2=car, 3=motorcycle, 5=bus, 7=truck)
        results_vehicles = model_vehicles(frame, verbose=False, conf=0.25, classes=[1, 2, 3, 5, 7])
        frame_detections = []
        
        for r in results_hazards:
            boxes = r.boxes
            for box in boxes:
                # Extract normalized relative coordinates & confidence for authentic React mapping
                b = box.xyxyn[0].cpu().numpy()
                conf = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                
                # Custom confidence thresholding: Potholes (Class 3) must hit 55%
                if cls_id == 3 and conf < 0.55:
                    continue
                
                if cls_id in [0, 1, 2, 3, 4, 5]:
                    if cls_id == 3:
                        det_type = "pothole"
                    elif cls_id == 4:
                        det_type = "waterlogging"
                    elif cls_id == 5:
                        det_type = "damaged_sign"
                    else:
                        det_type = "road_damage"
                    
                    
                    # Temporal Debounce check
                    now = time.time()
                    if now - last_post_times.get(det_type, 0) < 1.0:
                        continue
                    
                    # Construct an event PER incident based on the updated schema
                    telemetry = BusTelemetryEvent(
                        bus_id=mock_bus_id,
                        # Generate proper UTC ISO8601 formatting for timestamp
                        timestamp=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        location=LocationDatapoint(
                            latitude=round(current_lat, 5),
                            longitude=round(current_lon, 5),
                            h3_index=current_h3
                        ),
                        detection=HazardDetection(
                            type=det_type,
                            confidence=float(round(conf, 2)),
                            # Transmit normalized float coordinates for exact overlay rendering
                            bbox=[float(round(b[0], 4)), float(round(b[1], 4)), float(round(b[2], 4)), float(round(b[3], 4))]
                        )
                    )
                    
                    json_payload = telemetry.to_compact_json()
                    
                    print(f"Detected {det_type}. Emitting: {json_payload}")
                    last_post_times[det_type] = now
                    
                    # Standard HTTP POST back to FastAPI Cloud Gateway
                    try:
                        resp = requests.post('http://localhost:8000/api/v1/telemetry', data=json_payload, headers={'Content-Type': 'application/json'}, timeout=1)
                        if resp.status_code != 200:
                             print(f"API rejection: {resp.status_code} {resp.text}")
                    except requests.exceptions.RequestException as e:
                        print("API Gateway offline or unresponsive:", e)
                
        frame_count += 1
        
        # First plot the intricate hazard polygons and labels natively
        res_plot = results_hazards[0].plot()
        
        # Then manually draw the Vehicle bounding boxes over the plot so we don't overwrite the hazard plots
        for r in results_vehicles:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                # Map exactly to friend's model COCO layout
                lbl = "Car" if cls_id == 2 else "Bus" if cls_id == 5 else "Truck" if cls_id == 7 else "Bike" if cls_id == 1 else "Motorcycle"
                cv2.rectangle(res_plot, (x1, y1), (x2, y2), (255, 165, 0), 2)
                cv2.putText(res_plot, lbl, (x1, max(15, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 165, 0), 2)
        
        # Dynamically scale high-res phone camera feeds down so they don't consume the entire laptop monitor
        res_plot = cv2.resize(res_plot, (800, 600))
        
        cv2.imshow("Pothole Detection - Prototype", res_plot)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Run Edge Inference Prototype")
    parser.add_argument('--weights', type=str, default=r'runs\detect\runs\train\sih_pothole_model-6\weights\last.pt')
    parser.add_argument('--source', type=str, default='http://192.168.0.103:8080/video', help="Camera index or video file")
    parser.add_argument('--server', type=str, default='http://localhost:8080/api/telemetry')
    args = parser.parse_args()
    
    run_inference(args.weights, args.source, args.server)
