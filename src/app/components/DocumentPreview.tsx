import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';

export default function DocumentPreview() {
  const navigate = useNavigate();
  const { id } = useParams();

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
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
            Document Preview
          </Typography>
          <IconButton color="primary">
            <ShareIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DescriptionIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Rent Agreement - Mumbai
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Generated on May 7, 2026
                </Typography>
                <Chip label="Ready" color="success" size="small" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            mb: 3,
            minHeight: '400px',
            backgroundColor: '#FAFAFA',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent>
            <Box
              sx={{
                p: 3,
                backgroundColor: 'white',
                borderRadius: 2,
                fontFamily: 'serif',
              }}
            >
              <Typography variant="h6" align="center" sx={{ mb: 3, fontWeight: 700 }}>
                RENT AGREEMENT
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                This Rent Agreement is made on this 1st day of June, 2026 between:
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                <strong>LANDLORD:</strong> Rajesh Kumar, residing at 123, MG Road, Mumbai, Maharashtra
                (hereinafter referred to as the "Landlord")
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                <strong>AND</strong>
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                <strong>TENANT:</strong> Amit Sharma, residing at 456, Park Street, Mumbai, Maharashtra
                (hereinafter referred to as the "Tenant")
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                <strong>PROPERTY DETAILS:</strong> Apartment 4B, 123 MG Road, Mumbai, Maharashtra
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                <strong>TERMS:</strong>
              </Typography>

              <Typography variant="body2" component="ul" sx={{ mb: 2, lineHeight: 1.8, pl: 4 }}>
                <li>Monthly Rent: ₹25,000 (Rupees Twenty-Five Thousand Only)</li>
                <li>Security Deposit: ₹50,000 (Rupees Fifty Thousand Only)</li>
                <li>Tenure Period: 11 months commencing from June 1, 2026</li>
                <li>Payment: Due on or before 5th of each month</li>
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                Both parties agree to the above terms and conditions...
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 4, textAlign: 'center' }}>
                [This is a preview. Full document available after download]
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Download PDF
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<EditIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Edit Document
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<GavelIcon />}
            fullWidth
            sx={{ py: 1.5 }}
            onClick={() => navigate('/lawyers')}
          >
            Request Lawyer Review
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
