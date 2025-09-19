import { Theme } from '@mui/material/styles';

export const createAdminDashboardStyles = (theme: Theme) => ({
  // Main container styles
  mainContainer: {
    flexGrow: 1,
    minHeight: '100vh',
    bgcolor: 'grey.50'
  },

  // Header styles
  header: {
    position: 'static' as const,
    className: 'admin-dashboard-header'
  },

  // Dashboard stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
    gap: 3,
    mb: 4
  },

  // Pickup status cards grid
  pickupCardsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
    gap: 3,
    mb: 4
  },

  // Management sections grid
  managementGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
    gap: 4,
    mb: 4
  },

  // Card styles
  card: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: 6,
      transform: 'translateY(-2px)'
    }
  },

  // Dashboard overview grid
  dashboardOverviewGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
    gap: 4,
    mb: 4
  },

  // Overview cards grid
  overviewCardsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
    gap: 3,
    mb: 4
  },

  // Pickup status summary grid
  pickupStatusSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
    gap: 3,
    mb: 4
  },

  // Delivery partners summary grid
  deliveryPartnersSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
    gap: 3
  },

  // Booking card styles
  bookingCard: {
    '&:hover': { boxShadow: 4 }
  },

  // Booking card header
  bookingCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2
  },

  // Booking card details grid
  bookingCardDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
    gap: 2,
    mb: 3
  },

  // Status chip styles
  statusChip: {
    fontWeight: 'bold',
    fontSize: '0.7rem'
  },

  // Empty state styles
  emptyState: {
    textAlign: 'center',
    py: 4
  },

  emptyStateIcon: {
    fontSize: 64,
    color: 'text.secondary',
    mb: 2
  },

  // Action buttons container
  actionButtonsContainer: {
    display: 'flex',
    gap: 2,
    mb: 4,
    flexWrap: 'wrap'
  },

  // Refresh button
  refreshButton: {
    px: 4
  },

  // Auto refresh chip
  autoRefreshChip: {
    icon: { /* Icon will be passed as component */ },
    label: 'Auto-refreshing every 3s',
    color: 'info' as const,
    variant: 'outlined' as const
  },

  // Section headers
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3
  },

  // Table container
  tableContainer: {
    /* TableContainer styles */
  },

  // Table styles
  table: {
    /* Table styles */
  },

  // Table head
  tableHead: {
    /* TableHead styles */
  },

  // Table row
  tableRow: {
    /* TableRow styles */
  },

  // Table cell
  tableCell: {
    /* TableCell styles */
  },

  // Delivery partner status chip
  deliveryPartnerStatusChip: {
    label: (isAvailable: boolean) => isAvailable ? 'Available' : 'Busy',
    color: (isAvailable: boolean) => isAvailable ? 'success' : 'warning',
    size: 'small' as const
  },

  // Assigned pickup info
  assignedPickupInfo: {
    mt: 2,
    p: 2,
    bgcolor: 'success.light',
    borderRadius: 1
  },

  // Border colors for different statuses
  borderColors: {
    assigned: theme.palette.warning.main,
    pickedUp: theme.palette.info.main,
    delivered: theme.palette.success.main,
    unassigned: theme.palette.error.main
  },

  // Background colors for different statuses
  backgroundColors: {
    assigned: `${theme.palette.warning.light}20`,
    pickedUp: `${theme.palette.info.light}20`,
    delivered: `${theme.palette.success.light}20`,
    unassigned: `${theme.palette.error.light}20`
  }
});

export type AdminDashboardStyles = ReturnType<typeof createAdminDashboardStyles>;

