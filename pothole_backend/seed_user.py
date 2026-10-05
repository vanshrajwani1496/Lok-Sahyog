import os
from database import SessionLocal, engine
from models import User, Base, City, MunicipalZone, PotholeIncident
from auth import get_password_hash
from dotenv import load_dotenv

load_dotenv()

CITIES_DATA = [
    {"id": "MUM", "name": "Mumbai (BMC)", "lat": 19.0760, "lng": 72.8777, "base_score": 62, "zones": [
        {"name": "Island City", "h3_index": "8860145881fffff", "lat": 18.9067, "lng": 72.8147},
        {"name": "Western Suburbs", "h3_index": "8860145883fffff", "lat": 19.1136, "lng": 72.8697},
        {"name": "Eastern Suburbs", "h3_index": "8860145885fffff", "lat": 19.0553, "lng": 72.9022}
    ]},
    {"id": "HYD", "name": "Hyderabad (GHMC)", "lat": 17.3850, "lng": 78.4867, "base_score": 75, "zones": [
        {"name": "Khairatabad", "h3_index": "8860145887fffff", "lat": 17.4124, "lng": 78.4552},
        {"name": "Charminar", "h3_index": "8860145889fffff", "lat": 17.3616, "lng": 78.4747},
        {"name": "Secunderabad", "h3_index": "886014588bfffff", "lat": 17.4399, "lng": 78.4983},
        {"name": "Kukatpally", "h3_index": "886014588dfffff", "lat": 17.4849, "lng": 78.4069},
        {"name": "Serilingampally", "h3_index": "886014588ffffff", "lat": 17.4800, "lng": 78.3200},
        {"name": "LB Nagar", "h3_index": "88601458a1fffff", "lat": 17.3457, "lng": 78.5522}
    ]},
    {"id": "DEL", "name": "New Delhi (NDMC)", "lat": 28.6139, "lng": 77.2090, "base_score": 45, "zones": [
        {"name": "NDMC", "h3_index": "88601458a3fffff", "lat": 28.6304, "lng": 77.2177},
        {"name": "South Delhi", "h3_index": "88601458a5fffff", "lat": 28.5293, "lng": 77.1539},
        {"name": "North Delhi", "h3_index": "88601458a7fffff", "lat": 28.7041, "lng": 77.1025},
        {"name": "East Delhi", "h3_index": "88601458a9fffff", "lat": 28.6258, "lng": 77.2913},
        {"name": "West Delhi", "h3_index": "88601458abfffff", "lat": 28.6473, "lng": 77.0864},
        {"name": "Central Delhi", "h3_index": "88601458adfffff", "lat": 28.6465, "lng": 77.2442}
    ]},
    {"id": "BLR", "name": "Bengaluru (BBMP)", "lat": 12.9716, "lng": 77.5946, "base_score": 68, "zones": [
        {"name": "South Zone", "h3_index": "88601458affffff", "lat": 12.9352, "lng": 77.6245},
        {"name": "East Zone", "h3_index": "88601458b1fffff", "lat": 12.9784, "lng": 77.6408},
        {"name": "West Zone", "h3_index": "8860146059fffff", "lat": 12.9860, "lng": 77.5501},
        {"name": "Mahadevapura", "h3_index": "886014605bfffff", "lat": 12.9904, "lng": 77.6974},
        {"name": "Yelahanka", "h3_index": "886014605dfffff", "lat": 13.1007, "lng": 77.5963},
        {"name": "Bommanahalli", "h3_index": "886014605ffffff", "lat": 12.9030, "lng": 77.6242}
    ]},
    {"id": "PUN", "name": "Pune (PMC)", "lat": 18.5204, "lng": 73.8567, "base_score": 71, "zones": [
        {"name": "Shivajinagar-Ghole Road", "h3_index": "88601458b3fffff", "lat": 18.5362, "lng": 73.8391},
        {"name": "Kothrud-Bavdhan", "h3_index": "88601458b5fffff", "lat": 18.5074, "lng": 73.8077},
        {"name": "Hadapsar-Mundhwa", "h3_index": "8860146061fffff", "lat": 18.5089, "lng": 73.9259},
        {"name": "Aundh-Baner", "h3_index": "8860146063fffff", "lat": 18.5590, "lng": 73.7868},
        {"name": "Yerawada-Kalas", "h3_index": "8860146065fffff", "lat": 18.5529, "lng": 73.8961}
    ]},
    {"id": "CHE", "name": "Chennai (GCC)", "lat": 13.0827, "lng": 80.2707, "base_score": 78, "zones": [
        {"name": "South Region", "h3_index": "8860146067fffff", "lat": 12.9907, "lng": 80.2307},
        {"name": "Central Region", "h3_index": "8860146069fffff", "lat": 13.0418, "lng": 80.2341},
        {"name": "North Region", "h3_index": "886014606bfffff", "lat": 13.1118, "lng": 80.2526},
        {"name": "Adyar", "h3_index": "886014606dfffff", "lat": 13.0033, "lng": 80.2555},
        {"name": "Anna Nagar", "h3_index": "886014606ffffff", "lat": 13.0850, "lng": 80.2101}
    ]}
]

def populate_db():
    print("Re-creating all backend tables to support Multi-Tenant City Ecosystem...")
    # Drop existing tables
    User.__table__.drop(bind=engine, checkfirst=True)
    PotholeIncident.__table__.drop(bind=engine, checkfirst=True)
    MunicipalZone.__table__.drop(bind=engine, checkfirst=True)
    City.__table__.drop(bind=engine, checkfirst=True)
    
    # Re-create them with new multi-city schema
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    target_email = os.getenv("SMTP_EMAIL") or "test@example.com"
    
    print(f"Seeding {len(CITIES_DATA)} Indian Smart Cities...")
    
    for cdata in CITIES_DATA:
        # Create City
        city = City(
            id=cdata["id"],
            name=cdata["name"],
            lat=cdata["lat"],
            lng=cdata["lng"],
            base_score=cdata["base_score"]
        )
        db.add(city)
        db.flush() # Secure the ID
        
        # Create Admin Account for City
        admin_username = f"{cdata['id'].lower()}_admin"
        if cdata['id'] == 'HYD':
            admin_username = "admin" # Legacy backwards compatibility
            
        admin = User(
            username=admin_username,
            password_hash=get_password_hash("admin"),
            email=target_email,
            city_id=cdata["id"],
            role="zonal_commissioner",
            zone="All Zones"
        )
        db.add(admin)
        
        # Create Zones
        for zdata in cdata["zones"]:
            zone = MunicipalZone(
                city_id=cdata["id"],
                name=zdata["name"],
                h3_index=zdata["h3_index"],
                lat=zdata["lat"],
                lng=zdata["lng"]
            )
            db.add(zone)

    db.commit()
    print("✅ Seed Complete! Multi-City Administrator Accounts Generated:")
    for cdata in CITIES_DATA:
        usr = f"{cdata['id'].lower()}_admin" if cdata['id'] != 'HYD' else 'admin'
        print(f"   [{cdata['name']}] ID: '{usr}' / Pass: 'admin'")
    db.close()

if __name__ == "__main__":
    populate_db()
