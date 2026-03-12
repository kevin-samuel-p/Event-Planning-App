-- Event Planning Database Setup Script for MySQL
-- Run this script in MySQL to create the database and user

-- Create the database
CREATE DATABASE IF NOT EXISTS event_planning_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user for the application (optional, you can use root)
-- CREATE USER IF NOT EXISTS 'event_user'@'localhost' IDENTIFIED BY 'your_password_here';
-- GRANT ALL PRIVILEGES ON event_planning_db.* TO 'event_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Use the database
USE event_planning_db;

-- Create tables (optional - Hibernate will auto-create with ddl-auto: update)
-- These are here for reference if you want to create them manually

-- Users table
-- CREATE TABLE users (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     phone VARCHAR(20),
--     password VARCHAR(255) NOT NULL,
--     role ENUM('ORGANIZER', 'VENDOR', 'ATTENDEE') NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Events table
-- CREATE TABLE events (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     event_date TIMESTAMP NOT NULL,
--     location VARCHAR(255),
--     organizer_id BIGINT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (organizer_id) REFERENCES users(id)
-- );

-- Show the database creation confirmation
SELECT 'Database event_planning_db created successfully!' as status;
