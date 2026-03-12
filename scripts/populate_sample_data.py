#!/usr/bin/env python3
"""
Sample Data Population Script for Event Planning API

This script populates the H2 database with sample users, events, vendors,
tasks, invitations, and the new chat system data.

Usage:
    python scripts/populate_sample_data.py

Requirements:
    pip install requests faker

Note: Make sure the Spring Boot application is running on localhost:8080
"""

import requests
import json
import time
from faker import Faker
from datetime import datetime, timedelta
import random

# Initialize Faker
fake = Faker()

# API Base URL
BASE_URL = "http://localhost:8080/api"

class DataPopulator:
    def __init__(self):
        self.base_url = BASE_URL
        self.users = []
        self.events = []
        self.group_chats = []
        self.forums = []
        
    def register_user(self, name, email, password, role):
        """Register a new user"""
        try:
            response = requests.post(f"{self.base_url}/auth/register", json={
                "name": name,
                "email": email,
                "phone": fake.phone_number(),
                "password": password,
                "role": role
            })
            if response.status_code == 201:
                user_data = response.json()
                print(f"✅ Registered {role}: {name} ({email})")
                return user_data
            else:
                print(f"❌ Failed to register {name}: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error registering {name}: {str(e)}")
            return None
    
    def login_user(self, email, password):
        """Login and get JWT token"""
        try:
            response = requests.post(f"{self.base_url}/auth/login", json={
                "email": email,
                "password": password
            })
            if response.status_code == 200:
                return response.json()["token"]
            else:
                print(f"❌ Failed to login {email}: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error logging in {email}: {str(e)}")
            return None
    
    def create_event(self, token, event_data):
        """Create an event"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{self.base_url}/events", json=event_data, headers=headers)
            if response.status_code == 201:
                event = response.json()
                print(f"✅ Created event: {event['eventName']}")
                return event
            else:
                print(f"❌ Failed to create event: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating event: {str(e)}")
            return None
    
    def create_budget(self, token, event_id, total_budget):
        """Create budget for event"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{self.base_url}/events/{event_id}/budget", 
                                   json={"totalBudget": total_budget}, headers=headers)
            if response.status_code == 201:
                print(f"✅ Created budget: ${total_budget}")
                return response.json()
            else:
                print(f"❌ Failed to create budget: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating budget: {str(e)}")
            return None
    
    def add_vendor(self, token, event_id, vendor_user):
        """Add vendor to event"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{self.base_url}/events/{event_id}/vendors", json={
                "vendorId": vendor_user["id"],
                "serviceType": random.choice(["Catering", "Photography", "Music", "Decor", "Transport"]),
                "contractStatus": "PENDING"
            }, headers=headers)
            if response.status_code == 201:
                print(f"✅ Added vendor: {vendor_user['name']}")
                return response.json()
            else:
                print(f"❌ Failed to add vendor: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error adding vendor: {str(e)}")
            return None
    
    def create_group_chat(self, token, event_id, chat_name):
        """Create group chat for event"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{self.base_url}/group-chats", json={
                "gcName": chat_name,
                "eventId": event_id
            }, headers=headers)
            if response.status_code == 201:
                chat = response.json()
                print(f"✅ Created group chat: {chat_name}")
                return chat
            else:
                print(f"❌ Failed to create group chat: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating group chat: {str(e)}")
            return None
    
    def join_group_chat(self, token, join_code):
        """Join a group chat"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{self.base_url}/group-chats/join", json={
                "joinCode": join_code
            }, headers=headers)
            if response.status_code == 200:
                print(f"✅ Joined group chat with code: {join_code}")
                return response.json()
            else:
                print(f"❌ Failed to join group chat: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error joining group chat: {str(e)}")
            return None
    
    def create_forum(self, token, group_chat_id, forum_name):
        """Create a forum in group chat"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{self.base_url}/forums", json={
                "forumName": forum_name,
                "groupChatId": group_chat_id
            }, headers=headers)
            if response.status_code == 201:
                forum = response.json()
                print(f"✅ Created forum: {forum_name}")
                return forum
            else:
                print(f"❌ Failed to create forum: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating forum: {str(e)}")
            return None
    
    def send_forum_message(self, token, forum_id, message):
        """Send a message to forum"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(f"{self.base_url}/messages/gc", json={
                "forumId": forum_id,
                "message": message
            }, headers=headers)
            if response.status_code == 201:
                print(f"✅ Sent forum message: {message[:30]}...")
                return response.json()
            else:
                print(f"❌ Failed to send forum message: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error sending forum message: {str(e)}")
            return None
    
    def populate_all_data(self):
        """Populate all sample data"""
        print("🚀 Starting sample data population...\n")
        
        # 1. Create Users
        print("📝 Creating Users...")
        
        # Organizers
        organizer1 = self.register_user("Alice Johnson", "alice@example.com", "password123", "ORGANIZER")
        organizer2 = self.register_user("Bob Smith", "bob@example.com", "password123", "ORGANIZER")
        
        # Vendors
        vendor1 = self.register_user("Catering Co", "catering@example.com", "password123", "VENDOR")
        vendor2 = self.register_user("Photo Studio", "photo@example.com", "password123", "VENDOR")
        vendor3 = self.register_user("Music Band", "music@example.com", "password123", "VENDOR")
        
        # Team Members
        team1 = self.register_user("Charlie Davis", "charlie@example.com", "password123", "TEAM_MEMBER")
        team2 = self.register_user("Diana Wilson", "diana@example.com", "password123", "TEAM_MEMBER")
        
        # Guests
        guest1 = self.register_user("Eve Brown", "eve@example.com", "password123", "GUEST")
        guest2 = self.register_user("Frank Miller", "frank@example.com", "password123", "GUEST")
        guest3 = self.register_user("Grace Lee", "grace@example.com", "password123", "GUEST")
        
        self.users = [u for u in [organizer1, organizer2, vendor1, vendor2, vendor3, team1, team2, guest1, guest2, guest3] if u]
        
        if not self.users:
            print("❌ No users created. Exiting.")
            return
        
        print(f"\n✅ Created {len(self.users)} users\n")
        
        # 2. Create Events
        print("🎉 Creating Events...")
        
        # Login as organizer1
        organizer_token = self.login_user("alice@example.com", "password123")
        if not organizer_token:
            print("❌ Could not login as organizer. Exiting.")
            return
        
        # Create events
        event1 = self.create_event(organizer_token, {
            "eventName": "Summer Wedding Celebration",
            "eventDate": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "venue": "Grand Garden Hotel",
            "eventType": "Wedding"
        })
        
        event2 = self.create_event(organizer_token, {
            "eventName": "Corporate Annual Gala",
            "eventDate": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
            "venue": "Downtown Convention Center",
            "eventType": "Conference"
        })
        
        self.events = [e for e in [event1, event2] if e]
        
        if not self.events:
            print("❌ No events created. Exiting.")
            return
        
        print(f"\n✅ Created {len(self.events)} events\n")
        
        # 3. Create Budgets
        print("💰 Creating Budgets...")
        
        for event in self.events:
            budget = self.create_budget(organizer_token, event["id"], random.randint(5000, 20000))
        
        print("\n")
        
        # 4. Add Vendors to Events
        print("🏢 Adding Vendors...")
        
        vendors = [u for u in self.users if u["email"] in ["catering@example.com", "photo@example.com", "music@example.com"]]
        
        for event in self.events:
            for vendor in vendors[:2]:  # Add 2 vendors per event
                self.add_vendor(organizer_token, event["id"], vendor)
        
        print("\n")
        
        # 5. Create Group Chats and Forums
        print("💬 Creating Group Chats and Forums...")
        
        for event in self.events:
            # Create group chat
            chat = self.create_group_chat(organizer_token, event["id"], f"{event['eventName']} Chat")
            if chat:
                self.group_chats.append(chat)
                
                # Join other users to chat
                other_users = [u for u in self.users if u["email"] not in ["alice@example.com", "bob@example.com"]]
                for user in other_users[:3]:  # Join 3 more users
                    user_token = self.login_user(user["email"], "password123")
                    if user_token:
                        self.join_group_chat(user_token, chat["joinCode"])
                        time.sleep(0.1)  # Small delay
                
                # Create forums
                forum1 = self.create_forum(organizer_token, chat["id"], "General Discussion")
                forum2 = self.create_forum(organizer_token, chat["id"], "Venue Planning")
                forum3 = self.create_forum(organizer_token, chat["id"], "Vendor Coordination")
                
                forums = [f for f in [forum1, forum2, forum3] if f]
                self.forums.extend(forums)
                
                # Send sample messages
                sample_messages = [
                    "Welcome everyone to the event planning chat!",
                    "Looking forward to collaborating with all of you.",
                    "The venue looks amazing, can't wait for the event!",
                    "Let's coordinate on the timeline and logistics.",
                    "Vendor confirmations are coming in nicely."
                ]
                
                for i, forum in enumerate(forums):
                    if i < len(sample_messages):
                        self.send_forum_message(organizer_token, forum["id"], sample_messages[i])
        
        print(f"\n✅ Created {len(self.group_chats)} group chats and {len(self.forums)} forums\n")
        
        # 6. Summary
        print("🎊 Sample Data Population Complete!")
        print(f"📊 Summary:")
        print(f"   Users: {len(self.users)}")
        print(f"   Events: {len(self.events)}")
        print(f"   Group Chats: {len(self.group_chats)}")
        print(f"   Forums: {len(self.forums)}")
        print(f"\n🔐 Login Credentials:")
        print(f"   All users use password: password123")
        print(f"   Organizer: alice@example.com")
        print(f"   Vendor: catering@example.com")
        print(f"   Team Member: charlie@example.com")
        print(f"   Guest: eve@example.com")

if __name__ == "__main__":
    # Check if server is running - try multiple endpoints
    server_running = False
    health_endpoints = [
        f"{BASE_URL}/actuator/health",
        f"{BASE_URL}/auth/register",  # Fallback to auth endpoint
        "http://localhost:8080/actuator/health",  # Try without /api
    ]
    
    for endpoint in health_endpoints:
        try:
            print(f"🔍 Checking server at: {endpoint}")
            response = requests.get(endpoint, timeout=5)
            if response.status_code in [200, 201, 404, 405]:  # Accept various success codes
                server_running = True
                print(f"✅ Server is responding at {endpoint}")
                break
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Cannot reach {endpoint}: {str(e)}")
            continue
    
    if not server_running:
        print("❌ Server is not responding. Please ensure the Spring Boot app is running on localhost:8080")
        print("💡 Try running: mvn spring-boot:run")
        exit(1)
    
    print("🚀 Starting sample data population...\n")
    
    # Populate data
    populator = DataPopulator()
    populator.populate_all_data()
