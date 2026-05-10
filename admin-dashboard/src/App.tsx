import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useGoogleLogin } from '@react-oauth/google';
import AdminLayout from './components/AdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import ConsultationQueue from './pages/ConsultationQueue';
import LawyerManagement from './pages/LawyerManagement';
import { adminApi } from './api';

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

function Login() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLoginSuccess = (token: string, role: string) => {
    if (role !== 'admin') {
      setError('Access Denied: You do not have administrator privileges.');
      return;
    }
    localStorage.setItem('adminToken', token);
    window.location.href = '/';
  };

  const handleLogin = () => {
    if (otp === '123456') {
      localStorage.setItem('adminToken', 'mock-admin-token');
      window.location.href = '/';
    } else {
      setError('Invalid OTP');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.googleLogin(tokenResponse.access_token);
        handleLoginSuccess(res.data.accessToken, res.data.user.role);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Google login failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1565C0' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 10px 0', textAlign: 'center', fontWeight: 800 }}>NyayAI Admin</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Management Portal Access</p>
        
        {error && (
          <div style={{ padding: '12px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button 
          onClick={() => googleLogin()}
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: 'white', 
            color: '#444', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            fontWeight: 600, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          {loading ? 'Processing...' : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
              Continue with Google
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#999' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.8rem' }}>OR PHONE LOGIN</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
        </div>

        <input 
          placeholder="Phone Number" 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <input 
          placeholder="OTP (Use 123456)" 
          style={{ width: '100%', padding: '12px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          onChange={e => setOtp(e.target.value)}
        />
        <button 
          onClick={handleLogin}
          style={{ width: '100%', padding: '14px', background: '#1565C0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Login with OTP
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
