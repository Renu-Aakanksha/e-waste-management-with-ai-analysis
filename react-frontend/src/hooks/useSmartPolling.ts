import { useEffect, useRef, useState } from 'react';

interface SmartPollingOptions {
  interval: number;
  enabled?: boolean;
  maxInterval?: number;
  activityThreshold?: number;
}

/**
 * Smart polling hook that adjusts polling frequency based on user activity and tab visibility
 * Reduces unnecessary API calls and improves performance
 */
export const useSmartPolling = (
  callback: () => void | Promise<void>,
  options: SmartPollingOptions
) => {
  const {
    interval,
    enabled = true,
    maxInterval = 30000, // 30 seconds max
    activityThreshold = 30000 // 30 seconds of inactivity
  } = options;

  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Smart polling logic
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const poll = () => {
      if (isVisible) {
        const timeSinceActivity = Date.now() - lastActivity;
        
        // Only poll if user has been active recently or it's been a long time
        if (timeSinceActivity < activityThreshold || timeSinceActivity > maxInterval) {
          callbackRef.current();
        }
      }
    };

    // Calculate dynamic interval based on activity
    const timeSinceActivity = Date.now() - lastActivity;
    let dynamicInterval = interval;
    
    if (timeSinceActivity > activityThreshold) {
      // User inactive - poll less frequently
      dynamicInterval = Math.min(interval * 3, maxInterval);
    } else if (timeSinceActivity > activityThreshold / 2) {
      // User somewhat inactive - moderate polling
      dynamicInterval = interval * 2;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = setInterval(poll, dynamicInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, isVisible, lastActivity, activityThreshold, maxInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    lastActivity,
    timeSinceActivity: Date.now() - lastActivity
  };
};

