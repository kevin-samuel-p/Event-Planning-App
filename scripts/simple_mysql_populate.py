#!/usr/bin/env python3
"""
Simple MySQL Data Population Script
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
        print("✅ Connected to MySQL database")
        return connection, cursor
    except Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        return None, None

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def create_users(cursor, connection):
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
    
    user_ids = {}
    
    try:
        for name, email, password, role in users_data:
            hashed_password = hash_password(password)
            
            # Try different query formats until one works
            try:
                query = "INSERT INTO users (name, email, phone, password, role) VALUES (%s, %s, %s, %s, %s)"
                cursor.execute(query, (name, email, fake.phone_number(), hashed_password, role))
                user_id = cursor.lastrowid
                user_ids[email] = user_id
                print(f"✅ Created {role}: {name} ({email})")
            except Error as e:
                print(f"⚠️  Error with {email}: {e}")
                # Try without phone
                try:
                    query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
                    cursor.execute(query, (name, email, hashed_password, role))
                    user_id = cursor.lastrowid
                    user_ids[email] = user_id
                    print(f"✅ Created {role}: {name} ({email}) - no phone")
                except Error as e2:
                    print(f"❌ Failed to create {name}: {e2}")
        
        connection.commit()
        print(f"\n✅ Created {len(user_ids)} users\n")
        return user_ids
        
    except Error as e:
        print(f"❌ Error creating users: {e}")
        return {}

def main():
    """Main function"""
    print("🚀 Starting MySQL sample data population...\n")
    
    connection, cursor = connect_to_mysql()
    if not connection:
        return
    
    try:
        user_ids = create_users(cursor, connection)
        
        if user_ids:
            print(f"🎊 User creation complete! Created {len(user_ids)} users")
            print("\n🔐 Login Credentials:")
            print("   All users use password: password123")
            print("   Organizer: alice@example.com")
            print("   Vendor: catering@example.com")
            print("   Team Member: charlie@example.com")
            print("   Guest: eve@example.com")
        else:
            print("❌ No users created")
            
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            print("✅ Database connection closed")

if __name__ == "__main__":
    main()
