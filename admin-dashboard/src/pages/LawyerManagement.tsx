import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin
} from 'lucide-react';
import { adminApi } from '../api';

const CATEGORIES = ['Rent Agreement', 'Property Dispute', 'Consumer Complaint', 'Family Law', 'Criminal Defence', 'Labour Law', 'Corporate', 'Cyber Crime', 'Other'];

export default function LawyerManagement() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardDialog, setOnboardDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Password123', // Default initial password
    specialties: [] as string[],
    experience: 5,
    city: '',
    pricePerCase: 1000,
    commissionRate: 20,
    bio: ''
  });

  const fetchLawyers = () => {
    setLoading(true);
    adminApi.getLawyers()
      .then(res => setLawyers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const handleOnboard = () => {
    setSubmitting(true);
    adminApi.onboardLawyer(formData)
      .then(() => {
        setOnboardDialog(false);
        fetchLawyers();
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: 'Password123',
          specialties: [],
          experience: 5,
          city: '',
          pricePerCase: 1000,
          commissionRate: 20,
          bio: ''
        });
      })
      .catch(err => alert(err.response?.data?.message || err.message))
      .finally(() => setSubmitting(false));
  };

  const toggleVerify = (id: string, currentlyVerified: boolean) => {
    if (!currentlyVerified) {
      adminApi.verifyLawyer(id).then(() => fetchLawyers());
    } else {
      // Toggle off would be a suspend action or just a patch
      adminApi.suspendLawyer(id).then(() => fetchLawyers());
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Lawyer Network</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />} 
          sx={{ borderRadius: 2 }}
          onClick={() => setOnboardDialog(true)}
        >
          Onboard New Lawyer
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8F9FA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Lawyer Details</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Specialties</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lawyers.map((lawyer) => (
                <TableRow key={lawyer._id}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{lawyer.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Mail size={12} /> <Typography variant="caption">{lawyer.email}</Typography></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone size={12} /> <Typography variant="caption">{lawyer.phone}</Typography></Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={14} color="#757575" />
                      <Typography variant="body2">{lawyer.city}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{lawyer.experience} Years</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {lawyer.specialties.map((s: string) => (
                        <Chip key={s} label={s} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={lawyer.isSuspended ? 'SUSPENDED' : lawyer.isVerified ? 'VERIFIED' : 'PENDING'} 
                      color={lawyer.isSuspended ? 'error' : lawyer.isVerified ? 'success' : 'warning'} 
                      size="small" 
                      variant={lawyer.isVerified ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 700 }}>{lawyer.rating}</Typography>
                      <Box component="span" sx={{ color: '#FFB400' }}>★</Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small"><MoreVertical size={18} /></IconButton>
                    <Button 
                      size="small" 
                      color={lawyer.isVerified ? 'error' : 'success'}
                      onClick={() => toggleVerify(lawyer._id, lawyer.isVerified)}
                    >
                      {lawyer.isVerified ? 'Suspend' : 'Verify'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Onboarding Dialog */}
      <Dialog open={onboardDialog} onClose={() => setOnboardDialog(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>Onboard New Lawyer</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Adv. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ mb: 3 }}
              />
              <TextField
                select
                fullWidth
                label="Primary City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                sx={{ mb: 3 }}
              >
                {['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata'].map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Specialties"
                slotProps={{ select: { multiple: true } }}
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: (e.target.value as unknown as string[]) })}
                sx={{ mb: 3 }}
              >
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Default Commission (%)"
                    type="number"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    sx={{ mb: 3 }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Professional Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOnboardDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleOnboard} 
            disabled={submitting || !formData.name || !formData.email || !formData.city}
            sx={{ px: 4, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Confirm Onboarding'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
