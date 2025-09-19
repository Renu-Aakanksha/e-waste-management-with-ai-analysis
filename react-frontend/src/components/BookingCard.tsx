import {
    Box,
    Card,
    CardContent,
    Typography
} from '@mui/material';
import React from 'react';
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

interface BookingCardProps {
  pickup: Pickup;
  getStatusChip: (pickup: Pickup) => React.ReactNode;
  styles: AdminDashboardStyles;
}

const BookingCard: React.FC<BookingCardProps> = ({
  pickup,
  getStatusChip,
  styles
}) => {
  const getBorderColor = () => {
    if (pickup.delivery_status) {
      switch (pickup.delivery_status) {
        case 'delivered': return styles.borderColors.delivered;
        case 'picked_up': return styles.borderColors.pickedUp;
        case 'assigned': return styles.borderColors.assigned;
        default: return styles.borderColors.unassigned;
      }
    } else if (pickup.delivery_guy) return styles.borderColors.assigned;
    else if (pickup.scheduled) return styles.borderColors.pickedUp;
    return styles.borderColors.unassigned;
  };

  return (
    <Card
      sx={{
        ...styles.bookingCard,
        borderLeft: `4px solid ${getBorderColor()}`,
      }}
    >
      <CardContent>
        <Box sx={styles.bookingCardHeader}>
          <Typography variant="h6" fontWeight="bold">
            Pickup #{pickup.id} {pickup.scheduled ? '✅' : '⏳'}
          </Typography>
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
      </CardContent>
    </Card>
  );
};

export default BookingCard;
