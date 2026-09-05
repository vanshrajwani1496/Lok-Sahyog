import requests
import json
import sys
try:
    resp = requests.get('http://192.168.0.103:8080/sensors.json', timeout=3)
    print(resp.text[:300]) # Print first 300 chars
except Exception as e:
    print(f"Failed: {e}")
