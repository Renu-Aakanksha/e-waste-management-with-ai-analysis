import sqlite3

# Connect to the database
conn = sqlite3.connect('e_waste.db')
cursor = conn.cursor()

# Check total bookings
cursor.execute('SELECT COUNT(*) FROM bookings')
total_bookings = cursor.fetchone()[0]
print(f'Total bookings: {total_bookings}')

# Get latest 5 bookings
cursor.execute('SELECT * FROM bookings ORDER BY id DESC LIMIT 5')
print('\nLatest 5 bookings:')
for row in cursor.fetchall():
    print(f'ID: {row[0]}, Name: {row[1]}, Category: {row[2]}, Weight: {row[3]}kg, Lat: {row[4]}, Lon: {row[5]}, Route: {row[6]}, Scheduled: {row[7]}')

# Check materials
cursor.execute('SELECT COUNT(*) FROM materials')
total_materials = cursor.fetchone()[0]
print(f'\nTotal material records: {total_materials}')

# Get latest materials
cursor.execute('SELECT * FROM materials ORDER BY booking_id DESC LIMIT 10')
print('\nLatest 10 material records:')
for row in cursor.fetchall():
    print(f'Booking ID: {row[0]}, Material: {row[1]}, Quantity: {row[2]}kg')

conn.close()
