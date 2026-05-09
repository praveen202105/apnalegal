import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';

interface Notification {
  id: number;
  type: 'document' | 'consultation' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [bottomNavValue, setBottomNavValue] = useState(2);
  const [tabValue, setTabValue] = useState(0);

  const notifications: Notification[] = [
    {
      id: 1,
      type: 'document',
      title: 'Document Ready',
      message: 'Your Rent Agreement is ready for download',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'consultation',
      title: 'Upcoming Consultation',
      message: 'Consultation with Adv. Sharma tomorrow at 3:00 PM',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Rent Payment Due',
      message: 'Monthly rent payment is due in 3 days',
      time: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'system',
      title: 'New Feature Available',
      message: 'AI Legal Assistant now supports voice input',
      time: '2 days ago',
      read: true,
    },
    {
      id: 5,
      type: 'document',
      title: 'Document Reviewed',
      message: 'Adv. Kumar reviewed your Legal Notice draft',
      time: '3 days ago',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <DescriptionIcon />;
      case 'consultation':
        return <EventIcon />;
      case 'reminder':
        return <SecurityIcon />;
      case 'system':
        return <InfoIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'document':
        return '#1565C0';
      case 'consultation':
        return '#00897B';
      case 'reminder':
        return '#F57C00';
      case 'system':
        return '#6A1B9A';
      default:
        return '#757575';
    }
  };

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/lawyers', '/notifications', '/profile'];
    if (routes[newValue]) {
      navigate(routes[newValue]);
    }
  };

  const filteredNotifications =
    tabValue === 0
      ? notifications
      : notifications.filter((n) => !n.read);

  return (
    <Box sx={{ pb: 10, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          color: 'white',
          px: 3,
          pt: 4,
          pb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Notifications
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {notifications.filter((n) => !n.read).length} unread notifications
        </Typography>
      </Box>

      <Box sx={{ px: 3, mt: -1 }}>
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            mb: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
              },
            }}
          >
            <Tab label="All" />
            <Tab label="Unread" />
          </Tabs>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              sx={{
                cursor: 'pointer',
                backgroundColor: notification.read ? 'white' : 'primary.light',
                border: notification.read ? '1px solid' : '2px solid',
                borderColor: notification.read ? 'divider' : 'primary.main',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              <CardContent sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: `${getIconColor(notification.type)}20`,
                    color: getIconColor(notification.type),
                  }}
                >
                  {getIcon(notification.type)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: notification.read ? 'text.primary' : 'primary.dark',
                      }}
                    >
                      {notification.title}
                    </Typography>
                    {!notification.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          ml: 1,
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 1,
                      lineHeight: 1.5,
                    }}
                  >
                    {notification.message}
                  </Typography>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {notification.time}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {filteredNotifications.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
              }}
            >
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                No unread notifications
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                You're all caught up!
              </Typography>
            </Box>
          )}
        </Box>
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
