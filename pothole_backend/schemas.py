from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    city_id: Optional[str] = None
    zone: Optional[str] = None
    circle: Optional[str] = None
    ward: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class OTPVerify(BaseModel):
    username: str
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    email: Optional[str] = None
    city_id: Optional[str] = None
    zone: Optional[str] = None
    circle: Optional[str] = None
    ward: Optional[str] = None

    class Config:
        from_attributes = True

class LocationData(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    h3_index: str

class HazardDetails(BaseModel):
    confidence: float = Field(..., ge=0.0, le=1.0)
    type: str
    bbox: Optional[List[float]] = None
    track_id: Optional[int] = None

class CityResponse(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    base_score: float

    class Config:
        from_attributes = True

class MunicipalZoneResponse(BaseModel):
    id: int
    city_id: str
    name: str
    h3_index: str
    lat: float
    lng: float
    risk: str

    class Config:
        from_attributes = True

class PotholePayload(BaseModel):
    bus_id: str
    city_id: Optional[str] = None
    timestamp: datetime
    location: LocationData
    detection: HazardDetails
    event_id: Optional[str] = None
    camera_id: Optional[str] = None
    evidence: Optional[dict] = None

class PotholeResponse(BaseModel):
    id: int
    city_id: Optional[str] = None
    h3_index: str
    latitude: float
    longitude: float
    confidence: float
    report_count: int
    type: str
    bus_id: str
    image_url: Optional[str] = None
    bbox: Optional[List[float]] = None
    track_id: Optional[int] = None
    event_id: Optional[str] = None
    camera_id: Optional[str] = None
    evidence: Optional[dict] = None
    
    # Hazard Resolution fields
    status: str = "open"
    resolution_photo_path: Optional[str] = None
    escalated: int = 0
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    created_at: datetime
    last_seen: datetime

    class Config:
        from_attributes = True