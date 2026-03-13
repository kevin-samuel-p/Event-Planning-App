#!/usr/bin/env python3
"""
Working MySQL Data Population Script - Fresh Data
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

def create_events(cursor, connection):
    """Create sample events with existing users"""
    print("Creating Events...")
    
    # First, get an existing organizer user
    cursor.execute("SELECT id FROM users WHERE role = 'ORGANIZER' LIMIT 1")
    result = cursor.fetchone()
    
    if not result:
        print("No organizer found in database")
        return {}
    
    organizer_id = result[0]
    print(f"Using organizer ID: {organizer_id}")
    
    events_data = [
        ("Summer Wedding Celebration", 
         (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
         "Grand Garden Hotel", "Wedding", organizer_id),
        ("Corporate Annual Gala",
         (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
         "Downtown Convention Center", "Conference", organizer_id)
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
        # Create events using existing users
        event_ids = create_events(cursor, connection)
        
        print(f"Data population complete!")
        print(f"Events: {len(event_ids)}")
        
        # Show existing users
        cursor.execute("SELECT email, role FROM users LIMIT 5")
        users = cursor.fetchall()
        print("\nExisting users (sample):")
        for email, role in users:
            print(f"   {role.lower()}: {email}")
        print("   (All users use password: password123)")
            
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
