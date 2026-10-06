from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class LocationDatapoint(BaseModel):
    latitude: float
    longitude: float
    h3_index: str = Field(..., description="Uber H3 spatial index at Resolution 10") # Preserved for SIH constraint

class HazardDetection(BaseModel):
    confidence: float
    type: str
    bbox: List[float]

class BusDataStreamEvent(BaseModel):
    """
    Refactored schema matching the explicit JSON provided, event-driven per pothole.
    """
    bus_id: str
    timestamp: str 
    location: LocationDatapoint
    detection: HazardDetection
    
    model_config = ConfigDict(strict=True)

    def to_compact_json(self) -> str:
        return self.model_dump_json(exclude_none=True)
