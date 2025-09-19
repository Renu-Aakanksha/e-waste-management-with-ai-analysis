import sqlite3

def update_database_schema():
    """Add order_status_history table and update bookings table for sequential status tracking"""
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    print("Updating database schema for sequential status tracking...")
    
    # Create order_status_history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            updated_by TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings (id)
        )
    ''')
    
    # Update bookings table to include the new status values
    # First, let's check if we need to update existing status values
    cursor.execute("SELECT DISTINCT status FROM bookings")
    existing_statuses = [row[0] for row in cursor.fetchall()]
    print(f"Existing statuses: {existing_statuses}")
    
    # Update any 'picked_up' status to 'about_to_pick' to maintain sequence
    cursor.execute("UPDATE bookings SET status = 'about_to_pick' WHERE status = 'picked_up'")
    
    # Update any 'delivered' status to 'picked_up' first, then we'll update to delivered
    cursor.execute("UPDATE bookings SET status = 'picked_up' WHERE status = 'delivered'")
    
    # Now update to delivered to maintain proper sequence
    cursor.execute("UPDATE bookings SET status = 'delivered' WHERE status = 'picked_up' AND id IN (SELECT id FROM bookings WHERE status = 'picked_up' LIMIT 1)")
    
    # Update deliveries table status values to match
    cursor.execute("UPDATE deliveries SET status = 'about_to_pick' WHERE status = 'picked_up'")
    cursor.execute("UPDATE deliveries SET status = 'picked_up' WHERE status = 'delivered'")
    cursor.execute("UPDATE deliveries SET status = 'delivered' WHERE status = 'picked_up' AND booking_id IN (SELECT id FROM bookings WHERE status = 'delivered')")
    
    conn.commit()
    conn.close()
    
    print("Database schema updated successfully!")
    print("Added order_status_history table for tracking status transitions")
    print("Updated status values to support sequential workflow")

if __name__ == "__main__":
    update_database_schema()
