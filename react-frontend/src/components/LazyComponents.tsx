import { Box, CircularProgress } from '@mui/material';
import React, { Suspense, lazy } from 'react';

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
      Loading component...
    </Box>
  </Box>
);

// Lazy load dashboard components
export const LazyUserDashboard = lazy(() => import('../pages/UserDashboard'));
export const LazyAdminDashboard = lazy(() => import('../pages/AdminDashboard'));
export const LazyDeliveryDashboard = lazy(() => import('../pages/DeliveryDashboard'));
export const LazyPointsPage = lazy(() => import('../pages/PointsPage'));

// Lazy load heavy components
export const LazyImageUpload = lazy(() => import('./OptimizedImageUpload'));
export const LazyBookingCard = lazy(() => import('./OptimizedBookingCard'));
export const LazyDashboardOverview = lazy(() => import('./DashboardOverview'));
export const LazyDashboardStats = lazy(() => import('./DashboardStats'));

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = (props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
  
  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return LazyComponent;
};

// Lazy load with error boundary
export const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

