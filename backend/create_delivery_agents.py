#!/usr/bin/env python3
"""
Script to create additional delivery agents and populate the database with test data
"""

import sqlite3
import hashlib
import random
from datetime import datetime, timedelta
from passlib.context import CryptContext

# Use the same password context as the backend
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    """Password hashing using bcrypt (same as backend)"""
    return pwd_context.hash(password)

def create_delivery_agents():
    """Create delivery2 and delivery3 users"""
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    # Create delivery2
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role, created_at)
        VALUES (?, ?, ?, ?)
    ''', ('delivery2', hash_password('delivery123'), 'delivery', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    
    # Create delivery3
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role, created_at)
        VALUES (?, ?, ?, ?)
    ''', ('delivery3', hash_password('delivery123'), 'delivery', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    
    conn.commit()
    conn.close()
    print("✅ Created delivery2 and delivery3 users")

def create_test_bookings():
    """Create some test bookings for different users"""
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    # Get user IDs
    user1_id = cursor.execute('SELECT id FROM users WHERE username = ?', ('user1',)).fetchone()[0]
    
    # Create test bookings
    test_bookings = [
        {
            'user_id': user1_id,
            'customer_name': 'John Doe',
            'category': 'laptop',
            'apartment_name': 'Sunrise Apartments',
            'street_number': '456',
            'area': 'Downtown',
            'state': 'California',
            'pincode': '90210',
            'status': 'pending'
        },
        {
            'user_id': user1_id,
            'customer_name': 'Jane Smith',
            'category': 'smartphone',
            'apartment_name': 'Ocean View',
            'street_number': '789',
            'area': 'Beachside',
            'state': 'Florida',
            'pincode': '33101',
            'status': 'pending'
        },
        {
            'user_id': user1_id,
            'customer_name': 'Mike Johnson',
            'category': 'battery',
            'apartment_name': 'Mountain Heights',
            'street_number': '321',
            'area': 'Hillside',
            'state': 'Colorado',
            'pincode': '80202',
            'status': 'pending'
        },
        {
            'user_id': user1_id,
            'customer_name': 'Sarah Wilson',
            'category': 'other',
            'apartment_name': 'Garden Plaza',
            'street_number': '654',
            'area': 'Suburbs',
            'state': 'Texas',
            'pincode': '75001',
            'status': 'pending'
        },
        {
            'user_id': user1_id,
            'customer_name': 'David Brown',
            'category': 'laptop',
            'apartment_name': 'Tech Tower',
            'street_number': '987',
            'area': 'Silicon Valley',
            'state': 'California',
            'pincode': '94043',
            'status': 'pending'
        }
    ]
    
    for booking in test_bookings:
        cursor.execute('''
            INSERT INTO bookings (user_id, customer_name, category, apartment_name, 
                                street_number, area, state, pincode, status, scheduled, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            booking['user_id'],
            booking['customer_name'],
            booking['category'],
            booking['apartment_name'],
            booking['street_number'],
            booking['area'],
            booking['state'],
            booking['pincode'],
            booking['status'],
            0,  # not scheduled
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ))
    
    conn.commit()
    conn.close()
    print("✅ Created 5 test bookings")

def assign_deliveries():
    """Assign some bookings to different delivery agents"""
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    # Get delivery agent IDs
    delivery1_id = cursor.execute('SELECT id FROM users WHERE username = ?', ('delivery1',)).fetchone()[0]
    delivery2_id = cursor.execute('SELECT id FROM users WHERE username = ?', ('delivery2',)).fetchone()[0]
    delivery3_id = cursor.execute('SELECT id FROM users WHERE username = ?', ('delivery3',)).fetchone()[0]
    
    # Get pending bookings
    pending_bookings = cursor.execute('''
        SELECT id FROM bookings WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5
    ''').fetchall()
    
    if not pending_bookings:
        print("❌ No pending bookings found")
        return
    
    # Assign bookings to different delivery agents
    delivery_assignments = [
        (pending_bookings[0][0], delivery1_id, 'assigned'),
        (pending_bookings[1][0], delivery2_id, 'assigned'),
        (pending_bookings[2][0], delivery3_id, 'assigned'),
        (pending_bookings[3][0], delivery1_id, 'assigned'),
        (pending_bookings[4][0], delivery2_id, 'assigned'),
    ]
    
    for booking_id, delivery_id, status in delivery_assignments:
        # Create delivery assignment
        cursor.execute('''
            INSERT INTO deliveries (booking_id, delivery_guy_id, status, assigned_at)
            VALUES (?, ?, ?, ?)
        ''', (booking_id, delivery_id, status, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        # Update booking status
        cursor.execute('''
            UPDATE bookings SET status = 'assigned', scheduled = 1 WHERE id = ?
        ''', (booking_id,))
    
    conn.commit()
    conn.close()
    print("✅ Assigned bookings to delivery agents")

def create_some_completed_deliveries():
    """Create some completed deliveries for testing"""
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    # Get some assigned deliveries
    assigned_deliveries = cursor.execute('''
        SELECT d.id, d.booking_id, d.delivery_guy_id
        FROM deliveries d
        WHERE d.status = 'assigned'
        LIMIT 3
    ''').fetchall()
    
    for delivery_id, booking_id, delivery_guy_id in assigned_deliveries:
        # Update delivery status to picked_up
        cursor.execute('''
            UPDATE deliveries 
            SET status = 'picked_up', completed_at = ?
            WHERE id = ?
        ''', (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), delivery_id))
        
        # Update booking status
        cursor.execute('''
            UPDATE bookings SET status = 'picked_up' WHERE id = ?
        ''', (booking_id,))
    
    # Get some picked_up deliveries and mark as delivered
    picked_up_deliveries = cursor.execute('''
        SELECT d.id, d.booking_id, d.delivery_guy_id
        FROM deliveries d
        WHERE d.status = 'picked_up'
        LIMIT 2
    ''').fetchall()
    
    for delivery_id, booking_id, delivery_guy_id in picked_up_deliveries:
        # Update delivery status to delivered
        cursor.execute('''
            UPDATE deliveries 
            SET status = 'delivered', completed_at = ?
            WHERE id = ?
        ''', (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), delivery_id))
        
        # Update booking status
        cursor.execute('''
            UPDATE bookings SET status = 'delivered' WHERE id = ?
        ''', (booking_id,))
    
    conn.commit()
    conn.close()
    print("✅ Created some completed deliveries")

def main():
    print("🚀 Setting up delivery agents and test data...")
    
    # Create delivery agents
    create_delivery_agents()
    
    # Create test bookings
    create_test_bookings()
    
    # Assign deliveries
    assign_deliveries()
    
    # Create some completed deliveries
    create_some_completed_deliveries()
    
    print("\n✅ Setup complete!")
    print("\n📋 Summary:")
    print("   - Created delivery2 and delivery3 users")
    print("   - Created 5 test bookings")
    print("   - Assigned bookings to all 3 delivery agents")
    print("   - Created some completed deliveries for testing")
    print("\n🔑 Login credentials:")
    print("   - delivery1 / delivery123")
    print("   - delivery2 / delivery123") 
    print("   - delivery3 / delivery123")

if __name__ == "__main__":
    main()
