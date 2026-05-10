import { useState, useEffect, useRef } from 'react';
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
  DialogActions,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import { User, Phone, Mail, MapPin, FileText, UploadCloud } from 'lucide-react';
import { lawyerApi } from '../api';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  submitted: 'warning',
  under_review: 'info',
  assigned: 'warning',
  in_progress: 'primary',
  delivered: 'primary',
  signed: 'success',
  completed: 'success',
  cancelled: 'error',
};

export default function DocumentRequests() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [lawyerNotes, setLawyerNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetch = () => {
    setLoading(true);
    lawyerApi
      .getDocumentRequests()
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleAccept = (id: string) => {
    lawyerApi
      .acceptDocumentRequest(id)
      .then(() => fetch())
      .catch((e) => alert(e.response?.data?.message || e.message));
  };

  const openDeliver = (item: any) => {
    setSelected(item);
    setLawyerNotes('');
    setFile(null);
    setError(null);
  };

  const handleDeliver = async () => {
    if (!selected || !file) {
      setError('Please choose a PDF file to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await lawyerApi.deliverDocumentRequest(selected._id, file, lawyerNotes);
      setSelected(null);
      fetch();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        Document Cases
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((c) => (
            <Grid item xs={12} md={6} key={c._id}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      label={c.status.replace('_', ' ').toUpperCase()}
                      color={STATUS_COLOR[c.status] || 'default'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Case #{c._id.slice(-6)}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {c.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
                    <User size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.userId?.name}
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <MapPin size={16} />
                    <Typography variant="body2">{c.city}</Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {c.description}
                  </Typography>

                  <Stack direction="row" spacing={1.5}>
                    {c.status === 'assigned' && (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ borderRadius: 2, bgcolor: '#002B5B' }}
                        onClick={() => handleAccept(c._id)}
                      >
                        Accept Case
                      </Button>
                    )}
                    {(c.status === 'in_progress' || c.status === 'assigned') && (
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<UploadCloud size={16} />}
                        sx={{ borderRadius: 2 }}
                        onClick={() => openDeliver(c)}
                      >
                        Upload Deliverable
                      </Button>
                    )}
                    {['delivered', 'signed', 'completed'].includes(c.status) && (
                      <Button
                        variant="text"
                        fullWidth
                        sx={{ borderRadius: 2 }}
                        onClick={() => setSelected(c)}
                      >
                        View Details
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {items.length === 0 && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
              <FileText size={48} color="#ccc" style={{ marginBottom: '10px' }} />
              <Typography variant="body1" color="text.secondary">
                No document cases assigned yet.
              </Typography>
            </Box>
          )}
        </Grid>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{selected?.title}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                CLIENT INFORMATION
              </Typography>
              <Box sx={{ mb: 3, p: 2, bgcolor: '#F4F7F6', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <User size={18} />
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selected.userId?.name}
                  </Typography>
                </Box>
                {selected.userId?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Phone size={18} />
                    <Typography variant="body1">{selected.userId.phone}</Typography>
                  </Box>
                )}
                {selected.userId?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Mail size={18} />
                    <Typography variant="body1">{selected.userId.email}</Typography>
                  </Box>
                )}
              </Box>

              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                CASE DESCRIPTION
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                {selected.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {selected.city}{selected.state ? `, ${selected.state}` : ''} · Language: {selected.preferredLanguage} · Type: {selected.type}
              </Typography>

              {selected.adminNotes && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Admin notes:</strong> {selected.adminNotes}
                </Alert>
              )}

              {selected.deliverable && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Delivered <em>{selected.deliverable.fileName}</em> on {new Date(selected.deliverable.uploadedAt).toLocaleString()}.
                </Alert>
              )}

              {['assigned', 'in_progress'].includes(selected.status) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                    UPLOAD PREPARED DOCUMENT (PDF, max 10MB)
                  </Typography>
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<UploadCloud size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ mb: 2 }}
                  >
                    {file ? file.name : 'Choose PDF…'}
                  </Button>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes for the client (optional)"
                    value={lawyerNotes}
                    onChange={(e) => setLawyerNotes(e.target.value)}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelected(null)}>Close</Button>
          {selected && ['assigned', 'in_progress'].includes(selected.status) && (
            <Button
              variant="contained"
              onClick={handleDeliver}
              disabled={!file || uploading}
              sx={{ bgcolor: '#002B5B' }}
            >
              {uploading ? 'Uploading…' : 'Deliver to Client'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
