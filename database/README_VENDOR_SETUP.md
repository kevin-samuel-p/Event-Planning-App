# Vendor Database Setup

This directory contains SQL scripts to populate your MySQL database with sample vendors for testing.

## Files

1. **seed_vendors.sql** - Creates vendor user accounts
2. **seed_event_vendors.sql** - Creates sample event-vendor relationships

## How to Run

### Option 1: Using MySQL Command Line

```bash
# Navigate to your database directory
cd database

# Connect to MySQL
mysql -u your_username -p your_database_name

# Run the vendor setup script
source seed_vendors.sql;

# Run the event vendor setup script (optional - requires existing events)
source seed_event_vendors.sql;
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Open the SQL script files
4. Execute them one by one

### Option 3: Using phpMyAdmin

1. Open phpMyAdmin
2. Select your database
3. Click on "SQL" tab
4. Copy and paste the contents of the SQL files
5. Execute them

## Default Vendors Created

The following vendor accounts will be created:

| ID | Name | Email | Password | Service Types |
|----|------|-------|----------|---------------|
| 5 | Catering Excellence | catering@eventplanning.com | password | Catering |
| 6 | Bloom Florists | flowers@eventplanning.com | password | Decorations |
| 7 | Snap Photography | photos@eventplanning.com | password | Photography |
| 8 | DJ Beats Entertainment | dj@eventplanning.com | password | Music/Entertainment |
| 9 | Elite Transportation | transport@eventplanning.com | password | Transportation |
| 10 | Gourmet Catering Co | gourmet@eventplanning.com | password | Catering |
| 11 | Decor Plus | decor@eventplanning.com | password | Decorations |
| 12 | Sound Systems Pro | sound@eventplanning.com | password | Sound/AV |

## Important Notes

1. **Default Password**: All vendors use the password `password`
2. **Event Vendors**: The event vendor script assumes you have events with IDs 1 and 2
3. **Customization**: You can modify the scripts to add your own vendors
4. **Database Name**: Make sure to use your actual database name

## Verification

After running the scripts, you can verify the data with:

```sql
-- Check vendors
SELECT * FROM users WHERE role = 'VENDOR';

-- Check event vendors
SELECT 
    ev.id,
    e.event_name,
    u.name as vendor_name,
    ev.service_type,
    ev.contract_status
FROM event_vendors ev
JOIN events e ON ev.event_id = e.id
JOIN users u ON ev.vendor_id = u.id;
```

## Troubleshooting

If you get errors:

1. Make sure your database connection is working
2. Check that the users table structure matches the expected columns
3. Verify you have events created before running the event vendor script
4. Adjust the event IDs in seed_event_vendors.sql if needed
