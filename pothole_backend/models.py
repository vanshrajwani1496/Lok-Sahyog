from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class City(Base):
    __tablename__ = "cities"
    
    id = Column(String, primary_key=True, index=True) # e.g. "MUM", "HYD", "DEL"
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    base_score = Column(Float, default=70)

class MunicipalZone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    name = Column(String, nullable=False)
    h3_index = Column(String, unique=True, index=True, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    risk = Column(String, default="none")

class PotholeIncident(Base):
    __tablename__ = "potholes"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(String, ForeignKey("cities.id"), nullable=True) # Multitenant trace
    h3_index = Column(String, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    bus_id = Column(String, default="BUS-LIVE")
    report_count = Column(Integer, default=1)
    image_url = Column(String, nullable=True)
    type = Column(String, default="pothole")
    bbox = Column(JSON, nullable=True)
    
    # ByteTrack temporal metadata
    track_id = Column(Integer, nullable=True)
    event_id = Column(String, index=True, nullable=True)
    camera_id = Column(String, nullable=True)
    evidence = Column(JSON, nullable=True)
    
    # SLA & Hazard Resolution tracking for Gov Officers
    status = Column(String, default="open") # open | acknowledged | resolved
    resolution_photo_path = Column(String, nullable=True)
    escalated = Column(Integer, default=0) # 0 False, 1 True
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="officer")
    email = Column(String, nullable=True) # For SMTP OTP
    city_id = Column(String, ForeignKey("cities.id"), nullable=True) # To filter auth
    zone = Column(String, nullable=True) # e.g. Khairatabad
    circle = Column(String, nullable=True) # e.g. Circle 17
    ward = Column(String, nullable=True) # e.g. Ward 123
    current_otp = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))