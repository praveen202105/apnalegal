import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { createDocumentRequest, STATES } from '../../lib/api';

const DOC_TYPES = [
  { value: 'rent-agreement', label: 'Rent Agreement' },
  { value: 'affidavit', label: 'Affidavit' },
  { value: 'legal-notice', label: 'Legal Notice' },
  { value: 'consumer-complaint', label: 'Consumer Complaint' },
  { value: 'fir-help', label: 'FIR Help' },
  { value: 'will', label: 'Will' },
  { value: 'custom', label: 'Custom Document' },
];

export default function RequestDocument() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [form, setForm] = useState({
    type: 'rent-agreement',
    title: '',
    description: '',
    city: '',
    state: '',
    preferredLanguage: 'English',
  });

  const handleSubmit = async () => {
    if (!form.type) { setSnackbar({ open: true, message: 'Pick a document type', severity: 'error' }); return; }
    if (form.description.trim().length < 20) {
      setSnackbar({ open: true, message: 'Describe your needs in at least 20 characters', severity: 'error' });
      return;
    }
    if (!form.city.trim()) { setSnackbar({ open: true, message: 'Enter your city', severity: 'error' }); return; }

    setLoading(true);
    try {
      const created = await createDocumentRequest({
        type: form.type,
        title: form.title || undefined,
        description: form.description,
        city: form.city.trim(),
        state: form.state,
        preferredLanguage: form.preferredLanguage,
      });
      setSnackbar({ open: true, message: 'Request submitted. A lawyer will be assigned shortly.', severity: 'success' });
      setTimeout(() => navigate(`/document-requests/${created._id}`), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>Request a Document</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tell us what you need and where you are. An admin will assign a verified lawyer in your city to prepare it for you.
          </Typography>

          <TextField
            select
            fullWidth
            label="Document Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            sx={{ mb: 2 }}
          >
            {DOC_TYPES.map((t) => (<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>))}
          </TextField>

          <TextField
            fullWidth
            label="Custom Title (optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={DOC_TYPES.find((t) => t.value === form.type)?.label || ''}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={5}
            label="What do you need?"
            placeholder="Describe the parties, dates, key terms or requirements you'd like the lawyer to include."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Mumbai"
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">—</MenuItem>
            {STATES.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Preferred Language"
            value={form.preferredLanguage}
            onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
            sx={{ mb: 3 }}
          >
            {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati'].map((l) => (
              <MenuItem key={l} value={l}>{l}</MenuItem>
            ))}
          </TextField>

          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            onClick={handleSubmit}
            size="large"
          >
            {loading ? 'Submitting…' : 'Submit Request'}
          </Button>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
