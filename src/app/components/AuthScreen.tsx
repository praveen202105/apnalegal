import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import GavelIcon from '@mui/icons-material/Gavel';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { sendOtp, verifyOtp, setTokens, googleLogin } from '../../lib/api';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) return;
    setLoading(true);
    setError('');
    try {
      await sendOtp(phoneNumber);
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const { accessToken, refreshToken } = await verifyOtp(phoneNumber, otp);
      setTokens(accessToken, refreshToken);
      onAuthSuccess();
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const { accessToken, refreshToken } = await googleLogin(tokenResponse.access_token);
        setTokens(accessToken, refreshToken);
        onAuthSuccess();
        navigate('/');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google login failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 4,
        background: 'linear-gradient(180deg, #F5F5F5 0%, #E3F2FD 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <GavelIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ mb: 1 }}>Welcome to NyayAI</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Sign in to access your legal assistant
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {!otpSent ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Mobile Number</Typography>
                <TextField
                  fullWidth
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  InputProps={{
                    startAdornment: <PhoneAndroidIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'background.default' } }}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSendOtp}
                disabled={phoneNumber.length !== 10 || loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', px: 2 }}>OR</Typography>
              </Divider>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1.5,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: 'rgba(21, 101, 192, 0.04)' },
                }}
              >
                Continue with Google
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  OTP sent to +91 {phoneNumber}
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.default',
                      fontSize: '1.2rem',
                      letterSpacing: '0.5rem',
                    },
                  }}
                  inputProps={{ style: { textAlign: 'center' } }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Check the server console for the OTP (dev mode)
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
              </Button>

              <Button
                variant="text"
                size="small"
                onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                sx={{ color: 'text.secondary' }}
              >
                Change Number
              </Button>
            </Box>
          )}
        </Paper>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 3, px: 2 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </motion.div>
    </Box>
  );
}
