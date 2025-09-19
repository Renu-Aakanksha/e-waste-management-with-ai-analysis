import sqlite3
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def setup_database():
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
    # Check existing tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing_tables = [row[0] for row in cursor.fetchall()]
    print(f"Existing tables: {existing_tables}")
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('user', 'delivery', 'admin')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create bookings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            category TEXT NOT NULL,
            apartment_name TEXT,
            street_number TEXT,
            area TEXT,
            state TEXT,
            pincode TEXT,
            status TEXT DEFAULT 'pending',
            route_id INTEGER,
            scheduled INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create materials table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            material TEXT NOT NULL,
            quantity REAL NOT NULL,
            FOREIGN KEY (booking_id) REFERENCES bookings (id)
        )
    ''')
    
    # Create deliveries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            delivery_guy_id INTEGER NOT NULL,
            status TEXT DEFAULT 'assigned' CHECK(status IN ('assigned', 'picked_up', 'delivered')),
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings (id),
            FOREIGN KEY (delivery_guy_id) REFERENCES users (id)
        )
    ''')
    
    # Create user_points table for loyalty points
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            points_balance INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create points_history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS points_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            transaction_id INTEGER,
            points_awarded INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (transaction_id) REFERENCES bookings (id)
        )
    ''')
    
    # Create default users
    admin_password = pwd_context.hash("admin123")
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', ("admin", admin_password, "admin"))
    
    delivery_password = pwd_context.hash("delivery123")
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', ("delivery1", delivery_password, "delivery"))
    
    user_password = pwd_context.hash("user123")
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', ("user1", user_password, "user"))
    
    # Initialize points for existing users
    cursor.execute('''
        INSERT OR IGNORE INTO user_points (user_id, points_balance)
        SELECT id, 0 FROM users WHERE role = 'user'
    ''')
    
    conn.commit()
    conn.close()
    print("Database setup completed with all tables including points system")

if __name__ == "__main__":
    setup_database()
