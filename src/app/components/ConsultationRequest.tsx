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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { createConsultationRequest, CATEGORIES, STATES } from '../../lib/api';

const steps = ['Issue Type', 'Description', 'Location'];

export default function ConsultationRequest() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    legalCategory: '',
    description: '',
    city: '',
    state: '',
    preferredLanguage: 'English',
  });

  const handleNext = () => {
    if (activeStep === 0 && !formData.legalCategory) {
      setSnackbar({ open: true, message: 'Please select a category', severity: 'error' });
      return;
    }
    if (activeStep === 1 && formData.description.length < 20) {
      setSnackbar({ open: true, message: 'Description must be at least 20 characters', severity: 'error' });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!formData.city) {
      setSnackbar({ open: true, message: 'Please enter your city', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      await createConsultationRequest(formData);
      setSnackbar({ open: true, message: 'Request submitted! Our team will contact you soon.', severity: 'success' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to submit request', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>What type of legal help do you need?</Typography>
            <TextField
              select
              fullWidth
              label="Legal Category"
              value={formData.legalCategory}
              onChange={(e) => setFormData({ ...formData, legalCategory: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>Please describe your legal issue in detail.</Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Description"
              placeholder="E.g., I am facing an issue with my landlord regarding the security deposit refund..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText={`${formData.description.length}/500 characters (min 20)`}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1">Where are you located?</Typography>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            >
              {STATES.map((state) => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Preferred Language"
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
            >
              {['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Kannada'].map((lang) => (
                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
              ))}
            </TextField>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>Get Legal Help</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            {activeStep > 0 && (
              <Button variant="outlined" fullWidth size="large" onClick={handleBack}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" fullWidth size="large" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                Submit Request
              </Button>
            )}
          </Box>
        </Paper>

        <Box sx={{ mt: 4, p: 2, backgroundColor: '#1565C010', borderRadius: 2, border: '1px solid', borderColor: '#1565C030' }}>
          <Typography variant="subtitle2" sx={{ color: '#1565C0', mb: 1, fontWeight: 700 }}>How it works:</Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
            1. 📝 Submit your legal requirement here.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
            2. 🕵️ Our admin team reviews your case.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
            3. 🤝 We match you with the most eligible lawyer in your city.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            4. 📞 You get contacted for a consultation. No app subscription needed!
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
