from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime, timezone
from database import Base

class PotholeIncident(Base):
    __tablename__ = "potholes"

    id = Column(Integer, primary_key=True, index=True)
    h3_index = Column(String, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    bus_id = Column(String, default="BUS-LIVE")
    report_count = Column(Integer, default=1)
    image_url = Column(String, nullable=True)
    type = Column(String, default="pothole")
    bbox = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))