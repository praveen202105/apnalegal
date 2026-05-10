import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useGoogleLogin } from '@react-oauth/google';
import CssBaseline from '@mui/material/CssBaseline';
import LawyerLayout from './components/LawyerLayout';
import MyCases from './pages/MyCases';
import Earnings from './pages/Earnings';
import { lawyerApi } from './api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#002B5B',
      dark: '#001C3D',
      light: '#256D85',
    },
    background: {
      default: '#F4F7F6',
    },
    warning: {
      main: '#FFD369',
    }
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
  const token = localStorage.getItem('lawyerToken');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function Login() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLoginSuccess = (token: string, role: string) => {
    if (role !== 'lawyer') {
      setError('Access Denied: Your account is not registered as a lawyer partner.');
      return;
    }
    localStorage.setItem('lawyerToken', token);
    window.location.href = '/';
  };

  const handleLogin = () => {
    if (otp === '123456') {
      localStorage.setItem('lawyerToken', 'mock-lawyer-token');
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
        const res = await lawyerApi.googleLogin(tokenResponse.access_token);
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002B5B' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: '0 0 10px 0', textAlign: 'center', fontWeight: 800, color: '#002B5B' }}>NyayAI Lawyer</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Partner Portal Login</p>
        
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
              Login with Google
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#999' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.8rem' }}>OR PHONE LOGIN</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
        </div>

        <input 
          placeholder="Registered Phone Number" 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <input 
          placeholder="OTP (Use 123456)" 
          style={{ width: '100%', padding: '12px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          onChange={e => setOtp(e.target.value)}
        />
        <button 
          onClick={handleLogin}
          style={{ width: '100%', padding: '14px', background: '#002B5B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Login to Dashboard
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
          <Route path="/" element={<PrivateRoute><LawyerLayout /></PrivateRoute>}>
            <Route index element={<MyCases />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="profile" element={<div style={{ padding: '20px' }}><h3>My Profile (Upcoming)</h3></div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
