import requests
import json

# Test login
login_data = {
    "email": "alice@example.com",
    "password": "password123"
}

try:
    response = requests.post("http://localhost:8080/api/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
