import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Rating,
} from '@mui/material';
import { useNavigate } from 'react-router';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import VerifiedIcon from '@mui/icons-material/Verified';
import VideoCallIcon from '@mui/icons-material/VideoCall';

interface Lawyer {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  availability: string;
  pricePerHour: number;
  verified: boolean;
}

export default function LawyerMarketplace() {
  const navigate = useNavigate();
  const [bottomNavValue, setBottomNavValue] = useState(1);

  const lawyers: Lawyer[] = [
    {
      id: 1,
      name: 'Adv. Priya Sharma',
      specialty: 'Property Law',
      experience: 12,
      rating: 4.8,
      reviews: 234,
      availability: 'Available Today',
      pricePerHour: 2000,
      verified: true,
    },
    {
      id: 2,
      name: 'Adv. Rajesh Kumar',
      specialty: 'Consumer Rights',
      experience: 8,
      rating: 4.6,
      reviews: 156,
      availability: 'Available Tomorrow',
      pricePerHour: 1500,
      verified: true,
    },
    {
      id: 3,
      name: 'Adv. Meera Patel',
      specialty: 'Family Law',
      experience: 15,
      rating: 4.9,
      reviews: 342,
      availability: 'Available Today',
      pricePerHour: 2500,
      verified: true,
    },
    {
      id: 4,
      name: 'Adv. Ankit Verma',
      specialty: 'Criminal Law',
      experience: 10,
      rating: 4.7,
      reviews: 198,
      availability: 'Available in 2 days',
      pricePerHour: 3000,
      verified: true,
    },
  ];

  const categories = ['All', 'Property', 'Consumer', 'Family', 'Criminal', 'Corporate'];

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
          pb: 5,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Find a Lawyer
        </Typography>

        <TextField
          fullWidth
          placeholder="Search by name or specialty"
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

      <Box sx={{ px: 3, mt: -2 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 2,
            mb: 3,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              sx={{
                backgroundColor: category === 'All' ? 'primary.main' : 'white',
                color: category === 'All' ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: category === 'All' ? 'primary.dark' : 'grey.100',
                },
              }}
            />
          ))}
          <Chip
            icon={<FilterListIcon />}
            label="Filters"
            sx={{
              backgroundColor: 'white',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {lawyers.length} verified lawyers available
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {lawyers.map((lawyer) => (
            <Card
              key={lawyer.id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'primary.main',
                      fontSize: '1.5rem',
                    }}
                  >
                    {lawyer.name.split(' ')[1][0]}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {lawyer.name}
                      </Typography>
                      {lawyer.verified && (
                        <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {lawyer.specialty} • {lawyer.experience} years
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={lawyer.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {lawyer.rating} ({lawyer.reviews} reviews)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={lawyer.availability}
                        size="small"
                        color={lawyer.availability.includes('Today') ? 'success' : 'default'}
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ₹{lawyer.pricePerHour}/hour
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ py: 1 }}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<VideoCallIcon />}
                    sx={{ py: 1 }}
                    onClick={() => navigate(`/booking/${lawyer.id}`)}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
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
