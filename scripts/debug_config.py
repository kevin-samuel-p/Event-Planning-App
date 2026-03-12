#!/usr/bin/env python3
"""
Debug script to check application configuration
"""

import requests
import json

BASE_URL = "http://localhost:8080"

def debug_config():
    print("🔍 Debugging Application Configuration...")
    
    try:
        # Test health endpoint to see if app is running
        response = requests.get(f"{BASE_URL}/actuator/health")
        print(f"Health Check: {response.status_code}")
        
        if response.status_code == 200:
            health_data = response.json()
            print(f"Health Response: {json.dumps(health_data, indent=2)}")
        
        # Try to access a simple endpoint to see if JWT is the issue
        try:
            response = requests.get(f"{BASE_URL}/api/events/my")
            print(f"Auth Test Status: {response.status_code}")
            print(f"Auth Test Response: {response.text[:200]}...")
        except Exception as e:
            print(f"Auth test error: {str(e)}")
            
    except Exception as e:
        print(f"Connection error: {str(e)}")

if __name__ == "__main__":
    debug_config()
