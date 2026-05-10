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
  Tab,
  Stack,
} from '@mui/material';
import { MapPin, Clock, User, FileText, Download } from 'lucide-react';
import { adminApi } from '../api';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  submitted: 'warning',
  under_review: 'info',
  assigned: 'info',
  in_progress: 'primary',
  delivered: 'primary',
  signed: 'success',
  completed: 'success',
  cancelled: 'error',
};

export default function DocumentRequestQueue() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('submitted');

  const [assignDialog, setAssignDialog] = useState<any>(null);
  const [suggestedLawyers, setSuggestedLawyers] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [assignData, setAssignData] = useState({ lawyerId: '', adminNotes: '' });

  const fetch = (status?: string) => {
    setLoading(true);
    adminApi
      .getDocumentRequests(status === 'all' ? {} : { status })
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(tab);
  }, [tab]);

  const openAssign = (req: any) => {
    setAssignDialog(req);
    setAssignData({ lawyerId: '', adminNotes: '' });
    setLoadingSuggestions(true);
    adminApi
      .suggestLawyers({ city: req.city, category: req.type })
      .then((res) => {
        setSuggestedLawyers(res.data);
        if (res.data.length > 0) setAssignData((p) => ({ ...p, lawyerId: res.data[0]._id }));
      })
      .finally(() => setLoadingSuggestions(false));
  };

  const handleAssign = () => {
    if (!assignDialog || !assignData.lawyerId) return;
    adminApi
      .assignDocumentRequest(assignDialog._id, assignData)
      .then(() => {
        setAssignDialog(null);
        fetch(tab);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Document Requests
        </Typography>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="New" value="submitted" />
          <Tab label="Assigned" value="assigned" />
          <Tab label="In Progress" value="in_progress" />
          <Tab label="Delivered" value="delivered" />
          <Tab label="Completed" value="completed" />
          <Tab label="All" value="all" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {requests.map((r) => (
            <Grid item xs={12} key={r._id}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FileText size={18} color="#1565C0" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {r.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <MapPin size={16} />
                        <Typography variant="body2">
                          {r.city}
                          {r.state ? `, ${r.state}` : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 0.5 }}>
                        <Clock size={16} />
                        <Typography variant="caption">Submitted {new Date(r.createdAt).toLocaleString()}</Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1,
                        }}
                      >
                        {r.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <User size={16} color="#757575" />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {r.userId?.name || 'User'} ({r.userId?.phone || r.userId?.email || '—'})
                        </Typography>
                        <Chip label={r.type} size="small" variant="outlined" />
                        <Chip label={r.preferredLanguage} size="small" variant="outlined" />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Chip
                        label={r.status.replace('_', ' ').toUpperCase()}
                        color={STATUS_COLOR[r.status] || 'default'}
                        size="small"
                        sx={{ fontWeight: 700, px: 1 }}
                      />
                      {r.lawyerId && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                          Lawyer: {r.lawyerId.name}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                      <Stack spacing={1} alignItems="flex-end">
                        {['submitted', 'under_review'].includes(r.status) && (
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ borderRadius: 2 }}
                            onClick={() => openAssign(r)}
                          >
                            Assign Lawyer
                          </Button>
                        )}
                        {r.deliverable && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download size={14} />}
                            href={adminApi.documentRequestDeliverableUrl(r._id)}
                            target="_blank"
                          >
                            Draft
                          </Button>
                        )}
                        {['signed', 'completed'].includes(r.status) && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Download size={14} />}
                            href={adminApi.documentRequestSignedUrl(r._id)}
                            target="_blank"
                          >
                            Signed
                          </Button>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {requests.length === 0 && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <Typography variant="body1" color="text.secondary">
                No requests in this state.
              </Typography>
            </Box>
          )}
        </Grid>
      )}

      <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Lawyer</DialogTitle>
        <DialogContent dividers>
          {assignDialog && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#F8F9FA', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {assignDialog.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assignDialog.description}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Location: {assignDialog.city}
              </Typography>
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Select Lawyer (matched by city / type)
          </Typography>
          {loadingSuggestions ? (
            <CircularProgress size={24} />
          ) : (
            <TextField
              select
              fullWidth
              value={assignData.lawyerId}
              onChange={(e) => setAssignData({ ...assignData, lawyerId: e.target.value })}
              sx={{ mb: 3 }}
            >
              {suggestedLawyers.map((l) => (
                <MenuItem key={l._id} value={l._id}>
                  {l.name} ({l.city}) — {l.rating || 0}★ | {l.totalCases || 0} cases
                </MenuItem>
              ))}
              {suggestedLawyers.length === 0 && (
                <MenuItem disabled>No matching verified lawyers</MenuItem>
              )}
            </TextField>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Internal admin notes (optional)"
            value={assignData.adminNotes}
            onChange={(e) => setAssignData({ ...assignData, adminNotes: e.target.value })}
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
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
