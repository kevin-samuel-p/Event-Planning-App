#!/usr/bin/env python3
"""
Simple JWT test to verify authentication is working
"""

import requests
import json

BASE_URL = "http://localhost:8080/api"

def test_jwt():
    print("🔐 Testing JWT Authentication...")
    
    # Test 1: Register a new user with unique email
    unique_email = f"testuser{int(time.time())}@test.com"
    register_data = {
        "name": "JWT Test User",
        "email": unique_email,
        "phone": "+1234567890",
        "password": "password123",
        "role": "ORGANIZER"
    }
    
    try:
        print(f"📝 Registering user: {unique_email}")
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Registration successful!")
            user_data = response.json()
            print(f"User ID: {user_data.get('id')}")
            print(f"Token: {user_data.get('token', 'N/A')}")
            return True
        else:
            print(f"❌ Registration failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    import time
    test_jwt()
