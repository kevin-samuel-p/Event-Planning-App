#!/usr/bin/env python3
"""
MySQL Schema Checker - Checks actual table structure
"""

import mysql.connector
from mysql.connector import Error

def check_schema():
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
        
        print("🔍 Checking database schema...\n")
        
        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"📋 Table: {table_name}")
            
            # Get table structure
            cursor.execute(f"DESCRIBE {table_name}")
            columns = cursor.fetchall()
            
            for column in columns:
                print(f"   - {column[0]} ({column[1]})")
            print()
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_schema()
