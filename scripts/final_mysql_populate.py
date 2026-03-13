#!/usr/bin/env python3
"""
Final Working MySQL Data Population Script
"""

import mysql.connector
from mysql.connector import Error
from faker import Faker
from datetime import datetime, timedelta
import random
import hashlib

fake = Faker()

def connect_to_mysql():
    """Connect to MySQL database"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            port=3306,
            database='event_planning_db',
            user='root',
            password='admin',
            charset='utf8mb4'
        )
        cursor = connection.cursor()
        print("Connected to MySQL database")
        return connection, cursor
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None, None

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def create_users(cursor, connection):
    """Create sample users"""
    print("Creating Users...")
    
    # Use different emails to avoid duplicates
    users_data = [
        ("Alice Johnson", "alice.johnson@example.com", "password123", "ORGANIZER"),
        ("Bob Smith", "bob.smith@example.com", "password123", "ORGANIZER"),
        ("Catering Co", "catering.service@example.com", "password123", "VENDOR"),
        ("Photo Studio", "photo.studio@example.com", "password123", "VENDOR"),
        ("Music Band", "music.band@example.com", "password123", "VENDOR"),
        ("Charlie Davis", "charlie.davis@example.com", "password123", "TEAM_MEMBER"),
        ("Diana Wilson", "diana.wilson@example.com", "password123", "TEAM_MEMBER"),
        ("Eve Brown", "eve.brown@example.com", "password123", "GUEST"),
        ("Frank Miller", "frank.miller@example.com", "password123", "GUEST"),
        ("Grace Lee", "grace.lee@example.com", "password123", "GUEST")
    ]
    
    user_ids = {}
    
    try:
        for name, email, password, role in users_data:
            hashed_password = hash_password(password)
            phone = fake.phone_number()
            
            query = "INSERT INTO users (name, email, phone, password, role) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(query, (name, email, phone, hashed_password, role))
            user_id = cursor.lastrowid
            user_ids[email] = user_id
            print(f"Created {role}: {name} ({email})")
        
        connection.commit()
        print(f"\nCreated {len(user_ids)} users\n")
        return user_ids
        
    except Error as e:
        print(f"Error creating users: {e}")
        return {}

def create_events(cursor, connection, user_ids):
    """Create sample events"""
    print("Creating Events...")
    
    # Get organizer users by checking role in the users_data
    # We know the first 2 users are organizers
    organizer_emails = list(user_ids.keys())[:2]
    
    if not organizer_emails:
        print("No organizers found")
        return {}
    
    events_data = [
        ("Summer Wedding Celebration", 
         (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
         "Grand Garden Hotel", "Wedding", user_ids[organizer_emails[0]]),
        ("Corporate Annual Gala",
         (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
         "Downtown Convention Center", "Conference", user_ids[organizer_emails[0]])
    ]
    
    event_ids = {}
    
    try:
        for title, date, venue, event_type, organizer_id in events_data:
            query = "INSERT INTO events (event_name, event_date, venue, event_type, organizer_id) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(query, (title, date, venue, event_type, organizer_id))
            event_id = cursor.lastrowid
            event_ids[event_id] = {
                'title': title,
                'date': date,
                'venue': venue,
                'type': event_type,
                'organizer_id': organizer_id
            }
            print(f"Created event: {title}")
        
        connection.commit()
        print(f"\nCreated {len(event_ids)} events\n")
        return event_ids
        
    except Error as e:
        print(f"Error creating events: {e}")
        return {}

def main():
    """Main function"""
    print("Starting MySQL sample data population...\n")
    
    connection, cursor = connect_to_mysql()
    if not connection:
        return
    
    try:
        user_ids = create_users(cursor, connection)
        
        if user_ids:
            event_ids = create_events(cursor, connection, user_ids)
            
            print(f"Data population complete!")
            print(f"Users: {len(user_ids)}")
            print(f"Events: {len(event_ids)}")
            print("\nLogin Credentials:")
            print("   All users use password: password123")
            print("   Organizer: alice.johnson@example.com")
            print("   Vendor: catering.service@example.com")
            print("   Team Member: charlie.davis@example.com")
            print("   Guest: eve.brown@example.com")
        else:
            print("No users created")
            
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            print("Database connection closed")

if __name__ == "__main__":
    main()
