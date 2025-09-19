import sqlite3

def reset_database():
    """Reset the database by clearing all data and resetting auto-increment sequences"""
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    print("Resetting database...")
    
    # Clear all data from tables (in correct order due to foreign key constraints)
    tables_to_clear = [
        'points_history',
        'user_points', 
        'materials',
        'deliveries',
        'bookings'
    ]
    
    for table in tables_to_clear:
        cursor.execute(f'DELETE FROM {table}')
        print(f"Cleared {table} table")
    
    # Reset auto-increment sequences
    cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('bookings', 'materials', 'deliveries', 'user_points', 'points_history')")
    
    # Re-initialize user points for existing users
    cursor.execute('''
        INSERT OR IGNORE INTO user_points (user_id, points_balance)
        SELECT id, 0 FROM users WHERE role = 'user'
    ''')
    
    conn.commit()
    conn.close()
    
    print("Database reset completed successfully!")
    print("All bookings, materials, deliveries, and points data have been cleared.")
    print("New bookings will now start with ID = 1")

if __name__ == "__main__":
    reset_database()
