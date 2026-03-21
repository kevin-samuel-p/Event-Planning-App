-- Insert sample event vendors for testing
-- This assumes you already have some events created in the database

-- First, let's check what events exist (uncomment to run this check)
-- SELECT id, event_name FROM events;

-- Insert sample event vendors (assuming event ID 1 exists)
-- You may need to adjust the event_id based on your actual events

INSERT INTO event_vendors (event_id, vendor_id, service_type, contract_status, created_at) VALUES
-- Event ID 1 - Spring Gala
(1, 5, 'Catering', 'ACTIVE', NOW()),
(1, 6, 'Decorations', 'PROPOSED', NOW()),
(1, 7, 'Photography', 'ACTIVE', NOW()),
(1, 8, 'Music/Entertainment', 'PROPOSED', NOW()),

-- Event ID 2 - Corporate Conference (assuming it exists)
(2, 10, 'Catering', 'ACTIVE', NOW()),
(2, 11, 'Decorations', 'COMPLETED', NOW()),
(2, 12, 'Sound/AV', 'ACTIVE', NOW()),
(2, 9, 'Transportation', 'PROPOSED', NOW());

-- Verify the event vendors were inserted
SELECT 
    ev.id,
    e.event_name,
    u.name as vendor_name,
    ev.service_type,
    ev.contract_status,
    ev.created_at
FROM event_vendors ev
JOIN events e ON ev.event_id = e.id
JOIN users u ON ev.vendor_id = u.id
ORDER BY ev.event_id, ev.id;
