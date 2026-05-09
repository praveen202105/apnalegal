import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function LegalWorkflow() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [activeStep, setActiveStep] = useState(0);

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
      navigate('/document/new');
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
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
            <TextField
              label="Landlord Name"
              value={formData.landlordName}
              onChange={(e) => handleInputChange('landlordName', e.target.value)}
              fullWidth
            />
            <TextField
              label="Tenant Name"
              value={formData.tenantName}
              onChange={(e) => handleInputChange('tenantName', e.target.value)}
              fullWidth
            />
            <TextField
              label="Property Address"
              value={formData.propertyAddress}
              onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Monthly Rent (₹)"
              value={formData.monthlyRent}
              onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
              type="number"
              fullWidth
            />
            <TextField
              label="Security Deposit (₹)"
              value={formData.securityDeposit}
              onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
              type="number"
              fullWidth
            />
            <TextField
              label="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              fullWidth
            />
            <TextField
              label="State"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              select
              fullWidth
            >
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
            <TextField
              label="Tenure Period (Months)"
              value={formData.tenurePeriod}
              onChange={(e) => handleInputChange('tenurePeriod', e.target.value)}
              type="number"
              fullWidth
            />
            <TextField
              label="Start Date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Paper
              sx={{
                p: 2,
                backgroundColor: 'info.light',
                color: 'info.contrastText',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">
                <strong>Summary:</strong> Agreement between {formData.landlordName || '[Landlord]'} and{' '}
                {formData.tenantName || '[Tenant]'} for ₹{formData.monthlyRent || '0'}/month for{' '}
                {formData.tenurePeriod || '0'} months.
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
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Rent Agreement
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
          <IconButton color="primary">
            <SaveIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleAIAutofill}
          fullWidth
          sx={{
            mb: 3,
            borderStyle: 'dashed',
            borderWidth: 2,
            py: 1.5,
          }}
        >
          AI Smart Autofill
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          {renderStepContent(activeStep)}
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Back
          </Button>

          <Button variant="contained" onClick={handleNext} fullWidth sx={{ py: 1.5 }}>
            {activeStep === steps.length - 1 ? 'Generate Document' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
