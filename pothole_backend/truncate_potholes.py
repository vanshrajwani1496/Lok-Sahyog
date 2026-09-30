import sys
import os

from sqlalchemy import text
from database import engine

if __name__ == "__main__":
    print("Connecting to database...")
    try:
        with engine.begin() as conn:
            print("Truncating potholes table...")
            conn.execute(text("TRUNCATE TABLE potholes CASCADE;"))
            print("Successfully truncated potholes table. The dashboard is now perfectly blank.")
    except Exception as e:
        print(f"Error truncating table: {e}")
        sys.exit(1)
