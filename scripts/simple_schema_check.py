import mysql.connector

conn = mysql.connector.connect(host='localhost', port=3306, database='event_planning_db', user='root', password='admin')
cursor = conn.cursor()
cursor.execute('DESCRIBE users')
columns = cursor.fetchall()
print('Users table columns:')
for col in columns:
    print(f'  {col[0]} - {col[1]}')
conn.close()
