import sqlite3

def create_test_booking():
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    # Create a test booking
    cursor.execute('''
        INSERT INTO bookings (user_id, customer_name, category, apartment_name, street_number, area, state, pincode, status, scheduled) 
        VALUES (3, 'Test User', 'smartphone', 'Test Apt', '123', 'Test Area', 'Test State', '123456', 'scheduled', 1)
    ''')
    booking_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    print(f"Created test booking with ID: {booking_id}")
    return booking_id

if __name__ == "__main__":
    create_test_booking()
