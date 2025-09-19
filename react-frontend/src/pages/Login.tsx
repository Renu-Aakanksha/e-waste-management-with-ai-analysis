import {
    Nature as EcoIcon,
    Login as LoginIcon,
    Recycling as RecyclingIcon,
    PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Fade,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Login: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'user' ? '/user' : 
                          user.role === 'admin' ? '/admin' : '/delivery';
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(formData.username, formData.password, formData.role);
    
    if (success) {
      const redirectPath = formData.role === 'user' ? '/user' : 
                          formData.role === 'admin' ? '/admin' : '/delivery';
      navigate(redirectPath);
    } else {
      setError('Invalid credentials or role mismatch');
    }
    
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await register(formData.username, formData.password, formData.role);
    
    if (success) {
      setSuccess('Registration successful! Please login.');
      setTabValue(0);
      setFormData({ username: '', password: '', role: 'user' });
    } else {
      setError('Registration failed. Username might already exist.');
    }
    
    setLoading(false);
  };

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123', color: 'error' as const },
    { role: 'Delivery', username: 'delivery1', password: 'delivery123', color: 'warning' as const },
    { role: 'User', username: 'user1', password: 'user123', color: 'success' as const },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <EcoIcon sx={{ fontSize: 48, mr: 1 }} />
                <RecyclingIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Smart E-Waste Platform
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                Transforming Waste into Renewable Energy
              </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab
                  icon={<LoginIcon />}
                  label="Login"
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
                <Tab
                  icon={<RegisterIcon />}
                  label="Register"
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              </Tabs>
            </Box>

            {/* Login Form */}
            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="user">User</option>
                  <option value="delivery">Delivery Partner</option>
                  <option value="admin">Administrator</option>
                </TextField>
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </form>
            </TabPanel>

            {/* Register Form */}
            <TabPanel value={tabValue} index={1}>
              <form onSubmit={handleRegister}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="user">User</option>
                  <option value="delivery">Delivery Partner</option>
                </TextField>
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </form>
            </TabPanel>

            {/* Demo Credentials */}
            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom textAlign="center">
                Demo Credentials
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {demoCredentials.map((cred, index) => (
                  <Card key={index} sx={{ minWidth: 120 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle2" color={`${cred.color}.main`} fontWeight="bold">
                        {cred.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cred.username} / {cred.password}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;