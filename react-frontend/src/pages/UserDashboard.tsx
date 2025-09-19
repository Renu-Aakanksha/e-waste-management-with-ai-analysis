import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  LocalShipping as ShippingIcon,
  Star as StarIcon
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { bookingAPI, dashboardAPI, pointsAPI } from '../services/api';

interface Booking {
  id: number;
  category: string;
  apartment_name: string;
  street_number: string;
  area: string;
  state: string;
  pincode: string;
  status: string;
  created_at: string;
}

interface DashboardData {
  total_bookings: number;
  ev_battery_units: number;
  solar_panel_units: number;
}

const UserDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const { bookings, setBookings, refreshAll, isRefreshing, lastUpdate } = useRealTime();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState<string>('');
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'assigned' | 'picked_up' | 'delivered'>('all');
  const [bookingForm, setBookingForm] = useState({
    category: '',
    device_model: '',
    apartment_name: '',
    street_number: '',
    area: '',
    state: '',
    pincode: ''
  });
  const [imageValidated, setImageValidated] = useState(false);
  const [imageClassification, setImageClassification] = useState<any>(null);

  const steps = ['pending', 'scheduled', 'assigned', 'picked_up', 'delivered'];

  // Calculate points based on delivered bookings (memoized for performance)
  // This is used for logging and performance optimization, not display
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const memoizedPoints = useMemo(() => {
    const deliveredBookings = bookings.filter(booking => booking.status === 'delivered');
    const points = deliveredBookings.length * 20; // 20 points per delivery
    console.log(`📊 Calculated points: ${points} from ${deliveredBookings.length} delivered bookings`);
    return points;
  }, [bookings]);


  // Memoized API call functions for better performance
  const loadDashboardData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const response = await bookingAPI.getBookings();
      setBookings(response.data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  }, [setBookings]);

  const loadPointsBalance = useCallback(async () => {
    try {
      console.log('Loading points balance...');
      const response = await pointsAPI.getBalance();
      console.log('Points balance response:', response.data);
      setPointsBalance(response.data.points_balance);
      console.log('Points balance updated to:', response.data.points_balance);
    } catch (err: any) {
      console.error('Error loading points balance:', err);
    }
  }, []);

  const loadPointsHistory = useCallback(async () => {
    try {
      console.log('Loading points history...');
      const response = await pointsAPI.getHistory();
      console.log('Points history response:', response.data);
      setPointsHistory(response.data);
    } catch (err: any) {
      console.error('Error loading points history:', err);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        console.log('UserDashboard: Loading initial data for user:', user);
        await Promise.all([
          loadDashboardData(),
          loadBookings(),
          loadPointsBalance()
        ]);
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, loadDashboardData, loadBookings, loadPointsBalance]);

  // Use real-time context instead of smart polling
  useEffect(() => {
    if (bookings.length > 0) {
      setLoading(false);
    }
  }, [bookings]);


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

  const handleImageValidated = (isValid: boolean, classification?: any) => {
    setImageValidated(isValid);
    setImageClassification(classification);
    
  // Auto-populate category and device model based on detected device type
  if (isValid && classification?.device_type) {
    setBookingForm(prev => ({
      ...prev,
      category: classification.device_type,
      device_model: classification.device_model || ''
    }));
  }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if image is validated
    if (!imageValidated) {
      setError('Please upload and validate an image of your electronic device first');
      return;
    }
    
    try {
      await bookingAPI.createBooking(bookingForm);
      setBookingDialogOpen(false);
      setBookingForm({
        category: '',
        device_model: '',
        apartment_name: '',
        street_number: '',
        area: '',
        state: '',
        pincode: ''
      });
      setImageValidated(false);
      setImageClassification(null);
      
      // Trigger immediate refresh for all pages
      console.log('🔄 User: New booking created, triggering cross-page refresh');
      if ((window as any).triggerEwasteRefresh) {
        (window as any).triggerEwasteRefresh();
      }
      
      // Also refresh local data immediately
      await refreshAll();
    } catch (err) {
      setError('Failed to create booking');
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning' as const },
      scheduled: { label: 'Scheduled', color: 'info' as const },
      assigned: { label: 'Assigned', color: 'secondary' as const },
      picked_up: { label: 'Picked Up', color: 'error' as const },
      delivered: { label: 'Delivered', color: 'success' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRedeem = async () => {
    try {
      const amount = parseInt(redeemAmount);
      console.log('Redeeming points:', amount, 'Current balance:', pointsBalance);
      
      if (amount > pointsBalance) {
        setError('Insufficient points balance');
        return;
      }
      
      if (amount < 60) {
        setError('Minimum 60 points required for redemption');
        return;
      }
      
      const response = await pointsAPI.redeemPoints(amount);
      console.log('Redemption response:', response.data);
      
      setRedeemDialogOpen(false);
      setRedeemAmount('');
      
      // Reload points balance and history after redemption
      await Promise.all([
        loadPointsBalance(),
        loadPointsHistory()
      ]);
      
      setError(null);
      setSuccess(`Successfully redeemed ${amount} points! Gift card code: ${response.data.gift_card_code}`);
      
      // Clear success message after 10 seconds
      setTimeout(() => setSuccess(null), 10000);
    } catch (err: any) {
      console.error('Redemption error:', err);
      setError(err.response?.data?.detail || 'Failed to redeem points');
    }
  };

  const getFilteredBookings = () => {
    let filteredBookings;
    switch (activeFilter) {
      case 'assigned':
        filteredBookings = bookings.filter(booking => booking.status === 'assigned');
        break;
      case 'picked_up':
        filteredBookings = bookings.filter(booking => booking.status === 'picked_up');
        break;
      case 'delivered':
        filteredBookings = bookings.filter(booking => booking.status === 'delivered');
        break;
      case 'active':
        filteredBookings = bookings.filter(booking => booking.status === 'pending' || booking.status === 'scheduled');
        break;
      case 'all':
        filteredBookings = bookings; // Return ALL bookings when 'all' filter is active
        break;
      default:
        filteredBookings = bookings.filter(booking => booking.status !== 'delivered');
    }
    
    // Sort bookings by status: pending/scheduled -> assigned -> picked_up -> delivered, then by creation date
    const statusOrder = { 'pending': 0, 'scheduled': 0, 'assigned': 1, 'picked_up': 2, 'delivered': 3 };
    return filteredBookings.sort((a, b) => {
      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 4;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 4;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // If same status, sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const getActiveBookings = () => {
    if (activeFilter === 'all' || activeFilter === 'active' || activeFilter === 'assigned' || activeFilter === 'picked_up' || activeFilter === 'delivered') {
      return getFilteredBookings();
    }
    return bookings.filter(booking => booking.status !== 'delivered');
  };

  const getDeliveredBookings = () => {
    if (activeFilter === 'delivered') {
      return getFilteredBookings();
    }
    return bookings.filter(booking => booking.status === 'delivered');
  };

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
      <AppBar position="static" className="user-dashboard-header">
        <Toolbar>
          <StarIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Welcome, {user?.username || 'User'}!
          </Typography>
          <Button
            color="inherit"
            startIcon={<StarIcon />}
            onClick={() => navigate('/points')}
            sx={{ mr: 2 }}
          >
            Points: {pointsBalance}
          </Button>
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

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Dashboard Stats - Only show Points */}
        {dashboardData && (
          <Fade in timeout={800}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                  maxWidth: 300
                }}
                onClick={() => {
                  setRedeemDialogOpen(true);
                  loadPointsHistory();
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <StarIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {pointsBalance || 0}
                  </Typography>
                  <Typography color="text.secondary">Your Points</Typography>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        )}

        {/* Status Filter Cards */}
        <Fade in timeout={600}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 3, mb: 4 }}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeFilter === 'all' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
              onClick={() => setActiveFilter('all')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {bookings.length}
                </Typography>
                <Typography color="text.secondary">Total Bookings</Typography>
              </CardContent>
            </Card>

            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeFilter === 'active' ? `2px solid ${theme.palette.info.main}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
              onClick={() => setActiveFilter('active')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AssignmentIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {bookings.filter(b => b.status === 'pending' || b.status === 'scheduled').length}
                </Typography>
                <Typography color="text.secondary">Active Bookings</Typography>
              </CardContent>
            </Card>

            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeFilter === 'assigned' ? `2px solid ${theme.palette.warning.main}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
              onClick={() => setActiveFilter('assigned')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AssignmentIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {bookings.filter(b => b.status === 'assigned').length}
                </Typography>
                <Typography color="text.secondary">Partner Assigned</Typography>
              </CardContent>
            </Card>

            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeFilter === 'picked_up' ? `2px solid ${theme.palette.info.main}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
              onClick={() => setActiveFilter('picked_up')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <ShippingIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {bookings.filter(b => b.status === 'picked_up').length}
                </Typography>
                <Typography color="text.secondary">Picked Up</Typography>
              </CardContent>
            </Card>

            <Card 
              sx={{ 
                cursor: 'pointer',
                border: activeFilter === 'delivered' ? `2px solid ${theme.palette.success.main}` : '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
              }}
              onClick={() => setActiveFilter('delivered')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {bookings.filter(b => b.status === 'delivered').length}
                </Typography>
                <Typography color="text.secondary">Delivered</Typography>
              </CardContent>
            </Card>
          </Box>
        </Fade>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setBookingDialogOpen(true)}
            size="large"
            sx={{ px: 4 }}
          >
            Book E-Waste Pickup
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
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

        {/* Bookings Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Active Bookings Section */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  {activeFilter === 'all' ? 'Total Bookings' : 
                   activeFilter === 'active' ? 'Active Bookings' :
                   activeFilter === 'assigned' ? 'Partner Assigned Bookings' :
                   activeFilter === 'picked_up' ? 'Picked Up Bookings' :
                   activeFilter === 'delivered' ? 'Delivered Bookings' :
                   'All Bookings'} ({getActiveBookings().length})
                </Typography>
              <Chip
                icon={<RefreshIcon />}
                label={isRefreshing ? "Refreshing..." : "Auto-refreshing every 20s"}
                color="info"
                variant="outlined"
              />
            </Box>

            {getActiveBookings().length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AssignmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {activeFilter === 'active' ? 'No active bookings' :
                   activeFilter === 'assigned' ? 'No partner assigned bookings' :
                   activeFilter === 'picked_up' ? 'No picked up bookings' :
                   activeFilter === 'delivered' ? 'No delivered bookings' :
                   'No bookings found'}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {activeFilter === 'active' ? 'No bookings are waiting for driver assignment' :
                   activeFilter === 'assigned' ? 'No bookings have been assigned to delivery partners yet' :
                   activeFilter === 'picked_up' ? 'No bookings have been picked up yet' :
                   activeFilter === 'delivered' ? 'No bookings have been delivered yet' :
                   'No bookings match the current filter'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setBookingDialogOpen(true)}
                  size="large"
                >
                  Book New Pickup
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {getActiveBookings().map((booking) => (
                  <Card
                    key={booking.id}
                    sx={{
                      borderLeft: `4px solid ${
                        booking.status === 'delivered' ? theme.palette.success.main :
                        booking.status === 'picked_up' ? theme.palette.info.main :
                        booking.status === 'assigned' ? theme.palette.warning.main :
                        booking.status === 'scheduled' ? theme.palette.info.main :
                        theme.palette.grey[400]
                      }`,
                      '&:hover': { boxShadow: 4 },
                      transition: 'box-shadow 0.3s ease'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Booking #{booking.id}
                        </Typography>
                        {getStatusChip(booking.status)}
                      </Box>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Category
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {booking.category}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Address
                          </Typography>
                          <Typography variant="body1">
                            {booking.apartment_name}, {booking.street_number}, {booking.area}, {booking.state} - {booking.pincode}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Created
                          </Typography>
                          <Typography variant="body1">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Progress Stepper */}
                      <Box sx={{ mt: 3 }}>
                        <Stepper activeStep={steps.indexOf(booking.status) >= 0 ? steps.indexOf(booking.status) : 0} alternativeLabel>
                          {steps.map((label) => (
                            <Step key={label}>
                              <StepLabel>
                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                  {label.replace('_', ' ')}
                                </Typography>
                              </StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </Box>

                      {/* Points Message for Delivered Bookings */}
                      {booking.status === 'delivered' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                            <CheckCircleIcon fontSize="small" />
                            ✅ Successfully delivered! You earned 20 points for this pickup.
                          </Typography>
                          <Typography variant="caption" color="success.dark" sx={{ mt: 1, display: 'block' }}>
                            Points have been automatically added to your account. Click on "Your Points" card to redeem!
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

        </Box>
      </Container>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Book E-Waste Pickup</DialogTitle>
        <form onSubmit={handleBookingSubmit}>
          <DialogContent>
            {/* Image Upload Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Step 1: Upload Device Image
              </Typography>
              <ImageUpload 
                onImageValidated={handleImageValidated}
                disabled={false}
              />
            </Box>

            {/* Address Form Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Step 2: Pickup Details
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label="E-Waste Category"
                name="category"
                value={bookingForm.category}
                onChange={(e) => setBookingForm({ ...bookingForm, category: e.target.value })}
                required
                SelectProps={{ native: true }}
                helperText={imageClassification?.device_type ? 
                  `Auto-detected as ${imageClassification.device_type.replace('_', ' ').toUpperCase()} by AI` : 
                  'Select category or upload image for auto-detection'
                }
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: imageClassification?.device_type ? 'success.light' : 'inherit',
                    color: imageClassification?.device_type ? 'success.dark' : 'inherit'
                  }
                }}
              >
                <option value="">Select Category</option>
                <option value="smartphone">Smartphone</option>
                <option value="laptop">Laptop</option>
                <option value="battery">Battery</option>
                <option value="tablet">Tablet</option>
                <option value="other">Other</option>
              </TextField>
              <TextField
                fullWidth
                label="Device Model"
                name="device_model"
                value={bookingForm.device_model}
                onChange={(e) => setBookingForm({ ...bookingForm, device_model: e.target.value })}
                helperText={imageClassification?.device_model ? 
                  `Auto-detected as ${imageClassification.device_model} by AI` : 
                  'Device model will be auto-detected from image'
                }
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: imageClassification?.device_model ? 'success.light' : 'inherit',
                    color: imageClassification?.device_model ? 'success.dark' : 'inherit'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Apartment/Building Name"
                name="apartment_name"
                value={bookingForm.apartment_name}
                onChange={(e) => setBookingForm({ ...bookingForm, apartment_name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Street Number"
                name="street_number"
                value={bookingForm.street_number}
                onChange={(e) => setBookingForm({ ...bookingForm, street_number: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Area/Locality"
                name="area"
                value={bookingForm.area}
                onChange={(e) => setBookingForm({ ...bookingForm, area: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="State"
                name="state"
                value={bookingForm.state}
                onChange={(e) => setBookingForm({ ...bookingForm, state: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={bookingForm.pincode}
                onChange={(e) => setBookingForm({ ...bookingForm, pincode: e.target.value })}
                required
                inputProps={{ pattern: '[0-9]{6}' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!imageValidated}
            >
              {imageValidated ? 'Book Pickup' : 'Upload Image First'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Redeem Points Dialog */}
      <Dialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Points & Redemption</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Current Balance */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="h6" color="primary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon />
                Current Balance: <strong>{pointsBalance} points</strong>
              </Typography>
            </Box>

            {/* Points History */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Points History
              </Typography>
              {pointsHistory.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No points history available
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {pointsHistory.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        bgcolor: item.points_awarded > 0 ? 'success.light' : 'warning.light',
                        borderRadius: 1,
                        border: `1px solid ${item.points_awarded > 0 ? 'success.main' : 'warning.main'}`
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.points_awarded > 0 ? 'Earned' : 'Redeemed'}
                        </Typography>
                        <Typography variant="body2">
                          {item.points_awarded > 0 ? 'Delivery completed' : 'Gift card redemption'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="h6"
                          color={item.points_awarded > 0 ? 'success.dark' : 'warning.dark'}
                          fontWeight="bold"
                        >
                          {item.points_awarded > 0 ? '+' : ''}{item.points_awarded}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Redemption Form */}
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Redeem Points
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Minimum redemption: 60 points
              </Typography>
              <TextField
                fullWidth
                label="Points to Redeem"
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                inputProps={{ min: 60, max: pointsBalance }}
                helperText={`You will receive a gift card code for ${redeemAmount ? parseInt(redeemAmount) : 0} points`}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRedeemDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleRedeem}
            variant="contained"
            disabled={!redeemAmount || parseInt(redeemAmount) < 60 || parseInt(redeemAmount) > pointsBalance}
            startIcon={<StarIcon />}
          >
            Redeem Points
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;