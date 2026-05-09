import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  Switch,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  Snackbar,
  Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getPreferences, updatePreferences } from '../../lib/api';

interface Prefs {
  darkMode: boolean;
  language: string;
  notifications: boolean;
  emailNotifications: boolean;
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs>({ darkMode: false, language: 'english', notifications: true, emailNotifications: true });

  useEffect(() => {
    getPreferences()
      .then((p) => setPrefs({ darkMode: p.darkMode ?? false, language: p.language || 'english', notifications: p.notifications ?? true, emailNotifications: p.emailNotifications ?? true }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const savePrefs = useCallback(async (update: Partial<Prefs>) => {
    const next = { ...prefs, ...update };
    setPrefs(next);
    try {
      await updatePreferences(next);
      setSnackbar({ open: true, message: 'Preference saved' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save preference' });
    }
  }, [prefs]);

  const staticLinks = [
    { label: 'Privacy Policy', description: 'Read our privacy policy', action: () => setSnackbar({ open: true, message: 'Privacy Policy coming soon' }) },
    { label: 'Terms of Service', description: 'Read terms and conditions', action: () => setSnackbar({ open: true, message: 'Terms of Service coming soon' }) },
    { label: 'Data Management', description: 'Manage your data', action: () => setSnackbar({ open: true, message: 'Data Management coming soon' }) },
    { label: 'Help & Support', description: 'Get help', action: () => setSnackbar({ open: true, message: 'Help & Support coming soon' }) },
    { label: 'Rate NyayAI', description: 'Share your feedback', action: () => setSnackbar({ open: true, message: 'Rate us on the App Store!' }) },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/profile')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        {/* Appearance */}
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, px: 1 }}>Appearance</Typography>
        <Card sx={{ mb: 3 }}>
          <List sx={{ py: 0 }}>
            <ListItem sx={{ px: 3, py: 2 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Dark Mode</Typography>}
                secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Switch to dark theme</Typography>}
              />
              {loading ? <Skeleton variant="rounded" width={44} height={24} /> : (
                <Switch checked={prefs.darkMode} onChange={(e) => savePrefs({ darkMode: e.target.checked })} color="primary" />
              )}
            </ListItem>
          </List>
        </Card>

        {/* Notifications */}
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, px: 1 }}>Notifications</Typography>
        <Card sx={{ mb: 3 }}>
          <List sx={{ py: 0 }}>
            <ListItem sx={{ px: 3, py: 2 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Push Notifications</Typography>}
                secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Receive app notifications</Typography>}
              />
              {loading ? <Skeleton variant="rounded" width={44} height={24} /> : (
                <Switch checked={prefs.notifications} onChange={(e) => savePrefs({ notifications: e.target.checked })} color="primary" />
              )}
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 3, py: 2 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Email Notifications</Typography>}
                secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Receive email updates</Typography>}
              />
              {loading ? <Skeleton variant="rounded" width={44} height={24} /> : (
                <Switch checked={prefs.emailNotifications} onChange={(e) => savePrefs({ emailNotifications: e.target.checked })} color="primary" />
              )}
            </ListItem>
          </List>
        </Card>

        {/* Language */}
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, px: 1 }}>Language & Region</Typography>
        <Card sx={{ mb: 3 }}>
          <ListItem sx={{ px: 3, py: 2, display: 'block' }}>
            <ListItemText
              primary={<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Language</Typography>}
              secondary={<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>Select your preferred language</Typography>}
            />
            {loading ? <Skeleton variant="rounded" height={40} /> : (
              <FormControl fullWidth size="small">
                <Select value={prefs.language} onChange={(e) => savePrefs({ language: e.target.value })} sx={{ borderRadius: 2 }}>
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">हिंदी (Hindi)</MenuItem>
                  <MenuItem value="tamil">தமிழ் (Tamil)</MenuItem>
                  <MenuItem value="bengali">বাংলা (Bengali)</MenuItem>
                  <MenuItem value="marathi">मराठी (Marathi)</MenuItem>
                </Select>
              </FormControl>
            )}
          </ListItem>
        </Card>

        {/* Privacy & About */}
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, px: 1 }}>Privacy & About</Typography>
        <Card sx={{ mb: 3 }}>
          <List sx={{ py: 0 }}>
            {staticLinks.map((link, index) => (
              <Box key={link.label}>
                <ListItem
                  sx={{ px: 3, py: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={link.action}
                >
                  <ListItemText
                    primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{link.label}</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{link.description}</Typography>}
                  />
                  <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                </ListItem>
                {index < staticLinks.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Card>

        <Card sx={{ mb: 3 }}>
          <ListItem sx={{ px: 3, py: 2 }}>
            <ListItemText primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Version</Typography>} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>1.0.0</Typography>
          </ListItem>
        </Card>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 4 }}>
          © 2026 NyayAI. All rights reserved.
        </Typography>
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
