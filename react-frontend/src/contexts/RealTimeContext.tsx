l  wa React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { adminAPI, bookingAPI, dashboardAPI, deliveryAPI, pointsAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface RealTimeContextType {
  // Delivery data
  assignments: any[];
  setAssignments: (assignments: any[]) => void;
  refreshAssignments: () => Promise<void>;
  
  // Admin data
  pickups: any[];
  setPickups: (pickups: any[]) => void;
  refreshPickups: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  
  // User data
  bookings: any[];
  setBookings: (bookings: any[]) => void;
  refreshBookings: () => Promise<void>;
  refreshPoints: () => Promise<void>;
  
  // Global refresh
  refreshAll: () => Promise<void>;
  
  // Status tracking
  isRefreshing: boolean;
  lastUpdate: Date | null;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

interface RealTimeProviderProps {
  children: React.ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [assignments, setAssignments] = useState<any[]>([]);
  const [pickups, setPickups] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Refs for tracking
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // API refresh functions
  const refreshAssignments = useCallback(async () => {
    if (!user || user.role !== 'delivery') return;
    
    try {
      const response = await deliveryAPI.getAssignments();
      setAssignments(response.data);
      console.log('🔄 Real-time: Refreshed assignments');
    } catch (error) {
      console.error('Error refreshing assignments:', error);
    }
  }, [user]);

  const refreshPickups = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      const response = await adminAPI.getPickups();
      setPickups(response.data);
      console.log('🔄 Real-time: Refreshed pickups');
    } catch (error) {
      console.error('Error refreshing pickups:', error);
    }
  }, [user]);

  const refreshDashboard = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      await dashboardAPI.getDashboard();
      console.log('🔄 Real-time: Refreshed dashboard');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  }, [user]);

  const refreshBookings = useCallback(async () => {
    if (!user || user.role !== 'user') return;
    
    try {
      const response = await bookingAPI.getBookings();
      setBookings(response.data);
      console.log('🔄 Real-time: Refreshed bookings');
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    }
  }, [user]);

  const refreshPoints = useCallback(async () => {
    if (!user || user.role !== 'user') return;
    
    try {
      await pointsAPI.getBalance();
      console.log('🔄 Real-time: Refreshed points');
    } catch (error) {
      console.error('Error refreshing points:', error);
    }
  }, [user]);

  // Global refresh function
  const refreshAll = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    
    try {
      const promises = [];
      
      if (user?.role === 'delivery') {
        promises.push(refreshAssignments());
      } else if (user?.role === 'admin') {
        promises.push(refreshPickups(), refreshDashboard());
      } else if (user?.role === 'user') {
        promises.push(refreshBookings(), refreshPoints());
      }
      
      await Promise.all(promises);
      setLastUpdate(new Date());
      console.log('🔄 Real-time: Refreshed all data');
    } catch (error) {
      console.error('Error in global refresh:', error);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [user, refreshAssignments, refreshPickups, refreshDashboard, refreshBookings, refreshPoints]);

  // Enhanced polling with immediate refresh on status changes
  useEffect(() => {
    if (!user) return;

    const startPolling = () => {
      // Clear existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Set up polling based on user role
      const getPollingInterval = () => {
        switch (user.role) {
          case 'delivery': return 10000; // 10 seconds for delivery
          case 'admin': return 15000;   // 15 seconds for admin
          case 'user': return 20000;    // 20 seconds for user
          default: return 30000;        // 30 seconds default
        }
      };

      const poll = async () => {
        if (!isRefreshingRef.current) {
          await refreshAll();
        }
        
        // Schedule next poll
        refreshTimeoutRef.current = setTimeout(poll, getPollingInterval());
      };

      // Start polling
      poll();
    };

    startPolling();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user, refreshAll]);

  // Listen for storage events (cross-tab communication)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'e_waste_refresh_trigger') {
        console.log('🔄 Real-time: Cross-tab refresh triggered');
        refreshAll();
        // Clear the trigger
        localStorage.removeItem('e_waste_refresh_trigger');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshAll]);

  // Trigger cross-tab refresh
  const triggerCrossTabRefresh = useCallback(() => {
    localStorage.setItem('e_waste_refresh_trigger', Date.now().toString());
  }, []);

  // Expose trigger function globally for status updates
  useEffect(() => {
    (window as any).triggerEwasteRefresh = triggerCrossTabRefresh;
    return () => {
      delete (window as any).triggerEwasteRefresh;
    };
  }, [triggerCrossTabRefresh]);

  const value: RealTimeContextType = {
    assignments,
    setAssignments,
    refreshAssignments,
    pickups,
    setPickups,
    refreshPickups,
    refreshDashboard,
    bookings,
    setBookings,
    refreshBookings,
    refreshPoints,
    refreshAll,
    isRefreshing,
    lastUpdate,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
