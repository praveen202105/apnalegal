import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LawyerLayout from './components/LawyerLayout';
import MyCases from './pages/MyCases';
import Earnings from './pages/Earnings';

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

// Mock Login for now
function Login() {
  const [otp, setOtp] = useState('');
  
  const handleLogin = () => {
    if (otp === '123456') {
      localStorage.setItem('lawyerToken', 'mock-lawyer-token');
      window.location.href = '/';
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002B5B' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '360px' }}>
        <h2 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>NyayAI Lawyer</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Partner Portal Login</p>
        <input 
          placeholder="Registered Phone Number" 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <input 
          placeholder="OTP (Use 123456)" 
          style={{ width: '100%', padding: '12px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #ddd' }}
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
