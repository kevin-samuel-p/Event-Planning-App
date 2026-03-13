#!/usr/bin/env python3
"""
MySQL Sample Data Population Script

This script directly inserts sample data into MySQL database for the Event Planning application.

Usage:
    python scripts/populate_sample_data_mysql.py

Requirements:
    pip install mysql-connector-python faker

Note: Make sure MySQL server is running and database exists
"""

import mysql.connector
from mysql.connector import Error
from faker import Faker
from datetime import datetime, timedelta
import random
import hashlib
import sys

# Initialize Faker
fake = Faker()

class MySQLDataPopulator:
    def __init__(self):
        self.connection = None
        self.cursor = None
        self.users = {}
        self.events = {}
        self.group_chats = {}
        self.forums = {}
        
    def connect(self):
        """Connect to MySQL database"""
        # Try to get password from environment or use default
        import os
        password = os.environ.get('MYSQL_PASSWORD', '')
        
        # If no password set, prompt user
        if not password:
            print("⚠️  No MySQL password found in environment variable MYSQL_PASSWORD")
            try:
                password = input("Enter MySQL password for root user (press Enter if no password): ").strip()
            except KeyboardInterrupt:
                print("\n❌ Setup cancelled")
                return False
        
        try:
            self.connection = mysql.connector.connect(
                host='localhost',
                port=3306,
                database='event_planning_db',
                user='root',
                password=password,
                charset='utf8mb4'
            )
            self.cursor = self.connection.cursor()
            print("✅ Connected to MySQL database")
            return True
        except Error as e:
            print(f"❌ Error connecting to MySQL: {e}")
            print("💡 Make sure MySQL is running and database exists")
            print("💡 Check your MySQL password and database name")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
            print("✅ Database connection closed")
    
    def hash_password(self, password):
        """Hash password using SHA-256 (simplified for demo)"""
        # In production, use proper BCrypt
        import hashlib
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    def create_users(self):
        """Create sample users"""
        print("📝 Creating Users...")
        
        users_data = [
            ("Alice Johnson", "alice@example.com", "password123", "ORGANIZER"),
            ("Bob Smith", "bob@example.com", "password123", "ORGANIZER"),
            ("Catering Co", "catering@example.com", "password123", "VENDOR"),
            ("Photo Studio", "photo@example.com", "password123", "VENDOR"),
            ("Music Band", "music@example.com", "password123", "VENDOR"),
            ("Charlie Davis", "charlie@example.com", "password123", "TEAM_MEMBER"),
            ("Diana Wilson", "diana@example.com", "password123", "TEAM_MEMBER"),
            ("Eve Brown", "eve@example.com", "password123", "GUEST"),
            ("Frank Miller", "frank@example.com", "password123", "GUEST"),
            ("Grace Lee", "grace@example.com", "password123", "GUEST")
        ]
        
        try:
            for name, email, password, role in users_data:
                # Hash password (simplified - use BCrypt in production)
                hashed_password = self.hash_password(password)
                
                query = """
                INSERT INTO users (name, email, phone, password, role)
                VALUES (%s, %s, %s, %s, %s)
                """
                
                self.cursor.execute(query, (
                    name, email, fake.phone_number(), hashed_password, role
                ))
                
                user_id = self.cursor.lastrowid
                self.users[email] = {
                    'id': user_id,
                    'name': name,
                    'email': email,
                    'role': role
                }
                print(f"✅ Created {role}: {name} ({email})")
            
            self.connection.commit()
            print(f"\n✅ Created {len(self.users)} users\n")
            return True
            
        except Error as e:
            print(f"❌ Error creating users: {e}")
            return False
    
    def create_events(self):
        """Create sample events"""
        print("🎉 Creating Events...")
        
        # Get organizers
        organizers = [u for u in self.users.values() if u['role'] == 'ORGANIZER']
        
        if not organizers:
            print("❌ No organizers found")
            return False
        
        events_data = [
            ("Summer Wedding Celebration", 
             (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
             "Grand Garden Hotel", "Wedding", organizers[0]['id']),
            ("Corporate Annual Gala",
             (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
             "Downtown Convention Center", "Conference", organizers[0]['id'])
        ]
        
        try:
            for title, date, venue, event_type, organizer_id in events_data:
                query = """
                INSERT INTO events (title, description, event_date, location, organizer_id, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                
                self.cursor.execute(query, (
                    title, f"Amazing {title} event with lots of activities",
                    date, venue, event_type, organizer_id,
                    datetime.now(), datetime.now()
                ))
                
                event_id = self.cursor.lastrowid
                self.events[event_id] = {
                    'id': event_id,
                    'title': title,
                    'date': date,
                    'venue': venue,
                    'type': event_type,
                    'organizer_id': organizer_id
                }
                print(f"✅ Created event: {title}")
            
            self.connection.commit()
            print(f"\n✅ Created {len(self.events)} events\n")
            return True
            
        except Error as e:
            print(f"❌ Error creating events: {e}")
            return False
    
    def create_budgets(self):
        """Create budgets for events"""
        print("💰 Creating Budgets...")
        
        try:
            for event_id in self.events:
                total_budget = random.randint(5000, 20000)
                
                query = """
                INSERT INTO budgets (event_id, total_budget, allocated_budget, spent_amount, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """
                
                self.cursor.execute(query, (
                    event_id, total_budget, total_budget, 0,
                    datetime.now(), datetime.now()
                ))
                
                print(f"✅ Created budget: ${total_budget}")
            
            self.connection.commit()
            print("\n")
            return True
            
        except Error as e:
            print(f"❌ Error creating budgets: {e}")
            return False
    
    def create_vendors(self):
        """Add vendors to events"""
        print("🏢 Adding Vendors...")
        
        vendors = [u for u in self.users.values() if u['role'] == 'VENDOR']
        
        try:
            for event_id, event in self.events.items():
                for vendor in vendors[:2]:  # Add 2 vendors per event
                    service_type = random.choice(["Catering", "Photography", "Music", "Decor", "Transport"])
                    
                    query = """
                    INSERT INTO event_vendors (event_id, vendor_id, service_type, contract_status, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """
                    
                    self.cursor.execute(query, (
                        event_id, vendor['id'], service_type, "PENDING",
                        datetime.now(), datetime.now()
                    ))
                    
                    print(f"✅ Added vendor: {vendor['name']}")
            
            self.connection.commit()
            print("\n")
            return True
            
        except Error as e:
            print(f"❌ Error adding vendors: {e}")
            return False
    
    def create_group_chats(self):
        """Create group chats for events"""
        print("💬 Creating Group Chats...")
        
        try:
            for event_id, event in self.events.items():
                chat_name = f"{event['title']} Chat"
                join_code = fake.bothify(text=hashlib.md5(chat_name.encode()).hexdigest()[:8].upper())
                
                query = """
                INSERT INTO group_chats (gc_name, join_code, event_id, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
                """
                
                self.cursor.execute(query, (
                    chat_name, join_code, event_id,
                    datetime.now(), datetime.now()
                ))
                
                chat_id = self.cursor.lastrowid
                self.group_chats[chat_id] = {
                    'id': chat_id,
                    'name': chat_name,
                    'join_code': join_code,
                    'event_id': event_id
                }
                print(f"✅ Created group chat: {chat_name}")
            
            self.connection.commit()
            return True
            
        except Error as e:
            print(f"❌ Error creating group chats: {e}")
            return False
    
    def create_forums(self):
        """Create forums in group chats"""
        print("📋 Creating Forums...")
        
        try:
            for chat_id, chat in self.group_chats.items():
                forums_data = [
                    ("General Discussion", chat_id),
                    ("Venue Planning", chat_id),
                    ("Vendor Coordination", chat_id)
                ]
                
                for forum_name, group_chat_id in forums_data:
                    query = """
                    INSERT INTO forums (forum_name, group_chat_id, created_at, updated_at)
                    VALUES (%s, %s, %s, %s)
                    """
                    
                    self.cursor.execute(query, (forum_name, group_chat_id, datetime.now(), datetime.now()))
                    
                    forum_id = self.cursor.lastrowid
                    self.forums[forum_id] = {
                        'id': forum_id,
                        'name': forum_name,
                        'group_chat_id': group_chat_id
                    }
                    print(f"✅ Created forum: {forum_name}")
            
            self.connection.commit()
            return True
            
        except Error as e:
            print(f"❌ Error creating forums: {e}")
            return False
    
    def create_messages(self):
        """Send messages to forums"""
        print("💬 Creating Messages...")
        
        try:
            sample_messages = [
                "Welcome everyone to the event planning chat!",
                "Looking forward to collaborating with all of you.",
                "The venue looks amazing, can't wait for the event!",
                "Let's coordinate on the timeline and logistics.",
                "Vendor confirmations are coming in nicely."
            ]
            
            for forum_id, forum in self.forums.items():
                for i, message in enumerate(sample_messages):
                    if i < len(sample_messages):
                        # Use organizer as message sender
                        organizer = next((u for u in self.users.values() if u['role'] == 'ORGANIZER'), None)
                        
                        query = """
                        INSERT INTO forum_messages (forum_id, sender_id, message, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s)
                        """
                        
                        self.cursor.execute(query, (
                            forum_id, organizer['id'], message,
                            datetime.now(), datetime.now()
                        ))
                        
                        print(f"✅ Sent message: {message[:30]}...")
            
            self.connection.commit()
            return True
            
        except Error as e:
            print(f"❌ Error creating messages: {e}")
            return False
    
    def populate_all_data(self):
        """Populate all sample data"""
        print("🚀 Starting MySQL sample data population...\n")
        
        if not self.connect():
            return False
        
        try:
            # 1. Create Users
            if not self.create_users():
                return False
            
            # 2. Create Events
            if not self.create_events():
                return False
            
            # 3. Create Budgets
            if not self.create_budgets():
                return False
            
            # 4. Add Vendors
            if not self.create_vendors():
                return False
            
            # 5. Create Group Chats
            if not self.create_group_chats():
                return False
            
            # 6. Create Forums
            if not self.create_forums():
                return False
            
            # 7. Create Messages
            if not self.create_messages():
                return False
            
            # Summary
            print("\n🎊 Sample Data Population Complete!")
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
            
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
        finally:
            self.disconnect()

if __name__ == "__main__":
    populator = MySQLDataPopulator()
    populator.populate_all_data()
