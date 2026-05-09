import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  MapPin, 
  Clock, 
  User, 
  Scale, 
  ExternalLink
} from 'lucide-react';
import { adminApi } from '../api';

export default function ConsultationQueue() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('submitted');
  
  const [assignDialog, setAssignDialog] = useState<any>(null);
  const [suggestedLawyers, setSuggestedLawyers] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const [assignData, setAssignData] = useState({
    lawyerId: '',
    lawyerFee: 1000,
    commissionRate: 20,
    adminNotes: ''
  });

  const fetchRequests = (status?: string) => {
    setLoading(true);
    adminApi.getRequests(status === 'all' ? undefined : status)
      .then(res => setRequests(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests(tab);
  }, [tab]);

  const handleOpenAssign = (request: any) => {
    setAssignDialog(request);
    setLoadingSuggestions(true);
    adminApi.suggestLawyers({ city: request.city, category: request.legalCategory })
      .then(res => {
        setSuggestedLawyers(res.data);
        if (res.data.length > 0) {
          setAssignData(prev => ({ 
            ...prev, 
            lawyerId: res.data[0]._id,
            commissionRate: res.data[0].commissionRate || 20
          }));
        }
      })
      .finally(() => setLoadingSuggestions(false));
  };

  const handleAssign = () => {
    if (!assignDialog || !assignData.lawyerId) return;
    adminApi.assignLawyer(assignDialog._id, assignData)
      .then(() => {
        setAssignDialog(null);
        fetchRequests(tab);
      })
      .catch(err => alert(err.message));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'warning';
      case 'assigned': return 'info';
      case 'accepted': return 'success';
      case 'closed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Consultation Requests</Typography>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="New" value="submitted" />
          <Tab label="Active" value="assigned" />
          <Tab label="Closed" value="closed" />
          <Tab label="All" value="all" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {requests.map((req) => (
            <Grid item xs={12} key={req._id}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Scale size={18} color="#1565C0" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{req.legalCategory}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <MapPin size={16} />
                        <Typography variant="body2">{req.city}, {req.state}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 0.5 }}>
                        <Clock size={16} />
                        <Typography variant="caption">Submitted {new Date(req.createdAt).toLocaleString()}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={5}>
                      <Typography variant="body2" sx={{ 
                        color: 'text.primary', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        mb: 1
                      }}>
                        {req.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <User size={16} color="#757575" />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{req.userId?.name || 'User'} ({req.userId?.phone})</Typography>
                        {req.documentId && (
                          <Chip 
                            icon={<ExternalLink size={14} />} 
                            label="Document Attached" 
                            size="small" 
                            variant="outlined" 
                            clickable 
                          />
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Chip 
                        label={req.status.toUpperCase()} 
                        color={getStatusColor(req.status)} 
                        size="small" 
                        sx={{ fontWeight: 700, px: 1 }} 
                      />
                      {req.lawyerId && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                          Lawyer: {req.lawyerId.name}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                      {req.status === 'submitted' && (
                        <Button 
                          variant="contained" 
                          size="small" 
                          sx={{ borderRadius: 2 }}
                          onClick={() => handleOpenAssign(req)}
                        >
                          Assign Lawyer
                        </Button>
                      )}
                      <Button variant="text" size="small" sx={{ ml: 1 }}>Details</Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {requests.length === 0 && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <Typography variant="body1" color="text.secondary">No requests found in this category.</Typography>
            </Box>
          )}
        </Grid>
      )}

      {/* Assign Lawyer Dialog */}
      <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Lawyer to Request</DialogTitle>
        <DialogContent dividers>
          {assignDialog && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#F8F9FA', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{assignDialog.legalCategory}</Typography>
              <Typography variant="body2" color="text.secondary">{assignDialog.description}</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Location: {assignDialog.city}</Typography>
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Select Lawyer</Typography>
          {loadingSuggestions ? (
            <CircularProgress size={24} />
          ) : (
            <TextField
              select
              fullWidth
              value={assignData.lawyerId}
              onChange={(e) => {
                const l = suggestedLawyers.find(law => law._id === e.target.value);
                setAssignData({ ...assignData, lawyerId: e.target.value, commissionRate: l?.commissionRate || 20 });
              }}
              sx={{ mb: 3 }}
            >
              {suggestedLawyers.map((l) => (
                <MenuItem key={l._id} value={l._id}>
                  {l.name} ({l.city}) — {l.rating}★ | {l.totalCases} cases
                </MenuItem>
              ))}
              {suggestedLawyers.length === 0 && <MenuItem disabled>No verified lawyers found in this city/category</MenuItem>}
            </TextField>
          )}

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Total Fee (₹)"
                type="number"
                value={assignData.lawyerFee}
                onChange={(e) => setAssignData({ ...assignData, lawyerFee: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Commission Rate (%)"
                type="number"
                value={assignData.commissionRate}
                onChange={(e) => setAssignData({ ...assignData, commissionRate: Number(e.target.value) })}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 2, opacity: 0.1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Admin Earnings (Commission):</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{(assignData.lawyerFee * assignData.commissionRate) / 100}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Lawyer Payout:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{assignData.lawyerFee - (assignData.lawyerFee * assignData.commissionRate) / 100}</Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Internal Admin Notes"
            value={assignData.adminNotes}
            onChange={(e) => setAssignData({ ...assignData, adminNotes: e.target.value })}
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAssignDialog(null)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAssign} 
            disabled={!assignData.lawyerId}
            sx={{ px: 4, borderRadius: 2 }}
          >
            Assign & Match
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
