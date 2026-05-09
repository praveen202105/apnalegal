import { useState, useEffect } from 'react';
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
  Snackbar,
  Skeleton,
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
import { getLawyers, type Lawyer } from '../../lib/api';

export default function LawyerMarketplace() {
  const navigate = useNavigate();
  const [bottomNavValue, setBottomNavValue] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLawyers()
      .then(setLawyers)
      .catch(() => setSnackbar({ open: true, message: 'Failed to load lawyers' }))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Property', 'Consumer', 'Family', 'Criminal', 'Corporate'];

  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSearch =
      !searchQuery ||
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || lawyer.specialty.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/lawyers', '/notifications', '/profile'];
    if (routes[newValue]) navigate(routes[newValue]);
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
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Find a Lawyer</Typography>
        <TextField
          fullWidth
          placeholder="Search by name or specialty"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
          }}
        />
      </Box>

      <Box sx={{ px: 3, mt: -2 }}>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, mb: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
              sx={{
                backgroundColor: category === selectedCategory ? 'primary.main' : 'white',
                color: category === selectedCategory ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { backgroundColor: category === selectedCategory ? 'primary.dark' : 'grey.100' },
              }}
            />
          ))}
          <Chip
            icon={<FilterListIcon />}
            label="Filters"
            onClick={() => setSnackbar({ open: true, message: 'Advanced filters coming soon' })}
            sx={{ backgroundColor: 'white', cursor: 'pointer', '&:hover': { backgroundColor: 'grey.100' } }}
          />
        </Box>

        {!loading && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {filteredLawyers.length} verified lawyer{filteredLawyers.length !== 1 ? 's' : ''} available
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={64} height={64} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="text" width="50%" height={20} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rounded" height={36} sx={{ flex: 1 }} />
                    <Skeleton variant="rounded" height={36} sx={{ flex: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {filteredLawyers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>No lawyers match your search</Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'primary.main', cursor: 'pointer', mt: 1 }}
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  >
                    Clear filters
                  </Typography>
                </Box>
              )}
              {filteredLawyers.map((lawyer) => (
                <Card key={lawyer._id} sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 64, height: 64, backgroundColor: 'primary.main', fontSize: '1.5rem' }}>
                        {lawyer.name.split(' ').find((w) => w !== 'Adv.')?.charAt(0) ?? 'L'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{lawyer.name}</Typography>
                          {lawyer.verified && <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          {lawyer.specialty} • {lawyer.experience} years
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Rating value={lawyer.rating} precision={0.1} size="small" readOnly />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {lawyer.rating} ({lawyer.reviewCount} reviews)
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
                        onClick={() => setSnackbar({ open: true, message: `${lawyer.name}'s full profile coming soon` })}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<VideoCallIcon />}
                        sx={{ py: 1 }}
                        onClick={() => navigate(`/booking/${lawyer._id}`)}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
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
