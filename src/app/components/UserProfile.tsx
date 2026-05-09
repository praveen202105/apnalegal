import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Chip,
  Snackbar,
  Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import { getMe, getStats, getCurrentPlan } from '../../lib/api';

interface UserProfileProps {
  onLogout: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const navigate = useNavigate();
  const [bottomNavValue, setBottomNavValue] = useState(3);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [stats, setStats] = useState({ documents: 0, consultations: 0, drafts: 0 });
  const [planName, setPlanName] = useState('Free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMe(), getStats(), getCurrentPlan()])
      .then(([u, s, plan]) => {
        setUser({ name: u.name || '', email: u.email || '', phone: u.phone });
        setStats(s);
        setPlanName(plan.name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { icon: DescriptionIcon, label: 'My Documents', description: 'View all documents', route: '/documents' },
    { icon: FolderIcon, label: 'Saved Drafts', description: 'Continue your work', route: '/documents?tab=drafts' },
    { icon: CreditCardIcon, label: 'Subscription & Billing', description: 'Manage your plan', route: '/subscription' },
    { icon: SecurityIcon, label: 'Privacy & Security', description: 'Manage data & access', route: '/settings' },
    { icon: SettingsIcon, label: 'Settings', description: 'App preferences', route: '/settings' },
  ];

  const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/consultations', '/notifications', '/profile'];
    if (routes[newValue]) navigate(routes[newValue]);
  };


  const handleLogout = () => {
    onLogout();
    navigate('/auth');
  };

  const isPro = planName.toLowerCase() !== 'free';
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Box sx={{ pb: 10, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          color: 'white',
          px: 3,
          pt: 4,
          pb: 8,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 100, height: 100, mb: 2, border: '4px solid rgba(255,255,255,0.3)', fontSize: '2.5rem' }}
          >
            {initial}
          </Avatar>

          {loading ? (
            <>
              <Skeleton variant="text" width={160} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Skeleton variant="text" width={200} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {user?.name || 'Your Name'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                {user?.email || user?.phone || ''}
              </Typography>
            </>
          )}

          <Chip
            icon={<StarIcon sx={{ fontSize: 16 }} />}
            label={isPro ? `${planName} Member` : 'Free Plan'}
            sx={{
              backgroundColor: isPro ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.15)',
              color: isPro ? '#FFD700' : 'rgba(255,255,255,0.8)',
              fontWeight: 600,
              border: `1px solid ${isPro ? '#FFD700' : 'rgba(255,255,255,0.3)'}`,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ px: 3, mt: -5 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              {[
                { label: 'Documents', value: stats.documents },
                { label: 'Consultations', value: stats.consultations },
                { label: 'Saved Drafts', value: stats.drafts },
              ].map((stat, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  {loading ? (
                    <Skeleton variant="text" width={40} height={36} sx={{ mx: 'auto' }} />
                  ) : (
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {stat.value}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{stat.label}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<EditIcon />}
          sx={{ mb: 3, py: 1.5, borderRadius: 3 }}
          onClick={() => navigate('/edit-profile')}
        >
          Edit Profile
        </Button>

        <Card sx={{ mb: 3 }}>
          <List sx={{ py: 0 }}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Box key={index}>
                  <ListItem
                    sx={{ cursor: 'pointer', py: 2, '&:hover': { backgroundColor: 'action.hover' } }}
                    onClick={() => navigate(item.route)}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Icon sx={{ fontSize: 22, color: 'primary.main' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.label}</Typography>}
                      secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.description}</Typography>}
                    />
                    <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                  </ListItem>
                  {index < menuItems.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        </Card>

        <Card
          sx={{ cursor: 'pointer', border: '2px solid', borderColor: 'error.light', '&:hover': { backgroundColor: 'error.light' } }}
          onClick={handleLogout}
        >
          <ListItem>
            <ListItemIcon>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'error.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogoutIcon sx={{ fontSize: 22, color: 'error.main' }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>Logout</Typography>}
            />
          </ListItem>
        </Card>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 3 }}>
          NyayAI v1.0.0 • Made with ❤️ in India
        </Typography>
      </Box>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.1)' }}
        elevation={3}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          sx={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, height: 70 }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Get Help" icon={<GavelIcon />} />
          <BottomNavigationAction label="Notifications" icon={<NotificationsIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />

        </BottomNavigation>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 10 }}
      />
    </Box>
  );
}
