-- Insert default vendors for testing
-- These vendors can be used when adding vendors to events

-- Clear existing vendor users (optional - uncomment if you want to start fresh)
-- DELETE FROM users WHERE role = 'VENDOR';

-- Insert vendor users
INSERT INTO users (id, name, email, phone, password, role, created_at) VALUES
(5, 'Catering Excellence', 'catering@eventplanning.com', '+1-555-010-0001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW()),
(6, 'Bloom Florists', 'flowers@eventplanning.com', '+1-555-010-0002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW()),
(7, 'Snap Photography', 'photos@eventplanning.com', '+1-555-010-0003', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW()),
(8, 'DJ Beats Entertainment', 'dj@eventplanning.com', '+1-555-010-0004', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW()),
(9, 'Elite Transportation', 'transport@eventplanning.com', '+1-555-010-0005', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW()),
(10, 'Gourmet Catering Co', 'gourmet@eventplanning.com', '+1-555-010-0006', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW()),
(11, 'Decor Plus', 'decor@eventplanning.com', '+1-555-010-0007', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW()),
(12, 'Sound Systems Pro', 'sound@eventplanning.com', '+1-555-010-0008', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', NOW());

-- Note: The password hash is for 'password' (bcrypt)
-- You can change the passwords by updating the hash or using a different password

-- Verify the vendors were inserted
SELECT * FROM users WHERE role = 'VENDOR' ORDER BY id;
