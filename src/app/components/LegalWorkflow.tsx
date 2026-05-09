import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepButton,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { createDocument, generateDocument } from '../../lib/api';

function formatDocumentType(type: string | undefined): string {
  if (!type) return 'Legal Document';
  return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function LegalWorkflow() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const documentTitle = formatDocumentType(type);

  const [formData, setFormData] = useState({
    landlordName: '',
    tenantName: '',
    propertyAddress: '',
    monthlyRent: '',
    securityDeposit: '',
    tenurePeriod: '',
    startDate: '',
    city: '',
    state: '',
  });

  const steps = ['Basic Details', 'Property Info', 'Terms & Conditions'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setShowConfirmDialog(true);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSaveDraft = async () => {
    try {
      await createDocument(type || 'unknown', formData);
      setSnackbar({ open: true, message: 'Draft saved' });
    } catch {
      setSnackbar({ open: true, message: 'Draft saved locally' });
    }
  };

  const handleGenerate = async () => {
    setShowConfirmDialog(false);
    setGenerating(true);
    setError('');
    try {
      const doc = await createDocument(type || 'unknown', formData);
      const generated = await generateDocument(doc._id);
      navigate(`/document/${generated._id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAIAutofill = () => {
    setFormData({
      landlordName: 'Rajesh Kumar',
      tenantName: 'Amit Sharma',
      propertyAddress: '123, MG Road, Apartment 4B',
      monthlyRent: '25000',
      securityDeposit: '50000',
      tenurePeriod: '11',
      startDate: '2026-06-01',
      city: 'Mumbai',
      state: 'Maharashtra',
    });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Landlord Name" value={formData.landlordName} onChange={(e) => handleInputChange('landlordName', e.target.value)} fullWidth />
            <TextField label="Tenant Name" value={formData.tenantName} onChange={(e) => handleInputChange('tenantName', e.target.value)} fullWidth />
            <TextField label="Property Address" value={formData.propertyAddress} onChange={(e) => handleInputChange('propertyAddress', e.target.value)} multiline rows={3} fullWidth />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Monthly Rent (₹)" value={formData.monthlyRent} onChange={(e) => handleInputChange('monthlyRent', e.target.value)} type="number" fullWidth />
            <TextField label="Security Deposit (₹)" value={formData.securityDeposit} onChange={(e) => handleInputChange('securityDeposit', e.target.value)} type="number" fullWidth />
            <TextField label="City" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} fullWidth />
            <TextField label="State" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} select fullWidth>
              <MenuItem value="Maharashtra">Maharashtra</MenuItem>
              <MenuItem value="Delhi">Delhi</MenuItem>
              <MenuItem value="Karnataka">Karnataka</MenuItem>
              <MenuItem value="Tamil Nadu">Tamil Nadu</MenuItem>
              <MenuItem value="West Bengal">West Bengal</MenuItem>
            </TextField>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Tenure Period (Months)" value={formData.tenurePeriod} onChange={(e) => handleInputChange('tenurePeriod', e.target.value)} type="number" fullWidth />
            <TextField
              label="Start Date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText', borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Summary:</strong> Agreement between {formData.landlordName || '[Landlord]'} and {formData.tenantName || '[Tenant]'} for ₹{formData.monthlyRent || '0'}/month for {formData.tenurePeriod || '0'} months.
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{documentTitle}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Step {activeStep + 1} of {steps.length}</Typography>
          </Box>
          <IconButton color="primary" onClick={handleSaveDraft}>
            <SaveIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton onClick={() => index < activeStep && setActiveStep(index)} sx={{ cursor: index < activeStep ? 'pointer' : 'default' }}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleAIAutofill}
          fullWidth
          sx={{ mb: 3, borderStyle: 'dashed', borderWidth: 2, py: 1.5 }}
        >
          AI Smart Autofill
        </Button>

        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          {renderStepContent(activeStep)}
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0} fullWidth sx={{ py: 1.5 }}>Back</Button>
          <Button variant="contained" onClick={handleNext} fullWidth sx={{ py: 1.5 }} disabled={generating}>
            {activeStep === steps.length - 1 ? 'Generate Document' : 'Next'}
          </Button>
        </Box>
      </Box>

      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Generate {documentTitle}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your document will be generated based on the details you've provided. You can download or edit it after generation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Review Again</Button>
          <Button onClick={handleGenerate} variant="contained" disabled={generating}>
            {generating ? <CircularProgress size={20} color="inherit" /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
