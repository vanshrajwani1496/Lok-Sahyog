from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class LocationData(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    h3_index: str

class HazardDetails(BaseModel):
    confidence: float = Field(..., ge=0.0, le=1.0)
    type: str
    bbox: Optional[List[float]] = None

class PotholePayload(BaseModel):
    bus_id: str
    timestamp: datetime
    location: LocationData
    detection: HazardDetails

class PotholeResponse(BaseModel):
    id: int
    h3_index: str
    latitude: float
    longitude: float
    confidence: float
    report_count: int
    type: str
    bus_id: str
    image_url: Optional[str]
    bbox: Optional[List[float]] = None

    class Config:
        from_attributes = True