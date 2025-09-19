import sqlite3
import requests
import json

def test_assignment():
    # First, create a test booking
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
    
    # Test the assignment API
    # First, get an auth token
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Login to get token
        login_response = requests.post("http://localhost:8000/auth/login", json=login_data)
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data['access_token']
            print("Successfully logged in and got token")
            
            # Test assignment
            assignment_data = {
                "booking_id": booking_id,
                "delivery_guy_id": 2  # delivery1 user
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            assignment_response = requests.post("http://localhost:8000/admin/assign-delivery", json=assignment_data, headers=headers)
            
            if assignment_response.status_code == 200:
                result = assignment_response.json()
                print("Assignment successful!")
                print(f"Response: {result}")
            else:
                print(f"Assignment failed with status {assignment_response.status_code}")
                print(f"Response: {assignment_response.text}")
        else:
            print(f"Login failed with status {login_response.status_code}")
            print(f"Response: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_assignment()
