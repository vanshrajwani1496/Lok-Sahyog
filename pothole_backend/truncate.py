from database import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("TRUNCATE TABLE potholes"))
    conn.execute(text("ALTER TABLE potholes ADD COLUMN IF NOT EXISTS bus_id VARCHAR DEFAULT 'BUS-LIVE'"))
print("Done")
