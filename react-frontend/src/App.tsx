import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import {
    LazyAdminDashboard,
    LazyDeliveryDashboard,
    LazyPointsPage,
    LazyUserDashboard,
    LazyWrapper
} from './components/LazyComponents';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import Login from './pages/Login';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF6F00',
      light: '#FF9800',
      dark: '#E65100',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RealTimeProvider>
          <Router>
            <div className="App">
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/user" 
                element={
                  <ProtectedRoute role="user">
                    <LazyWrapper>
                      <LazyUserDashboard />
                    </LazyWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute role="admin">
                    <LazyWrapper>
                      <LazyAdminDashboard />
                    </LazyWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/delivery" 
                element={
                  <ProtectedRoute role="delivery">
                    <LazyWrapper>
                      <LazyDeliveryDashboard />
                    </LazyWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/points" 
                element={
                  <ProtectedRoute role="user">
                    <LazyWrapper>
                      <LazyPointsPage />
                    </LazyWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            </div>
          </Router>
        </RealTimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;