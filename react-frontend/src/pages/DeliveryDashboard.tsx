import {
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Nature as EcoIcon,
    LocationOn as LocationIcon,
    Logout as LogoutIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    Alert,
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Toolbar,
    Typography,
    useTheme
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { deliveryAPI } from '../services/api';

interface Assignment {
  id: number;
  customer_name: string;
  category: string;
  apartment_name: string;
  street_number: string;
  area: string;
  state: string;
  pincode: string;
  status: string;
  delivery_status: string;
  route_id?: number;
  assigned_at: string;
  completed_at?: string;
}

const DeliveryDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const { assignments, setAssignments, refreshAll, isRefreshing, lastUpdate } = useRealTime();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'picked_up' | 'delivered'>('all');

  // Memoized API call function for better performance
  const loadAssignments = useCallback(async () => {
    try {
      const response = await deliveryAPI.getAssignments();
      console.log('Loaded assignments:', response.data);
      setAssignments(response.data);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [setAssignments]);

  // Load initial data
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Use real-time context instead of smart polling
  useEffect(() => {
    if (assignments.length > 0) {
      setLoading(false);
    }
  }, [assignments]);

  const handleStatusUpdate = async (assignmentId: number, status: string) => {
    try {
      await deliveryAPI.updateStatus(assignmentId, status);
      
      // Trigger immediate refresh for all pages
      console.log('🔄 Delivery: Status updated, triggering cross-page refresh');
      if ((window as any).triggerEwasteRefresh) {
        (window as any).triggerEwasteRefresh();
      }
      
      // Also refresh local data immediately
      await refreshAll();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const getStatusChip = (assignment: Assignment) => {
    const statusConfig = {
      assigned: { label: 'Assigned', color: 'warning' as const },
      picked_up: { label: 'Picked Up', color: 'info' as const },
      delivered: { label: 'Delivered', color: 'success' as const }
    };

    const config = statusConfig[assignment.delivery_status as keyof typeof statusConfig] || { label: assignment.delivery_status, color: 'default' as const };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const getBorderColor = (assignment: Assignment) => {
    switch (assignment.delivery_status) {
      case 'delivered': return theme.palette.success.main;
      case 'picked_up': return theme.palette.info.main;
      case 'assigned': return theme.palette.warning.main;
      default: return theme.palette.grey[400];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCardClick = (filter: 'all' | 'pending' | 'picked_up' | 'delivered') => {
    setActiveFilter(filter);
  };

  const getFilteredAssignments = () => {
    switch (activeFilter) {
      case 'pending':
        return pendingAssignments;
      case 'picked_up':
        return pickedUpAssignments;
      case 'delivered':
        return completedAssignments;
      default:
        return assignments;
    }
  };

  const pendingAssignments = useMemo(() => {
    const filtered = assignments.filter(a => a.delivery_status === 'assigned');
    console.log('Pending assignments:', filtered);
    return filtered;
  }, [assignments]);
  
  const pickedUpAssignments = useMemo(() => {
    const filtered = assignments.filter(a => a.delivery_status === 'picked_up');
    console.log('Picked up assignments:', filtered);
    return filtered;
  }, [assignments]);
  
  const completedAssignments = useMemo(() => {
    const filtered = assignments.filter(a => a.delivery_status === 'delivered');
    console.log('Completed assignments:', filtered);
    return filtered;
  }, [assignments]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static" className="delivery-dashboard-header">
        <Toolbar>
          <EcoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Welcome, {user?.username || 'Delivery Partner'}!
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

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              border: activeFilter === 'all' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => handleCardClick('all')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary" fontWeight="bold">
                {assignments.length}
              </Typography>
              <Typography color="text.secondary">Total Assignments</Typography>
            </CardContent>
          </Card>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              border: activeFilter === 'pending' ? `2px solid ${theme.palette.warning.main}` : '2px solid transparent',
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => handleCardClick('pending')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {pendingAssignments.length}
              </Typography>
              <Typography color="text.secondary">Pending Pickups</Typography>
            </CardContent>
          </Card>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              border: activeFilter === 'picked_up' ? `2px solid ${theme.palette.info.main}` : '2px solid transparent',
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => handleCardClick('picked_up')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {pickedUpAssignments.length}
              </Typography>
              <Typography color="text.secondary">Pending Deliveries</Typography>
            </CardContent>
          </Card>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              border: activeFilter === 'delivered' ? `2px solid ${theme.palette.success.main}` : '2px solid transparent',
              '&:hover': { 
                boxShadow: 6,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => handleCardClick('delivered')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {completedAssignments.length}
              </Typography>
              <Typography color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshAll}
            size="large"
            sx={{ px: 4 }}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        {/* Pending Assignments - Only show when no filter is active */}
        {activeFilter === 'all' && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Pending Pickups ({pendingAssignments.length})
            </Typography>
            <Chip
              icon={<RefreshIcon />}
              label={isRefreshing ? "Refreshing..." : "Auto-refreshing every 10s"}
              color="info"
              variant="outlined"
            />
          </Box>

          {pendingAssignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">No pending assignments</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {pendingAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  sx={{
                    borderLeft: `4px solid ${getBorderColor(assignment)}`,
                    '&:hover': { boxShadow: 4 },
                    transition: 'box-shadow 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Assignment #{assignment.id}
                      </Typography>
                      {getStatusChip(assignment)}
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Customer
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.customer_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {assignment.category}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Route ID
                        </Typography>
                        <Typography variant="body1">
                          {assignment.route_id || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Assigned At
                        </Typography>
                        <Typography variant="body1">
                          {new Date(assignment.assigned_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {assignment.apartment_name}, {assignment.street_number}, {assignment.area}, {assignment.state} - {assignment.pincode}
                      </Typography>
                    </Box>

                    {/* Map Placeholder */}
                    <Box
                      sx={{
                        bgcolor: 'grey.100',
                        height: 200,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">Map View</Typography>
                        <Typography variant="caption" color="text.secondary">
                          GPS navigation would be integrated here
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {assignment.delivery_status === 'assigned' && (
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleStatusUpdate(assignment.id, 'picked_up')}
                        color="info"
                      >
                        Mark as Picked Up
                      </Button>
                      )}
                      {assignment.delivery_status === 'picked_up' && (
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleStatusUpdate(assignment.id, 'delivered')}
                        color="success"
                      >
                        Mark as Delivered
                      </Button>
                      )}
                      {assignment.delivery_status === 'delivered' && (
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
        )}

        {/* Pending Deliveries - Only show when no filter is active */}
        {activeFilter === 'all' && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Pending Deliveries ({pickedUpAssignments.length})
          </Typography>

          {pickedUpAssignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">No pending deliveries</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {pickedUpAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  sx={{
                    borderLeft: `4px solid ${getBorderColor(assignment)}`,
                    '&:hover': { boxShadow: 4 },
                    transition: 'box-shadow 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Assignment #{assignment.id}
                      </Typography>
                      {getStatusChip(assignment)}
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Customer
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.customer_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.category}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.street_number}, {assignment.apartment_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.area}, {assignment.state} - {assignment.pincode}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Route ID
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.route_id ? `Route #${assignment.route_id}` : 'Not scheduled'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ 
                      backgroundColor: theme.palette.info.light, 
                      p: 2, 
                      borderRadius: 2, 
                      mb: 2,
                      border: `1px solid ${theme.palette.info.main}`
                    }}>
                      <Typography variant="body2" color="info.dark" fontWeight="bold" gutterBottom>
                        📍 Delivery Instructions
                      </Typography>
                      <Typography variant="body2" color="info.dark">
                        GPS navigation would be integrated here
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {assignment.delivery_status === 'assigned' && (
                        <Button
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleStatusUpdate(assignment.id, 'picked_up')}
                          color="info"
                        >
                          Mark as Picked Up
                        </Button>
                      )}
                      {assignment.delivery_status === 'picked_up' && (
                        <Button
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleStatusUpdate(assignment.id, 'delivered')}
                          color="success"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      {assignment.delivery_status === 'delivered' && (
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
        )}

        {/* Completed Assignments - Only show when no filter is active */}
        {activeFilter === 'all' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Completed Assignments ({completedAssignments.length})
          </Typography>

          {completedAssignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">No completed assignments yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {completedAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  sx={{
                    borderLeft: `4px solid ${getBorderColor(assignment)}`,
                    '&:hover': { boxShadow: 2 },
                    opacity: 0.8
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Assignment #{assignment.id} ✅
                      </Typography>
                      {getStatusChip(assignment)}
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Customer
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.customer_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {assignment.category}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Route ID
                        </Typography>
                        <Typography variant="body1">
                          {assignment.route_id || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Completed At
                        </Typography>
                        <Typography variant="body1">
                          {new Date(assignment.completed_at || assignment.assigned_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {assignment.apartment_name}, {assignment.street_number}, {assignment.area}, {assignment.state} - {assignment.pincode}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
        )}

        {/* Dynamic Content Section - Only show when a filter is active */}
        {activeFilter !== 'all' && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              {activeFilter === 'pending' && `Pending Pickups (${pendingAssignments.length})`}
              {activeFilter === 'picked_up' && `Pending Deliveries (${pickedUpAssignments.length})`}
              {activeFilter === 'delivered' && `Completed Assignments (${completedAssignments.length})`}
            </Typography>
            <Chip
              icon={<RefreshIcon />}
              label={isRefreshing ? "Refreshing..." : "Auto-refreshing every 10s"}
              color="info"
              variant="outlined"
            />
          </Box>

          {getFilteredAssignments().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                {activeFilter === 'pending' && 'No pending pickups'}
                {activeFilter === 'picked_up' && 'No pending deliveries'}
                {activeFilter === 'delivered' && 'No completed assignments'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {getFilteredAssignments().map((assignment) => (
                <Card
                  key={assignment.id}
                  sx={{
                    borderLeft: `4px solid ${getBorderColor(assignment)}`,
                    '&:hover': { boxShadow: 4 },
                    transition: 'box-shadow 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Assignment #{assignment.id}
                      </Typography>
                      {getStatusChip(assignment)}
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Customer
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.customer_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.category}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.street_number}, {assignment.apartment_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.area}, {assignment.state} - {assignment.pincode}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Route ID
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.route_id ? `Route #${assignment.route_id}` : 'Not scheduled'}
                        </Typography>
                      </Box>
                    </Box>

                    {(assignment.delivery_status === 'assigned' || assignment.delivery_status === 'picked_up') && (
                      <Box sx={{ 
                        backgroundColor: assignment.delivery_status === 'assigned' ? theme.palette.warning.light : theme.palette.info.light, 
                        p: 2, 
                        borderRadius: 2, 
                        mb: 2,
                        border: `1px solid ${assignment.delivery_status === 'assigned' ? theme.palette.warning.main : theme.palette.info.main}`
                      }}>
                        <Typography variant="body2" color={assignment.delivery_status === 'assigned' ? 'warning.dark' : 'info.dark'} fontWeight="bold" gutterBottom>
                          {assignment.delivery_status === 'assigned' ? '📍 Pickup Instructions' : '📍 Delivery Instructions'}
                        </Typography>
                        <Typography variant="body2" color={assignment.delivery_status === 'assigned' ? 'warning.dark' : 'info.dark'}>
                          GPS navigation would be integrated here
                        </Typography>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {assignment.delivery_status === 'assigned' && (
                        <Button
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleStatusUpdate(assignment.id, 'picked_up')}
                          color="info"
                        >
                          Mark as Picked Up
                        </Button>
                      )}
                      {assignment.delivery_status === 'picked_up' && (
                        <Button
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleStatusUpdate(assignment.id, 'delivered')}
                          color="success"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      {assignment.delivery_status === 'delivered' && (
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
        )}
      </Container>
    </Box>
  );
};

export default DeliveryDashboard;