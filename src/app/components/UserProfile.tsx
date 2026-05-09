import { useState } from 'react';
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

interface UserProfileProps {
  onLogout: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const navigate = useNavigate();
  const [bottomNavValue, setBottomNavValue] = useState(3);

  const stats = [
    { label: 'Documents', value: '12' },
    { label: 'Consultations', value: '5' },
    { label: 'Saved Drafts', value: '3' },
  ];

  const menuItems = [
    {
      icon: DescriptionIcon,
      label: 'My Documents',
      description: 'View all documents',
      route: '/',
    },
    {
      icon: FolderIcon,
      label: 'Saved Drafts',
      description: 'Continue your work',
      route: '/',
    },
    {
      icon: CreditCardIcon,
      label: 'Subscription & Billing',
      description: 'Manage your plan',
      route: '/subscription',
    },
    {
      icon: SecurityIcon,
      label: 'Privacy & Security',
      description: 'Manage data & access',
      route: '/settings',
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      description: 'App preferences',
      route: '/settings',
    },
  ];

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/lawyers', '/notifications', '/profile'];
    if (routes[newValue]) {
      navigate(routes[newValue]);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/auth');
  };

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
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              border: '4px solid rgba(255, 255, 255, 0.3)',
              fontSize: '2.5rem',
            }}
          >
            A
          </Avatar>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Amit Sharma
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
            amit.sharma@email.com
          </Typography>

          <Chip
            icon={<StarIcon sx={{ fontSize: 16 }} />}
            label="Pro Member"
            sx={{
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              color: '#FFD700',
              fontWeight: 600,
              border: '1px solid #FFD700',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ px: 3, mt: -5 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              {stats.map((stat, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<EditIcon />}
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: 3,
          }}
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
                    sx={{
                      cursor: 'pointer',
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => navigate(item.route)}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          backgroundColor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon sx={{ fontSize: 22, color: 'primary.main' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.description}
                        </Typography>
                      }
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
          sx={{
            cursor: 'pointer',
            border: '2px solid',
            borderColor: 'error.light',
            '&:hover': {
              backgroundColor: 'error.light',
            },
          }}
          onClick={handleLogout}
        >
          <ListItem>
            <ListItemIcon>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  backgroundColor: 'error.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon sx={{ fontSize: 22, color: 'error.main' }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Logout
                </Typography>
              }
            />
          </ListItem>
        </Card>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
            mt: 3,
          }}
        >
          NyayAI v1.0.0 • Made with ❤️ in India
        </Typography>
      </Box>

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.1)',
        }}
        elevation={3}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          sx={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 70,
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Lawyers" icon={<GavelIcon />} />
          <BottomNavigationAction label="Alerts" icon={<NotificationsIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
