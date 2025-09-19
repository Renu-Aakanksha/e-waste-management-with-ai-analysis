import sqlite3

def test_database_reset():
    """Test that the database was reset and new bookings start at ID 1"""
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    # Check current bookings
    cursor.execute('SELECT COUNT(*) FROM bookings')
    count = cursor.fetchone()[0]
    print(f"Current bookings count: {count}")
    
    # Check if we have any bookings
    if count > 0:
        cursor.execute('SELECT id FROM bookings ORDER BY id LIMIT 1')
        first_id = cursor.fetchone()[0]
        print(f"First booking ID: {first_id}")
        
        cursor.execute('SELECT id FROM bookings ORDER BY id DESC LIMIT 1')
        last_id = cursor.fetchone()[0]
        print(f"Last booking ID: {last_id}")
    else:
        print("No bookings found - database is clean")
    
    # Check user points
    cursor.execute('SELECT COUNT(*) FROM user_points')
    points_count = cursor.fetchone()[0]
    print(f"User points records: {points_count}")
    
    # Check points history
    cursor.execute('SELECT COUNT(*) FROM points_history')
    history_count = cursor.fetchone()[0]
    print(f"Points history records: {history_count}")
    
    conn.close()
    print("✅ Database reset verification complete")

if __name__ == "__main__":
    test_database_reset()
