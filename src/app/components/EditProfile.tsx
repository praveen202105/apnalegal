import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Snackbar,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getMe, updateMe } from '../../lib/api';

export default function EditProfile() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    getMe()
      .then((u) => { setName(u.name || ''); setEmail(u.email || ''); setPhone(u.phone || ''); })
      .catch(() => setSnackbar({ open: true, message: 'Failed to load profile' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMe({ name: name.trim(), email: email.trim() || undefined });
      setSnackbar({ open: true, message: 'Profile updated successfully' });
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: unknown) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const initial = name.charAt(0).toUpperCase() || '?';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/profile')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Edit Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 4 }}>
        {/* Avatar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          {loading ? (
            <Skeleton variant="circular" width={100} height={100} />
          ) : (
            <Avatar sx={{ width: 100, height: 100, fontSize: '2.5rem', backgroundColor: 'primary.main' }}>
              {initial}
            </Avatar>
          )}
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {loading ? (
              <>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </>
            ) : (
              <>
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  autoComplete="name"
                />
                <TextField
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  type="email"
                  autoComplete="email"
                />
                <TextField
                  label="Phone Number"
                  value={phone}
                  fullWidth
                  disabled
                  helperText="Phone number cannot be changed"
                />
              </>
            )}
          </CardContent>
        </Card>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ py: 1.5 }}
          onClick={handleSave}
          disabled={loading || saving || !name.trim()}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          size="large"
          sx={{ py: 1.5, mt: 2 }}
          onClick={() => navigate('/profile')}
          disabled={saving}
        >
          Cancel
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
