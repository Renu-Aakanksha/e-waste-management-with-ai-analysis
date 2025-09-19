import {
    Add as AddIcon,
    Nature as EcoIcon,
    PersonAdd as PersonAddIcon,
    Route as RouteIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
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

interface DashboardData {
  total_bookings: number;
  ev_battery_units: number;
  solar_panel_units: number;
}

interface ManagementSectionsProps {
  activeSection: string;
  routes: Route[];
  deliveryGuys: DeliveryGuy[];
  pickups: Pickup[];
  dashboardData: DashboardData | null;
  onCreateRoute: () => void;
  onCreateDeliveryPartner: () => void;
  styles: AdminDashboardStyles;
}

const ManagementSections: React.FC<ManagementSectionsProps> = ({
  activeSection,
  routes,
  deliveryGuys,
  pickups,
  dashboardData,
  onCreateRoute,
  onCreateDeliveryPartner,
  styles
}) => {
  if (activeSection === 'none' || activeSection === 'dashboard') return null;

  return (
    <Fade in timeout={600}>
      <Box sx={styles.managementGrid}>
        {/* Routes Management */}
        {activeSection === 'routes' && (
          <Paper sx={{ p: 3 }}>
            <Box sx={styles.sectionHeader}>
              <Typography variant="h6" fontWeight="bold">Route Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateRoute}
                size="small"
              >
                Add Route
              </Button>
            </Box>
            
            {/* EV Batteries and Solar Panels Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EcoIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {dashboardData?.ev_battery_units || 0}
                  </Typography>
                  <Typography color="text.secondary">EV Batteries</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EcoIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {dashboardData?.solar_panel_units || 0}
                  </Typography>
                  <Typography color="text.secondary">Solar Panels</Typography>
                </CardContent>
              </Card>
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
        )}

        {/* Delivery Partners Management */}
        {activeSection === 'deliveryPartners' && (
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
            
            {/* EV Batteries and Solar Panels Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EcoIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {dashboardData?.ev_battery_units || 0}
                  </Typography>
                  <Typography color="text.secondary">EV Batteries</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EcoIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {dashboardData?.solar_panel_units || 0}
                  </Typography>
                  <Typography color="text.secondary">Solar Panels</Typography>
                </CardContent>
              </Card>
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
        )}
      </Box>
    </Fade>
  );
};

export default ManagementSections;
