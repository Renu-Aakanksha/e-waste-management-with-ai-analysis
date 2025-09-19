import {
    ArrowBack as ArrowBackIcon,
    Nature as EcoIcon,
    History as HistoryIcon,
    Redeem as RedeemIcon,
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography,
    useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pointsAPI } from '../services/api';

interface PointsHistory {
  id: number;
  points: number;
  description: string;
  created_at: string;
  type: 'earned' | 'redeemed';
}

const PointsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState<string>('');

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    try {
      const [balanceResponse, historyResponse] = await Promise.all([
        pointsAPI.getBalance(),
        pointsAPI.getHistory()
      ]);
      setBalance(balanceResponse.data.balance);
      setHistory(historyResponse.data);
    } catch (err) {
      console.error('Error loading points data:', err);
      setError('Failed to load points data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    try {
      const amount = parseInt(redeemAmount);
      if (amount > balance) {
        setError('Insufficient points balance');
        return;
      }
      
      await pointsAPI.redeemPoints(amount);
      setRedeemDialogOpen(false);
      setRedeemAmount('');
      loadPointsData();
    } catch (err) {
      setError('Failed to redeem points');
    }
  };

  const getTypeChip = (type: string) => {
    return type === 'earned' ? (
      <Chip label="Earned" color="success" size="small" />
    ) : (
      <Chip label="Redeemed" color="warning" size="small" />
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'earned' ? theme.palette.success.main : theme.palette.warning.main;
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
          <IconButton color="inherit" onClick={() => navigate('/user-dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <EcoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Points & Rewards
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Points Balance Card */}
        <Fade in timeout={600}>
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <StarIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
              <Typography variant="h2" fontWeight="bold" gutterBottom>
                {balance.toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                Points Balance
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<RedeemIcon />}
                onClick={() => setRedeemDialogOpen(true)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Redeem Points
              </Button>
            </CardContent>
          </Card>
        </Fade>

        {/* Quick Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EcoIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {history.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.points, 0).toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Total Earned</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RedeemIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {history.filter(h => h.type === 'redeemed').reduce((sum, h) => sum + h.points, 0).toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Total Redeemed</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HistoryIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {history.length}
              </Typography>
              <Typography color="text.secondary">Total Transactions</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Points History */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Points History
            </Typography>
            <Chip
              icon={<HistoryIcon />}
              label={`${history.length} transactions`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No points history yet
              </Typography>
              <Typography color="text.secondary">
                Start earning points by booking e-waste pickups
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {getTypeChip(item.type)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={getTypeColor(item.type)}
                        >
                          {item.type === 'earned' ? '+' : '-'}{item.points?.toLocaleString() || '0'}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Redeem Dialog */}
      <Dialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Redeem Points</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Current Balance: <strong>{balance?.toLocaleString() || '0'} points</strong>
            </Typography>
            <TextField
              fullWidth
              label="Points to Redeem"
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              inputProps={{ min: 1, max: balance }}
              helperText={`Maximum: ${balance.toLocaleString()} points`}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRedeemDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRedeem}
            variant="contained"
            startIcon={<RedeemIcon />}
            disabled={!redeemAmount || parseInt(redeemAmount) <= 0 || parseInt(redeemAmount) > balance}
          >
            Redeem
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PointsPage;