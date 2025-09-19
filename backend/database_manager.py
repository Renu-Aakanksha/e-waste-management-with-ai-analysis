#!/usr/bin/env python3
"""
Database connection manager with pooling for performance optimization
"""
import sqlite3
import threading
from contextlib import contextmanager
from typing import Generator
import time

class DatabaseManager:
    """Thread-safe database connection manager with pooling"""
    
    def __init__(self, db_path: str, max_connections: int = 10):
        self.db_path = db_path
        self.max_connections = max_connections
        self._pool = []
        self._lock = threading.Lock()
        self._created_connections = 0
        
    def _create_connection(self) -> sqlite3.Connection:
        """Create a new database connection"""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")  # Enable WAL mode for better concurrency
        conn.execute("PRAGMA synchronous=NORMAL")  # Balance between safety and speed
        conn.execute("PRAGMA cache_size=10000")  # Increase cache size
        conn.execute("PRAGMA temp_store=MEMORY")  # Store temp tables in memory
        return conn
    
    @contextmanager
    def get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Get a database connection from the pool"""
        conn = None
        try:
            with self._lock:
                if self._pool:
                    conn = self._pool.pop()
                elif self._created_connections < self.max_connections:
                    conn = self._create_connection()
                    self._created_connections += 1
                else:
                    # Wait for a connection to become available
                    while not self._pool and self._created_connections >= self.max_connections:
                        time.sleep(0.001)  # Small delay to prevent busy waiting
                    if self._pool:
                        conn = self._pool.pop()
                    else:
                        conn = self._create_connection()
                        self._created_connections += 1
            
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                try:
                    # Return connection to pool if it's still valid
                    conn.execute("SELECT 1")  # Test if connection is still valid
                    with self._lock:
                        if len(self._pool) < self.max_connections:
                            self._pool.append(conn)
                        else:
                            conn.close()
                            self._created_connections -= 1
                except sqlite3.Error:
                    # Connection is invalid, close it
                    conn.close()
                    with self._lock:
                        self._created_connections -= 1
    
    def close_all(self):
        """Close all connections in the pool"""
        with self._lock:
            for conn in self._pool:
                conn.close()
            self._pool.clear()
            self._created_connections = 0
    
    def get_stats(self) -> dict:
        """Get connection pool statistics"""
        with self._lock:
            return {
                "pool_size": len(self._pool),
                "created_connections": self._created_connections,
                "max_connections": self.max_connections
            }

# Global database manager instance
db_manager = DatabaseManager('e_waste.db', max_connections=10)

