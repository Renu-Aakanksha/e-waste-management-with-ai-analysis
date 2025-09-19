import sqlite3
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_database():
    conn = sqlite3.connect('e_waste.db')
    cursor = conn.cursor()
    
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
    
    # Create default admin user
    admin_password = pwd_context.hash("admin123")
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', ("admin", admin_password, "admin"))
    
    # Create default delivery guy
    delivery_password = pwd_context.hash("delivery123")
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', ("delivery1", delivery_password, "delivery"))
    
    # Create default user
    user_password = pwd_context.hash("user123")
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', ("user1", user_password, "user"))
    
    conn.commit()
    conn.close()
    print("Database initialized with users and deliveries tables")

if __name__ == "__main__":
    init_database()
