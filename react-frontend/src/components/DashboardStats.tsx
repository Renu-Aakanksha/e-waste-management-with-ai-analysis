import {
    PersonAdd as PersonAddIcon,
    Recycling as RecyclingIcon,
    Route as RouteIcon
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

interface DashboardData {
  total_bookings: number;
  ev_battery_units: number;
  solar_panel_units: number;
}

interface DashboardStatsProps {
  dashboardData: DashboardData | null;
  routesCount: number;
  deliveryGuysCount: number;
  activeSection: string;
  onDashboardClick: () => void;
  onRoutesClick: () => void;
  onDeliveryPartnersClick: () => void;
  styles: AdminDashboardStyles;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  dashboardData,
  routesCount,
  deliveryGuysCount,
  activeSection,
  onDashboardClick,
  onRoutesClick,
  onDeliveryPartnersClick,
  styles
}) => {
  if (!dashboardData) return null;

  return (
    <Fade in timeout={600}>
      <Box sx={styles.statsGrid}>
        <Card 
          sx={{
            ...styles.card,
            border: (activeSection === 'dashboard') ? `2px solid ${styles.borderColors.assigned}` : '2px solid transparent',
          }}
          onClick={onDashboardClick}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <RecyclingIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="primary" fontWeight="bold">
              {dashboardData.total_bookings}
            </Typography>
            <Typography color="text.secondary">
              Dashboard {activeSection === 'dashboard' && '🔽'}
            </Typography>
          </CardContent>
        </Card>

        <Card 
          sx={{
            ...styles.card,
            border: (activeSection === 'routes') ? `2px solid ${styles.borderColors.pickedUp}` : '2px solid transparent',
          }}
          onClick={onRoutesClick}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <RouteIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {routesCount}
            </Typography>
            <Typography color="text.secondary">
              Active Routes {activeSection === 'routes' && '🔽'}
            </Typography>
          </CardContent>
        </Card>

        <Card 
          sx={{
            ...styles.card,
            border: (activeSection === 'deliveryPartners') ? `2px solid ${styles.borderColors.pickedUp}` : '2px solid transparent',
          }}
          onClick={onDeliveryPartnersClick}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonAddIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {deliveryGuysCount}
            </Typography>
            <Typography color="text.secondary">
              Delivery Partners {activeSection === 'deliveryPartners' && '🔽'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default DashboardStats;
