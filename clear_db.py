from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
# You might need to adjust import based on where database.py lives
import sys
sys.path.append('c:\\SIH MODEL\\pothole_backend')
from database import engine
from models import PotholeIncident

Session = sessionmaker(bind=engine)
session = Session()

try:
    # Wipe out the legacy detections so the test slate is completely clean
    session.query(PotholeIncident).delete()
    session.commit()
    print("Successfully purged all historical mock database records.")
except Exception as e:
    session.rollback()
    print("Error clearing database:", e)
finally:
    session.close()
