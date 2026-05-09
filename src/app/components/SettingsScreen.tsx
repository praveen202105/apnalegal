import { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('english');

  const settingSections = [
    {
      title: 'Appearance',
      items: [
        {
          label: 'Dark Mode',
          description: 'Switch to dark theme',
          type: 'switch',
          value: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          description: 'Receive app notifications',
          type: 'switch',
          value: notifications,
          onChange: setNotifications,
        },
        {
          label: 'Email Notifications',
          description: 'Receive email updates',
          type: 'switch',
          value: emailNotifications,
          onChange: setEmailNotifications,
        },
      ],
    },
    {
      title: 'Language & Region',
      items: [
        {
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: language,
          onChange: setLanguage,
          options: [
            { value: 'english', label: 'English' },
            { value: 'hindi', label: 'हिंदी (Hindi)' },
            { value: 'tamil', label: 'தமிழ் (Tamil)' },
            { value: 'bengali', label: 'বাংলা (Bengali)' },
            { value: 'marathi', label: 'मराठी (Marathi)' },
          ],
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          label: 'Privacy Policy',
          description: 'Read our privacy policy',
          type: 'link',
          route: '__coming_soon__',
        },
        {
          label: 'Terms of Service',
          description: 'Read terms and conditions',
          type: 'link',
          route: '__coming_soon__',
        },
        {
          label: 'Data Management',
          description: 'Manage your data',
          type: 'link',
          route: '__coming_soon__',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          label: 'Version',
          description: '1.0.0',
          type: 'text',
        },
        {
          label: 'Help & Support',
          description: 'Get help',
          type: 'link',
          route: '__coming_soon__',
        },
        {
          label: 'Rate NyayAI',
          description: 'Share your feedback',
          type: 'link',
          route: '__coming_soon__',
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <ListItem sx={{ px: 3, py: 2 }}>
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
            <Switch
              checked={item.value}
              onChange={(e) => item.onChange(e.target.checked)}
              color="primary"
            />
          </ListItem>
        );

      case 'select':
        return (
          <ListItem sx={{ px: 3, py: 2, display: 'block' }}>
            <ListItemText
              primary={
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {item.label}
                </Typography>
              }
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  {item.description}
                </Typography>
              }
            />
            <FormControl fullWidth size="small">
              <Select
                value={item.value}
                onChange={(e) => item.onChange(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                {item.options?.map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        );

      case 'link':
        return (
          <ListItem
            sx={{
              px: 3,
              py: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => {
              if (!item.route) return;
              if (item.route === '__coming_soon__') {
                setSnackbar({ open: true, message: `${item.label} coming soon` });
              } else {
                navigate(item.route);
              }
            }}
          >
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
        );

      case 'text':
        return (
          <ListItem sx={{ px: 3, py: 2 }}>
            <ListItemText
              primary={
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.label}
                </Typography>
              }
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </ListItem>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
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
        {settingSections.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                display: 'block',
                mb: 1,
                px: 1,
              }}
            >
              {section.title}
            </Typography>

            <Card>
              <List sx={{ py: 0 }}>
                {section.items.map((item, itemIndex) => (
                  <Box key={itemIndex}>
                    {renderSettingItem(item)}
                    {itemIndex < section.items.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Card>
          </Box>
        ))}

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
            mt: 4,
          }}
        >
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
