import {
  Nature as EcoIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { adminAPI, dashboardAPI, routesAPI } from '../services/api';
import { createAdminDashboardStyles } from './AdminDashboard.styles';

// Import components
import DashboardOverview from '../components/DashboardOverview';
import DashboardStats from '../components/DashboardStats';
import ManagementSections from '../components/ManagementSections';
import PickupManagement from '../components/PickupManagement';
import PickupStatusCards from '../components/PickupStatusCards';

// Types
interface Pickup {
  id: number;
  customer_name: string;
  category: string;
  apartment_name: string;
  street_number: string;
  area: string;
  state: string;
  pincode: string;
  status: string;
  scheduled: boolean;
  route_id?: number;
  delivery_guy?: string;
  delivery_status?: string;
  created_at: string;
}

interface DeliveryGuy {
  id: number;
  username: string;
  created_at: string;
}

interface Route {
  id: number;
  name: string;
  area: string;
  created_at: string;
}

interface DashboardData {
  total_bookings: number;
  ev_battery_units: number;
  solar_panel_units: number;
}

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const { pickups, setPickups, refreshAll, isRefreshing, lastUpdate } = useRealTime();
  const navigate = useNavigate();
  const theme = useTheme();
  const styles = createAdminDashboardStyles(theme);
  
  // State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [deliveryGuys, setDeliveryGuys] = useState<DeliveryGuy[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unassigned' | 'assigned' | 'picked_up' | 'delivered'>('all');
  const [activeSection, setActiveSection] = useState<'none' | 'dashboard' | 'routes' | 'deliveryPartners'>('dashboard');

  // Memoized API call functions for better performance
  const loadDashboardData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, []);

  const loadPickups = useCallback(async () => {
    try {
      const response = await adminAPI.getPickups();
      setPickups(response.data);
    } catch (err) {
      console.error('Error loading pickups:', err);
    }
  }, [setPickups]);

  const loadDeliveryGuys = useCallback(async () => {
    try {
      const response = await adminAPI.getDeliveryGuys();
      setDeliveryGuys(response.data);
    } catch (err) {
      console.error('Error loading delivery guys:', err);
    }
  }, []);

  const loadRoutes = useCallback(async () => {
    try {
      const response = await routesAPI.getRoutes();
      setRoutes(response.data);
    } catch (err) {
      console.error('Error loading routes:', err);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadDashboardData(),
          loadPickups(),
          loadDeliveryGuys(),
          loadRoutes()
        ]);
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [loadDashboardData, loadPickups, loadDeliveryGuys, loadRoutes]);

  // Use real-time context instead of smart polling
  useEffect(() => {
    if (pickups.length > 0) {
      setLoading(false);
    }
  }, [pickups]);


  // Event handlers
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshAll();
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCardClick = (filter: 'unassigned' | 'assigned' | 'picked_up' | 'delivered') => {
    setActiveSection('none');
    setActiveFilter(filter);
  };

  const handleDashboardClick = () => {
    if (activeSection === 'dashboard') {
      setActiveSection('none');
      setActiveFilter('all');
    } else {
      setActiveSection('dashboard');
      setActiveFilter('all');
    }
  };

  const handleRoutesCardClick = () => {
    if (activeSection === 'routes') {
      setActiveSection('none');
      setActiveFilter('all');
    } else {
      setActiveSection('routes');
      setActiveFilter('all');
    }
  };

  const handleDeliveryPartnersCardClick = () => {
    if (activeSection === 'deliveryPartners') {
      setActiveSection('none');
      setActiveFilter('all');
    } else {
      setActiveSection('deliveryPartners');
      setActiveFilter('all');
    }
  };

  const handleAssignDelivery = async (pickupId: number, deliveryGuyId: string) => {
    try {
      await adminAPI.assignDelivery(pickupId, parseInt(deliveryGuyId));
      
      // Trigger immediate refresh for all pages
      console.log('🔄 Admin: Assignment updated, triggering cross-page refresh');
      if ((window as any).triggerEwasteRefresh) {
        (window as any).triggerEwasteRefresh();
      }
      
      // Also refresh local data immediately
      await refreshAll();
    } catch (err) {
      setError('Failed to assign delivery');
    }
  };

  const handleCreateRoute = async () => {
    const routeName = prompt('Enter route name:');
    const routeArea = prompt('Enter route area:');
    
    if (routeName && routeArea) {
      try {
        alert('Route creation feature will be implemented in the backend');
        loadRoutes();
      } catch (err) {
        setError('Failed to create route');
      }
    }
  };

  const handleCreateDeliveryPartner = async () => {
    const username = prompt('Enter delivery partner username:');
    const password = prompt('Enter password:');
    
    if (username && password) {
      try {
        alert('Delivery partner creation feature will be implemented in the backend');
        loadDeliveryGuys();
      } catch (err) {
        setError('Failed to create delivery partner');
      }
    }
  };

  // Utility functions
  const getStatusChip = (pickup: Pickup) => {
    if (pickup.delivery_status) {
      const statusConfig = {
        assigned: { label: 'Assigned', color: 'warning' as const },
        picked_up: { label: 'Picked Up', color: 'info' as const },
        delivered: { label: 'Delivered', color: 'success' as const }
      };
      const config = statusConfig[pickup.delivery_status as keyof typeof statusConfig] || { label: pickup.delivery_status, color: 'default' as const };
      return <Chip label={config.label} color={config.color} size="small" />;
    } else if (pickup.delivery_guy) {
      return <Chip label="Assigned" color="success" size="small" />;
    } else if (pickup.scheduled) {
      return <Chip label="Scheduled" color="info" size="small" />;
    } else {
      return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  const getFilteredPickups = () => {
    switch (activeFilter) {
      case 'unassigned':
        return pickups.filter(p => !p.delivery_guy);
      case 'assigned':
        return pickups.filter(p => p.delivery_guy && p.delivery_status === 'assigned');
      case 'picked_up':
        return pickups.filter(p => p.delivery_status === 'picked_up');
      case 'delivered':
        return pickups.filter(p => p.delivery_status === 'delivered');
      default:
        return pickups;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={styles.mainContainer}>
      {/* Header */}
      <AppBar position="static" className="admin-dashboard-header">
        <Toolbar>
          <EcoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Welcome, {user?.username || 'Admin'}!
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Dashboard Stats */}
        <DashboardStats
          dashboardData={dashboardData}
          routesCount={routes.length}
          deliveryGuysCount={deliveryGuys.length}
          activeSection={activeSection}
          onDashboardClick={handleDashboardClick}
          onRoutesClick={handleRoutesCardClick}
          onDeliveryPartnersClick={handleDeliveryPartnersCardClick}
          styles={styles}
        />

        {/* Pickup Status Cards */}
        <PickupStatusCards
          pickups={pickups}
          activeFilter={activeFilter}
          activeSection={activeSection}
          onCardClick={handleCardClick}
          styles={styles}
        />

        {/* Action Buttons */}
        <Box sx={{ ...styles.actionButtonsContainer, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="large"
            sx={styles.refreshButton}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </Button>
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        {/* Dashboard Overview Section */}
        {activeSection === 'dashboard' && (
          <DashboardOverview
            dashboardData={dashboardData}
            routes={routes}
            deliveryGuys={deliveryGuys}
            pickups={pickups}
            getStatusChip={getStatusChip}
            onCreateRoute={handleCreateRoute}
            onCreateDeliveryPartner={handleCreateDeliveryPartner}
            styles={styles}
          />
        )}

        {/* Management Sections */}
        <ManagementSections
          activeSection={activeSection}
          routes={routes}
          deliveryGuys={deliveryGuys}
          pickups={pickups}
          dashboardData={dashboardData}
          onCreateRoute={handleCreateRoute}
          onCreateDeliveryPartner={handleCreateDeliveryPartner}
          styles={styles}
        />

        {/* Pickup Management - Only show when no management section is active */}
        {activeSection === 'none' && (
          <PickupManagement
            pickups={pickups}
            deliveryGuys={deliveryGuys}
            activeFilter={activeFilter}
            onCardClick={handleCardClick}
            onAssignDelivery={handleAssignDelivery}
            getStatusChip={getStatusChip}
            getFilteredPickups={getFilteredPickups}
            styles={styles}
          />
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
