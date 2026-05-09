import { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Skeleton,
  Snackbar,
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
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type ApiNotification,
} from '../../lib/api';

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [bottomNavValue, setBottomNavValue] = useState(2);
  const [tabValue, setTabValue] = useState(0);

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const loadNotifications = useCallback(() => {
    getNotifications()
      .then(({ notifications: n, unreadCount: u }) => {
        setNotifications(n);
        setUnreadCount(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(id);
    } catch {
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
      setSnackbar({ open: true, message: 'All notifications marked as read' });
    } catch {
      loadNotifications();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await deleteNotification(id);
    } catch {
      loadNotifications();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <DescriptionIcon />;
      case 'consultation': return <EventIcon />;
      case 'reminder': return <SecurityIcon />;
      case 'system': return <InfoIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'document': return '#1565C0';
      case 'consultation': return '#00897B';
      case 'reminder': return '#F57C00';
      case 'system': return '#6A1B9A';
      default: return '#757575';
    }
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)} min ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
  }

  const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/lawyers', '/notifications', '/profile'];
    if (routes[newValue]) navigate(routes[newValue]);
  };

  const filteredNotifications = tabValue === 0 ? notifications : notifications.filter((n) => !n.read);

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Notifications</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>{unreadCount} unread notifications</Typography>
          </Box>
          {unreadCount > 0 && (
            <IconButton sx={{ color: 'white' }} onClick={handleMarkAllRead} title="Mark all as read">
              <DoneAllIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 3, mt: -1 }}>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_e, v) => setTabValue(v)}
            variant="fullWidth"
            sx={{ '& .MuiTab-root': { fontWeight: 600 } }}
          >
            <Tab label="All" />
            <Tab label={`Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`} />
          </Tabs>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="30%" height={16} />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  onClick={() => !notification.read && handleMarkRead(notification._id)}
                  sx={{
                    cursor: notification.read ? 'default' : 'pointer',
                    backgroundColor: notification.read ? 'white' : '#E3F2FD',
                    border: notification.read ? '1px solid' : '2px solid',
                    borderColor: notification.read ? 'divider' : 'primary.main',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 2 },
                  }}
                >
                  <CardContent sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      sx={{ width: 48, height: 48, backgroundColor: `${getIconColor(notification.type)}20`, color: getIconColor(notification.type) }}
                    >
                      {getIcon(notification.type)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: notification.read ? 'text.primary' : 'primary.dark' }}
                        >
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {!notification.read && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => handleDelete(notification._id, e)}
                            sx={{ color: 'text.secondary', p: 0.5 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.5 }}>
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {timeAgo(notification.createdAt)}
                        </Typography>
                        {notification.read && (
                          <Chip label="Read" size="small" sx={{ height: 16, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {filteredNotifications.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    {tabValue === 1 ? 'No unread notifications' : 'No notifications yet'}
                  </Typography>
                  {tabValue === 1 ? (
                    <>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>You're all caught up!</Typography>
                      <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer', mt: 0.5 }} onClick={() => setTabValue(0)}>
                        View all notifications
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>Check back later for updates.</Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
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
          <BottomNavigationAction label="Lawyers" icon={<GavelIcon />} />
          <BottomNavigationAction label="Alerts" icon={<NotificationsIcon />} />
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
