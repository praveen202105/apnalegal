import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Fab,
  Chip,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function HomeDashboard() {
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: ArticleIcon,
      title: 'Rent Agreement',
      description: 'Generate rental agreement',
      color: '#1565C0',
      route: '/legal-workflow/rent-agreement',
    },
    {
      icon: DescriptionIcon,
      title: 'Affidavit',
      description: 'Create affidavit document',
      color: '#00897B',
      route: '/legal-workflow/affidavit',
    },
    {
      icon: ReceiptLongIcon,
      title: 'Legal Notice',
      description: 'Draft legal notice',
      color: '#6A1B9A',
      route: '/legal-workflow/legal-notice',
    },
    {
      icon: ReportProblemIcon,
      title: 'Consumer Complaint',
      description: 'File consumer complaint',
      color: '#F57C00',
      route: '/legal-workflow/consumer-complaint',
    },
    {
      icon: LocalPoliceIcon,
      title: 'FIR Help',
      description: 'FIR assistance',
      color: '#D32F2F',
      route: '/legal-workflow/fir-help',
    },
  ];

  const recentDocuments = [
    {
      id: 1,
      title: 'Rent Agreement - Mumbai',
      date: '2 days ago',
      status: 'Ready',
    },
    {
      id: 2,
      title: 'Affidavit Draft',
      date: '1 week ago',
      status: 'Draft',
    },
  ];

  const upcomingConsultations = [
    {
      id: 1,
      lawyer: 'Adv. Sharma',
      specialty: 'Property Law',
      date: 'Tomorrow, 3:00 PM',
    },
  ];

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/lawyers', '/notifications', '/profile'];
    if (routes[newValue]) {
      navigate(routes[newValue]);
    }
  };

  return (
    <Box sx={{ pb: 10, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          color: 'white',
          px: 3,
          pt: 4,
          pb: 6,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              Good Morning
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Welcome Back!
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/profile')}
          >
            <PersonIcon />
          </Avatar>
        </Box>

        <TextField
          fullWidth
          placeholder="What legal help do you need?"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
            },
          }}
        />
      </Box>

      <Box sx={{ px: 3, mt: -3 }}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
            color: 'white',
            mb: 3,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/ai-assistant')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SmartToyIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                AI Legal Assistant
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Get instant legal guidance
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => navigate(action.route)}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      backgroundColor: `${action.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                    }}
                  >
                    <Icon sx={{ fontSize: 26, color: action.color }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Documents
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {recentDocuments.map((doc) => (
            <Card
              key={doc.id}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/document/${doc.id}`)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {doc.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {doc.date}
                  </Typography>
                </Box>
                <Chip
                  label={doc.status}
                  size="small"
                  color={doc.status === 'Ready' ? 'success' : 'default'}
                  sx={{ fontWeight: 500 }}
                />
              </CardContent>
            </Card>
          ))}
        </Box>

        {upcomingConsultations.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upcoming Consultations
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {upcomingConsultations.map((consultation) => (
                <Card key={consultation.id} sx={{ cursor: 'pointer' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EventNoteIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {consultation.lawyer}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {consultation.specialty}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                        {consultation.date}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}

        <Card
          sx={{
            background: 'linear-gradient(135deg, #6A1B9A15 0%, #6A1B9A05 100%)',
            border: '1px solid',
            borderColor: '#6A1B9A30',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/subscription')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 32, color: '#6A1B9A' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Upgrade to Pro
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Unlimited AI assistance & priority support
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          boxShadow: 4,
        }}
        onClick={() => navigate('/ai-assistant')}
      >
        <SmartToyIcon />
      </Fab>

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
