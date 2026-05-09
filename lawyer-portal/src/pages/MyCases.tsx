import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button, 
  CircularProgress, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Briefcase 
} from 'lucide-react';
import { lawyerApi } from '../api';

export default function MyCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const fetchCases = () => {
    setLoading(true);
    lawyerApi.getCases()
      .then(res => setCases(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleAccept = (id: string) => {
    lawyerApi.acceptCase(id).then(() => fetchCases());
  };

  const handleUpdateStatus = (id: string, status: string) => {
    lawyerApi.updateCaseStatus(id, status).then(() => {
      setSelectedCase(null);
      fetchCases();
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>My Active Cases</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {cases.map((c) => (
            <Grid item xs={12} md={6} key={c._id}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      label={c.status.replace('_', ' ').toUpperCase()} 
                      color={c.status === 'assigned' ? 'warning' : 'success'} 
                      size="small" 
                      sx={{ fontWeight: 700 }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Case ID: #{c._id.slice(-6)}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{c.legalCategory}</Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
                    <User size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.userId?.name}</Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <MapPin size={16} />
                    <Typography variant="body2">{c.city}</Typography>
                  </Box>

                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary', 
                    mb: 3,
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden',
                  }}>
                    {c.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {c.status === 'assigned' ? (
                      <Button 
                        variant="contained" 
                        fullWidth 
                        sx={{ borderRadius: 2, bgcolor: '#002B5B' }}
                        onClick={() => handleAccept(c._id)}
                      >
                        Accept Case
                      </Button>
                    ) : (
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        sx={{ borderRadius: 2 }}
                        onClick={() => setSelectedCase(c)}
                      >
                        View Details
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {cases.length === 0 && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <Briefcase size={48} color="#ccc" style={{ marginBottom: '10px' }} />
              <Typography variant="body1" color="text.secondary">No cases assigned yet.</Typography>
            </Box>
          )}
        </Grid>
      )}

      {/* Case Detail Dialog */}
      <Dialog open={!!selectedCase} onClose={() => setSelectedCase(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Case Details</DialogTitle>
        <DialogContent dividers>
          {selectedCase && (
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>CLIENT INFORMATION</Typography>
              <Box sx={{ mb: 3, p: 2, bgcolor: '#F4F7F6', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <User size={18} />
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedCase.userId?.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Phone size={18} />
                  <Typography variant="body1">{selectedCase.userId?.phone}</Typography>
                  <Button size="small" variant="text" sx={{ ml: 'auto' }}>Call Now</Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Mail size={18} />
                  <Typography variant="body1">{selectedCase.userId?.email}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>CASE DESCRIPTION</Typography>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>{selectedCase.description}</Typography>

              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>ATTACHMENTS</Typography>
              {selectedCase.documentId ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                  <FileText size={20} color="#002B5B" />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>NyayAI Document</Typography>
                    <Typography variant="body2" sx={{ display: 'block' }}>{selectedCase.documentId.title}</Typography>
                  </Box>
                  <Button size="small" sx={{ ml: 'auto' }}>View</Button>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>No documents attached</Typography>
              )}

              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>CASE PROGRESS</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="In Progress" 
                  clickable 
                  onClick={() => handleUpdateStatus(selectedCase._id, 'in_progress')}
                  color={selectedCase.status === 'in_progress' ? 'primary' : 'default'}
                />
                <Chip 
                  label="Closed / Completed" 
                  clickable 
                  onClick={() => handleUpdateStatus(selectedCase._id, 'closed')}
                  color={selectedCase.status === 'closed' ? 'success' : 'default'}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedCase(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
