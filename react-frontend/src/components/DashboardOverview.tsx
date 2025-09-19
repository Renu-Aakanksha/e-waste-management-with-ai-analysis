import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    PersonAdd as PersonAddIcon,
    Route as RouteIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Fade,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import React from 'react';
import { AdminDashboardStyles } from '../pages/AdminDashboard.styles';
import BookingCard from './BookingCard';

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

interface Route {
  id: number;
  name: string;
  area: string;
  created_at: string;
}

interface DeliveryGuy {
  id: number;
  username: string;
  created_at: string;
}

interface DashboardData {
  total_bookings: number;
  ev_battery_units: number;
  solar_panel_units: number;
}

interface DashboardOverviewProps {
  dashboardData: DashboardData | null;
  routes: Route[];
  deliveryGuys: DeliveryGuy[];
  pickups: Pickup[];
  getStatusChip: (pickup: Pickup) => React.ReactNode;
  onCreateRoute: () => void;
  onCreateDeliveryPartner: () => void;
  styles: AdminDashboardStyles;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  dashboardData,
  routes,
  deliveryGuys,
  pickups,
  getStatusChip,
  onCreateRoute,
  onCreateDeliveryPartner,
  styles
}) => {
  const assignedPickups = pickups.filter(p => p.delivery_guy && p.delivery_status === 'assigned');
  const pickedUpPickups = pickups.filter(p => p.delivery_status === 'picked_up');
  const deliveredPickups = pickups.filter(p => p.delivery_status === 'delivered');

  return (
    <Fade in timeout={600}>
      <Box>
        <Box sx={styles.dashboardOverviewGrid}>
          {/* Active Routes Table */}
          <Paper sx={{ p: 3 }}>
            <Box sx={styles.sectionHeader}>
              <Typography variant="h6" fontWeight="bold">Active Routes</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateRoute}
                size="small"
              >
                Add Route
              </Button>
            </Box>
            {routes.length === 0 ? (
              <Box sx={styles.emptyState}>
                <RouteIcon sx={styles.emptyStateIcon} />
                <Typography color="text.secondary">No routes found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Route Name</TableCell>
                      <TableCell>Area</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {route.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={route.area} color="info" size="small" />
                        </TableCell>
                        <TableCell>{new Date(route.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Delivery Partners Table */}
          <Paper sx={{ p: 3 }}>
            <Box sx={styles.sectionHeader}>
              <Typography variant="h6" fontWeight="bold">Delivery Partners</Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={onCreateDeliveryPartner}
                size="small"
              >
                Add Partner
              </Button>
            </Box>
            {deliveryGuys.length === 0 ? (
              <Box sx={styles.emptyState}>
                <PersonAddIcon sx={styles.emptyStateIcon} />
                <Typography color="text.secondary">No delivery partners found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Assigned Pickups</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryGuys.map((guy) => {
                      const assignedPickups = pickups.filter(p => p.delivery_guy === guy.username && p.delivery_status === 'assigned');
                      const isAvailable = assignedPickups.length === 0;
                      
                      return (
                        <TableRow key={guy.id}>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {guy.username}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={isAvailable ? 'Available' : 'Busy'} 
                              color={isAvailable ? 'success' : 'warning'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color={isAvailable ? 'text.secondary' : 'warning.main'}>
                              {assignedPickups.length} pickup{assignedPickups.length !== 1 ? 's' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>{new Date(guy.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>

        {/* All Bookings in Order */}
        <Paper sx={{ p: 3 }}>
          {pickups.length === 0 ? (
            <Box sx={styles.emptyState}>
              <AssignmentIcon sx={styles.emptyStateIcon} />
              <Typography color="text.secondary">No pickups found</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Assigned pickups */}
              {assignedPickups.map((pickup) => (
                <BookingCard
                  key={pickup.id}
                  pickup={pickup}
                  getStatusChip={getStatusChip}
                  styles={styles}
                />
              ))}

              {/* Picked up pickups */}
              {pickedUpPickups.map((pickup) => (
                <BookingCard
                  key={pickup.id}
                  pickup={pickup}
                  getStatusChip={getStatusChip}
                  styles={styles}
                />
              ))}

              {/* Delivered pickups */}
              {deliveredPickups.map((pickup) => (
                <BookingCard
                  key={pickup.id}
                  pickup={pickup}
                  getStatusChip={getStatusChip}
                  styles={styles}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export default DashboardOverview;
