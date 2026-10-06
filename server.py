from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/data_stream', methods=['POST'])
def receive_data_stream():
    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
        
    print(f"\n[{data.get('timestamp')}] --- Received Pothole Alert from {data.get('bus_id')} ---")
    
    loc = data.get('location', {})
    pothole = data.get('pothole', {})
    
    print(f"Location: {loc.get('latitude')}, {loc.get('longitude')} (Speed: {loc.get('speed_kmh')} km/h, H3: {loc.get('h3_index')})")
    print(f"Confidence: {pothole.get('confidence')} | Bounding Box: {pothole.get('bbox')}")
    # Integration ready: This data would typically be streamed to PostgreSQL/SQLite or WebSockets here
    
    return jsonify({"status": "delivered", "message": "DataStream received layout successfully"}), 200

if __name__ == '__main__':
    print("Starting Mock Dashboard Server for SIH26124 Prototype on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
