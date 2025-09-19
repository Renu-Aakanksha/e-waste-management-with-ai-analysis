import {
    Assignment as AssignmentIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { AdminDashboardStyles } from '../pages/AdminDashboard.styles';

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

interface PickupManagementProps {
  pickups: Pickup[];
  deliveryGuys: DeliveryGuy[];
  activeFilter: string;
  onCardClick: (filter: 'unassigned' | 'assigned' | 'picked_up' | 'delivered') => void;
  onAssignDelivery: (pickupId: number, deliveryGuyId: string) => void;
  getStatusChip: (pickup: Pickup) => React.ReactNode;
  getFilteredPickups: () => Pickup[];
  styles: AdminDashboardStyles;
}

const PickupManagement: React.FC<PickupManagementProps> = ({
  pickups,
  deliveryGuys,
  activeFilter,
  onCardClick,
  onAssignDelivery,
  getStatusChip,
  getFilteredPickups,
  styles
}) => {
  const filteredPickups = getFilteredPickups();
  
  // Individual delivery guy selection state for each pickup
  const [selectedDeliveryGuys, setSelectedDeliveryGuys] = useState<{[pickupId: number]: string}>({});
  
  const handleDeliveryGuyChange = (pickupId: number, value: string) => {
    setSelectedDeliveryGuys(prev => ({
      ...prev,
      [pickupId]: value
    }));
  };
  
  const handleAssignDelivery = (pickupId: number) => {
    const selectedGuy = selectedDeliveryGuys[pickupId];
    if (selectedGuy) {
      onAssignDelivery(pickupId, selectedGuy);
      // Clear the selection for this pickup after assignment
      setSelectedDeliveryGuys(prev => ({
        ...prev,
        [pickupId]: ''
      }));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={styles.sectionHeader}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Pickup Management
            {activeFilter !== 'all' && ` - ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1).replace('_', ' ')}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeFilter === 'all' ? 'Unassigned pickups appear first' : `Showing ${filteredPickups.length} ${activeFilter.replace('_', ' ')} pickup${filteredPickups.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <Chip
          icon={<RefreshIcon />}
          label="Auto-refreshing every 3s"
          color="info"
          variant="outlined"
        />
      </Box>

      {filteredPickups.length === 0 ? (
        <Box sx={styles.emptyState}>
          <AssignmentIcon sx={styles.emptyStateIcon} />
          <Typography color="text.secondary">
            {activeFilter === 'all' && 'No pickups found'}
            {activeFilter === 'unassigned' && 'No unassigned pickups'}
            {activeFilter === 'assigned' && 'No assigned pickups'}
            {activeFilter === 'picked_up' && 'No picked up deliveries'}
            {activeFilter === 'delivered' && 'No delivered pickups'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredPickups.map((pickup) => (
            <Card
              key={pickup.id}
              sx={{
                borderLeft: `4px solid ${pickup.delivery_guy ? styles.borderColors.assigned : styles.borderColors.unassigned}`,
                '&:hover': { boxShadow: 4 },
              }}
            >
              <CardContent>
                <Box sx={styles.bookingCardHeader}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Pickup #{pickup.id} {pickup.scheduled ? '✅' : '⏳'}
                    </Typography>
                    {!pickup.delivery_guy && (
                      <Chip 
                        label="UNASSIGNED" 
                        color="error" 
                        size="small" 
                        sx={styles.statusChip}
                      />
                    )}
                  </Box>
                  {getStatusChip(pickup)}
                </Box>
                
                <Box sx={styles.bookingCardDetailsGrid}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1" fontWeight="medium">{pickup.customer_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Category</Typography>
                    <Typography variant="body1">{pickup.category}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">
                      {pickup.apartment_name}, {pickup.street_number}, {pickup.area}, {pickup.state} - {pickup.pincode}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Route ID</Typography>
                    <Typography variant="body1">{pickup.route_id || 'Not scheduled'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Delivery Guy</Typography>
                    <Typography variant="body1">{pickup.delivery_guy || 'Not assigned'}</Typography>
                  </Box>
                </Box>

                {!pickup.delivery_guy && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      select
                      label="Assign Delivery Guy"
                      value={selectedDeliveryGuys[pickup.id] || ''}
                      onChange={(e) => handleDeliveryGuyChange(pickup.id, e.target.value)}
                      size="small"
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="">Select Delivery Guy</MenuItem>
                      {deliveryGuys.map((guy) => (
                        <MenuItem key={guy.id} value={guy.id}>
                          {guy.username}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAssignDelivery(pickup.id)}
                      disabled={!selectedDeliveryGuys[pickup.id]}
                    >
                      Assign
                    </Button>
                  </Box>
                )}
                {pickup.delivery_guy && (
                  <Box sx={styles.assignedPickupInfo}>
                    <Typography variant="body2" color="success.dark">
                      ✅ Assigned to: {pickup.delivery_guy}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default PickupManagement;
