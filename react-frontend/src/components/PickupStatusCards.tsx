import {
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    LocalShipping as ShippingIcon
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Fade,
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

interface PickupStatusCardsProps {
  pickups: Pickup[];
  activeFilter: string;
  activeSection: string;
  onCardClick: (filter: 'unassigned' | 'assigned' | 'picked_up' | 'delivered') => void;
  styles: AdminDashboardStyles;
}

const PickupStatusCards: React.FC<PickupStatusCardsProps> = ({
  pickups,
  activeFilter,
  activeSection,
  onCardClick,
  styles
}) => {
  const getCardProps = (filter: string, color: string) => ({
    ...styles.card,
    border: (activeFilter === filter && activeSection === 'none') ? `2px solid ${color}` : '2px solid transparent',
  });

  return (
    <Fade in timeout={800}>
      <Box sx={styles.pickupCardsGrid}>
        <Card 
          sx={getCardProps('unassigned', styles.borderColors.unassigned)}
          onClick={() => onCardClick('unassigned')}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <PendingIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {pickups.filter(p => !p.delivery_guy).length}
            </Typography>
            <Typography color="text.secondary">To Be Assigned</Typography>
          </CardContent>
        </Card>

        <Card 
          sx={getCardProps('assigned', styles.borderColors.assigned)}
          onClick={() => onCardClick('assigned')}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <AssignmentIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {pickups.filter(p => p.delivery_guy && p.delivery_status === 'assigned').length}
            </Typography>
            <Typography color="text.secondary">Partner Assigned</Typography>
          </CardContent>
        </Card>

        <Card 
          sx={getCardProps('picked_up', styles.borderColors.pickedUp)}
          onClick={() => onCardClick('picked_up')}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <ShippingIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {pickups.filter(p => p.delivery_status === 'picked_up').length}
            </Typography>
            <Typography color="text.secondary">Pending Pick Ups</Typography>
          </CardContent>
        </Card>

        <Card 
          sx={getCardProps('delivered', styles.borderColors.delivered)}
          onClick={() => onCardClick('delivered')}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {pickups.filter(p => p.delivery_status === 'delivered').length}
            </Typography>
            <Typography color="text.secondary">Delivered</Typography>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default PickupStatusCards;
