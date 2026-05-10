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
    primary: { main: '#1565C0', dark: '#0D47A1', light: '#42a5f5' },
    background: { default: '#F8F9FA' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  shape: { borderRadius: 12 },
  components: { MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } } },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('adminToken');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  boxSizing: 'border-box',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'Inter, sans-serif',
};

function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handlePasswordLogin = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true); setError('');
    try {
      const res = await adminApi.loginPassword(email, password);
      handleLoginSuccess(res.data.accessToken, res.data.user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Please fill all fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await adminApi.register({ name, email, password, role: 'admin' });
      handleLoginSuccess(res.data.accessToken, res.data.user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('');
      try {
        const res = await adminApi.googleLogin(tokenResponse.access_token);
        handleLoginSuccess(res.data.accessToken, res.data.user.role);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Google login failed.');
      } finally { setLoading(false); }
    },
    onError: () => setError('Google Login Failed'),
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '48px', height: '48px', background: '#1565C0', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'white', fontSize: '22px' }}>⚖️</span>
          </div>
          <h2 style={{ margin: 0, fontWeight: 800, color: '#1a1a1a', fontSize: '1.5rem' }}>NyayAI Admin</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>Management Portal</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setMode(tab); setError(''); }}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
                background: mode === tab ? 'white' : 'transparent',
                color: mode === tab ? '#1565C0' : '#888',
                boxShadow: mode === tab ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Email / Password Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <input
              id="admin-name"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            id="admin-email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            id="admin-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && mode === 'login' && handlePasswordLogin()}
            style={inputStyle}
          />
          {mode === 'register' && (
            <input
              id="admin-confirm-password"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              style={inputStyle}
            />
          )}
          <button
            id="admin-submit-btn"
            onClick={mode === 'login' ? handlePasswordLogin : handleRegister}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', background: loading ? '#90CAF9' : '#1565C0',
              color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#bbb', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          <span style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        </div>

        {/* Google Login (optional) */}
        <button
          id="admin-google-btn"
          onClick={() => googleLogin()}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', background: 'white', color: '#444',
            border: '1px solid #ddd', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
          Continue with Google
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
