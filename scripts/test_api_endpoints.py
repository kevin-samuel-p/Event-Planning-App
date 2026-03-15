import requests
import json

# Test authentication
login_data = {
    "email": "alice@example.com",
    "password": "password123"
}

try:
    response = requests.post("http://localhost:8080/api/auth/login", json=login_data)
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        token = response.json()["token"]
        print("Login successful!")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test my events
        events_response = requests.get("http://localhost:8080/api/events/my", headers=headers)
        print(f"Events Status: {events_response.status_code}")
        print(f"Events Response: {events_response.text}")
        
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
