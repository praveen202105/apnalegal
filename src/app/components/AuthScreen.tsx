import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import GavelIcon from '@mui/icons-material/Gavel';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (phoneNumber.length === 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      onAuthSuccess();
      navigate('/');
    }
  };

  const handleGoogleLogin = () => {
    onAuthSuccess();
    navigate('/');
  };

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
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

          <Typography variant="h5" sx={{ mb: 1 }}>
            Welcome to NyayAI
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Sign in to access your legal assistant
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {!otpSent ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Mobile Number
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{
                    startAdornment: (
                      <PhoneAndroidIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.default',
                    },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSendOtp}
                disabled={phoneNumber.length !== 10}
                sx={{ py: 1.5 }}
              >
                Send OTP
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', px: 2 }}>
                  OR
                </Typography>
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
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(21, 101, 192, 0.04)',
                  },
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.default',
                      fontSize: '1.2rem',
                      letterSpacing: '0.5rem',
                      textAlign: 'center',
                    },
                  }}
                  inputProps={{
                    style: { textAlign: 'center' },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6}
                sx={{ py: 1.5 }}
              >
                Verify & Continue
              </Button>

              <Button
                variant="text"
                size="small"
                onClick={() => setOtpSent(false)}
                sx={{ color: 'text.secondary' }}
              >
                Change Number
              </Button>
            </Box>
          )}
        </Paper>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
            mt: 3,
            px: 2,
          }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </motion.div>
    </Box>
  );
}
