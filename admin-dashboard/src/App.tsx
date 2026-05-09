import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminLayout from './components/AdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import ConsultationQueue from './pages/ConsultationQueue';
import LawyerManagement from './pages/LawyerManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      dark: '#0D47A1',
      light: '#42a5f5',
    },
    background: {
      default: '#F8F9FA',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('adminToken');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

// Mock Login for now (using Admin ID from seed)
function Login() {
  const [otp, setOtp] = useState('');
  
  const handleLogin = () => {
    // For demo/dev, any valid phone + 123456
    if (otp === '123456') {
      localStorage.setItem('adminToken', 'mock-admin-token');
      window.location.href = '/';
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1565C0' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '360px' }}>
        <h2 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>NyayAI Admin</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Dashboard Login</p>
        <input 
          placeholder="Phone Number" 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <input 
          placeholder="OTP (Use 123456)" 
          style={{ width: '100%', padding: '12px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #ddd' }}
          onChange={e => setOtp(e.target.value)}
        />
        <button 
          onClick={handleLogin}
          style={{ width: '100%', padding: '14px', background: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="requests" element={<ConsultationQueue />} />
            <Route path="lawyers" element={<LawyerManagement />} />
            <Route path="finance" element={<div style={{ padding: '20px' }}><h3>Financial Analytics (Upcoming)</h3></div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
