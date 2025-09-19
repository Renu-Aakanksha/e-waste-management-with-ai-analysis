import {
    Box,
    Card,
    CardContent,
    Chip,
    Typography
} from '@mui/material';
import React, { memo } from 'react';

interface BookingCardProps {
  booking: {
    id: number;
    customer_name: string;
    category: string;
    device_model?: string;
    apartment_name: string;
    street_number: string;
    area: string;
    state: string;
    pincode: string;
    status: string;
    created_at: string;
  };
  onStatusUpdate?: (id: number, status: string) => void;
}

const OptimizedBookingCard: React.FC<BookingCardProps> = memo(({ booking, onStatusUpdate }) => {
  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning' as const },
      scheduled: { label: 'Scheduled', color: 'info' as const },
      assigned: { label: 'Assigned', color: 'primary' as const },
      picked_up: { label: 'Picked Up', color: 'secondary' as const },
      delivered: { label: 'Delivered', color: 'success' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      color: 'default' as const 
    };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const getBorderColor = (status: string) => {
    const colorMap = {
      pending: '#ff9800',
      scheduled: '#2196f3',
      assigned: '#9c27b0',
      picked_up: '#673ab7',
      delivered: '#4caf50'
    };
    return colorMap[status as keyof typeof colorMap] || '#e0e0e0';
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: `4px solid ${getBorderColor(booking.status)}`,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Booking #{booking.id}
          </Typography>
          {getStatusChip(booking.status)}
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Customer</Typography>
            <Typography variant="body1" fontWeight="medium">{booking.customer_name}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Category</Typography>
            <Typography variant="body1">{booking.category}</Typography>
          </Box>
          {booking.device_model && (
            <Box>
              <Typography variant="body2" color="text.secondary">Device Model</Typography>
              <Typography variant="body1" color="primary" fontWeight="medium">
                {booking.device_model}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="body2" color="text.secondary">Address</Typography>
            <Typography variant="body1">
              {booking.apartment_name}, {booking.street_number}, {booking.area}, {booking.state} - {booking.pincode}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Created</Typography>
            <Typography variant="body1">
              {new Date(booking.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

OptimizedBookingCard.displayName = 'OptimizedBookingCard';

export default OptimizedBookingCard;

