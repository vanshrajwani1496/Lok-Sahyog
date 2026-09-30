import os
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone
from typing import List
import threading
import time
import random
import requests

from database import engine, Base, get_db
import models
from schemas import PotholePayload, PotholeResponse, CityResponse, MunicipalZoneResponse
from h3_utils import get_h3_index

from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router

# Automatically creates tables in your Supabase database upon server start
Base.metadata.create_all(bind=engine)
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE potholes ADD COLUMN IF NOT EXISTS type VARCHAR DEFAULT 'pothole'"))
    conn.execute(text("ALTER TABLE potholes ADD COLUMN IF NOT EXISTS bbox JSONB"))
    conn.execute(text("ALTER TABLE potholes ADD COLUMN IF NOT EXISTS track_id INTEGER"))
    conn.execute(text("ALTER TABLE potholes ADD COLUMN IF NOT EXISTS event_id VARCHAR"))
    conn.execute(text("ALTER TABLE potholes ADD COLUMN IF NOT EXISTS camera_id VARCHAR"))
    conn.execute(text("ALTER TABLE potholes ADD COLUMN IF NOT EXISTS evidence JSONB"))
    try:
        conn.execute(text("DROP INDEX IF EXISTS ix_potholes_h3_index CASCADE"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_potholes_h3_index ON potholes(h3_index)"))
    except Exception as e:
        print("Index remap failed silently:", e)

app = FastAPI(title="Pothole Sensing API", version="1.0.0")

app.include_router(auth_router)

# --- FLEET SIMULATOR INJECTION ---
ROUTES = [
    {"name": "8A (Secur to Chandrayan)", "bounds": [17.30, 17.45, 78.43, 78.50], "bus_id": "BUS-042"},
    {"name": "10K (Secur to Sanath)", "bounds": [17.40, 17.50, 78.40, 78.50], "bus_id": "BUS-104"},
    {"name": "5K (Mehdipatnam to Secur)", "bounds": [17.38, 17.45, 78.42, 78.52], "bus_id": "BUS-088"},
    {"name": "218 (Patancheru to Dilsukh)", "bounds": [17.36, 17.53, 78.26, 78.53], "bus_id": "BUS-218"},
    {"name": "49M (Secur to Mehdipatnam)", "bounds": [17.38, 17.45, 78.42, 78.52], "bus_id": "BUS-049"},
]

def mock_get_h3_index(lat, lon):
    cell_lat = 0.0032
    cell_lng = 0.0034
    x = (lon - 78.4730) / cell_lng
    y = (lat - 17.3770) / cell_lat
    q = round(x - y / 2)
    r = round(y)
    seed = ((q + 512) * 1024 + (r + 512)) & 0xFFFFFFFF
    body = (seed * 2654435761) & 0xFFFFFFFF
    hex_body = hex(body)[2:].zfill(8)[:6]
    hex_tail = hex((seed * 97) % 4096)[2:].zfill(3)
    return f"89283{hex_body}{hex_tail}fff"[:15]

def simulate_bus(route):
    time.sleep(5)  # Let uvicorn boot up completely
    lat = random.uniform(route['bounds'][0], route['bounds'][1])
    lon = random.uniform(route['bounds'][2], route['bounds'][3])
    
    cities_pool = []
    try:
        cities_pool = requests.get('http://localhost:8000/api/v1/cities').json()
    except Exception:
        pass

    while True:
        lat += (random.random() - 0.5) * 0.0007
        lon += (random.random() - 0.5) * 0.0007
        if random.random() < 0.15:
            city_id = random.choice(cities_pool)['id'] if cities_pool else None
            payload = {
                "bus_id": route['bus_id'],
                "city_id": city_id,
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                "location": {
                    "latitude": round(lat, 5),
                    "longitude": round(lon, 5),
                    "h3_index": mock_get_h3_index(lat, lon)
                },
                "detection": {
                    "confidence": round(random.uniform(0.60, 0.95), 2),
                    "type": random.choice(["pothole", "road_damage", "waterlogging", "vehicle", "vehicle", "vehicle", "vehicle", "vehicle", "motorcycle", "motorcycle", "motorcycle"]),
                    "bbox": [round(random.uniform(0.1, 0.4), 2), round(random.uniform(0.1, 0.4), 2), round(random.uniform(0.5, 0.9), 2), round(random.uniform(0.5, 0.9), 2)],
                    "track_id": random.randint(1000, 9999)
                }
            }
            try:
                requests.post('http://localhost:8000/api/v1/telemetry', json=payload, timeout=2)
            except Exception:
                pass
        time.sleep(random.uniform(2, 5))

simulation_active = False

@app.post("/api/v1/simulation/start")
def start_background_fleet():
    global simulation_active
    if simulation_active:
        return {"status": "already_running"}
    
    simulation_active = True
    for r in ROUTES:
        threading.Thread(target=simulate_bus, args=(r,), daemon=True).start()
    return {"status": "started", "message": "City-scale simulated fleet activated"}
# ---------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        pass

@app.get("/")
def home():
    return {"status": "online", "message": "Pothole Sensing API is running"}

@app.get("/api/v1/cities", response_model=List[CityResponse])
def get_cities(db: Session = Depends(get_db)):
    return db.query(models.City).all()

@app.get("/api/v1/cities/{city_id}/zones", response_model=List[MunicipalZoneResponse])
def get_city_zones(city_id: str, db: Session = Depends(get_db)):
    return db.query(models.MunicipalZone).filter(models.MunicipalZone.city_id == city_id).all()

@app.post("/api/v1/telemetry")
def process_telemetry(payload: PotholePayload, db: Session = Depends(get_db)):
    # Respect the edge-provided H3 index strictly to sync identically with the React UI
    hex_id = payload.location.h3_index
    
    # Always create a new incident row to capture full visual telemetry trace in the UI dashboard
    new_incident = models.PotholeIncident(
        h3_index=hex_id,
        city_id=payload.city_id,
        latitude=payload.location.latitude,
        longitude=payload.location.longitude,
        confidence=payload.detection.confidence,
        type=payload.detection.type,
        bus_id=payload.bus_id,
        report_count=1,
        bbox=payload.detection.bbox,
        track_id=payload.detection.track_id,
        event_id=payload.event_id,
        camera_id=payload.camera_id,
        evidence=payload.evidence
    )
    db.add(new_incident)
    db.commit()
    
    return {
        "status": "new_incident_detected",
        "h3_index": hex_id,
        "upload_image": True
    }

@app.post("/api/v1/potholes/{hex_id}/image")
async def upload_image(hex_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    incident = db.query(models.PotholeIncident).filter_by(h3_index=hex_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    file_path = f"uploads/{hex_id}.jpg"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    incident.image_url = f"/static/{hex_id}.jpg"
    db.commit()
    return {"status": "success", "image_url": incident.image_url}

@app.post("/api/v1/incidents/{incident_id}/acknowledge")
def acknowledge_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.PotholeIncident).filter(models.PotholeIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = "acknowledged"
    incident.acknowledged_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "acknowledged", "id": incident.id}

@app.post("/api/v1/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: int, file: UploadFile = File(None), db: Session = Depends(get_db)):
    incident = db.query(models.PotholeIncident).filter(models.PotholeIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    if file:
        file_path = f"uploads/resolved_{incident_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        incident.resolution_photo_path = f"/static/resolved_{incident_id}_{file.filename}"
        
    incident.status = "resolved"
    incident.resolved_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "resolved", "id": incident.id, "photo": incident.resolution_photo_path}

@app.get("/api/v1/potholes", response_model=List[PotholeResponse])
def get_map_data(city_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.PotholeIncident)
    if city_id:
        query = query.filter(models.PotholeIncident.city_id == city_id)
    return query.all()