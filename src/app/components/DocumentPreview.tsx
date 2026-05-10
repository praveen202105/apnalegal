import { useState, useEffect } from 'react';
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
  Snackbar,
  Skeleton,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import { getDocument, generateDocument, downloadDocumentUrl } from '../../lib/api';

function formatDocType(type: string) {
  return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const ALLOWED_PREVIEW_KEYS: Record<string, string[]> = {
  'rent-agreement': [
    'landlordName', 'landlordAddress', 'landlordDocType', 'landlordDocNumber',
    'tenantName', 'tenantAddress', 'tenantDocType', 'tenantDocNumber', 'tenantOccupation',
    'propertyAddress', 'propertyType', 'propertyArea', 'furnished', 'monthlyRent',
    'securityDeposit', 'maintenanceCharges', 'utilitiesIncluded', 'pincode', 'city', 'state',
    'tenurePeriod', 'startDate', 'lockInPeriod', 'noticePeriod', 'lateFee', 'petsAllowed',
    'sublettingAllowed', 'stampDutyOption', 'stampDutyAmount', 'witness1Name', 'witness1Address',
    'witness2Name', 'witness2Address', 'place', 'agreementDate'
  ],
  'affidavit': ['deponentName', 'fatherName', 'age', 'occupation', 'address', 'purpose', 'statement', 'city', 'state'],
  'legal-notice': ['senderName', 'senderAddress', 'senderPhone', 'senderEmail', 'recipientName', 'recipientAddress', 'subject', 'description', 'demandAmount', 'deadline'],
  'consumer-complaint': ['complainantName', 'complainantAddress', 'phone', 'email', 'companyName', 'companyAddress', 'productService', 'purchaseDate', 'amount', 'defectDescription', 'reliefSought'],
  'fir-help': ['incidentType', 'incidentDate', 'incidentTime', 'incidentPlace', 'victimName', 'victimAddress', 'phone', 'accusedName', 'accusedAddress', 'description', 'witnesses', 'evidence'],
};

export default function DocumentPreview() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const [doc, setDoc] = useState<{
    _id: string;
    type: string;
    status: string;
    formData: Record<string, string>;
    createdAt: string;
    pdfPath?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id || id === 'new') { setLoading(false); return; }
    getDocument(id)
      .then(setDoc)
      .catch(() => setError('Document not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSnackbar({ open: true, message: 'Link copied to clipboard' });
    } catch {
      setSnackbar({ open: true, message: 'Share link copied' });
    }
  };

  const triggerBlobDownload = (base64: string, filename: string) => {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (!doc) return;
    if (doc.status !== 'generated') {
      setSnackbar({ open: true, message: 'Generate the document first' });
      return;
    }
    setGenerating(true);
    try {
      // Re-generate to get fresh base64 — avoids binary CORS streaming issues
      const result = await generateDocument(doc._id);
      if (result.pdfBase64) {
        triggerBlobDownload(result.pdfBase64, `${doc.type}.pdf`);
        setSnackbar({ open: true, message: 'PDF downloaded successfully!' });
      } else {
        throw new Error('No PDF data returned');
      }
    } catch {
      setSnackbar({ open: true, message: 'Download failed. Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!doc) return;
    setGenerating(true);
    try {
      const updated = await generateDocument(doc._id);
      setDoc((prev) => prev ? { ...prev, status: updated.document.status } : prev);
      setSnackbar({ open: true, message: 'Document generated! Starting download...' });
      // Auto-download using returned base64
      if (updated.pdfBase64) {
        triggerBlobDownload(updated.pdfBase64, `${doc.type}.pdf`);
      }
    } catch (err: unknown) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  const formData = doc?.formData ?? {};

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
            Document Preview
          </Typography>
          <IconButton color="primary" onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box
                sx={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <DescriptionIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                {loading ? (
                  <>
                    <Skeleton variant="text" width="70%" height={28} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      {doc ? formatDocType(doc.type) : 'Document'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                      {doc ? new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </Typography>
                    <Chip
                      label={doc?.status === 'generated' ? 'Ready' : 'Draft'}
                      color={doc?.status === 'generated' ? 'success' : 'default'}
                      size="small"
                    />
                  </>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, minHeight: '400px', backgroundColor: '#FAFAFA', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, fontFamily: 'serif' }}>
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[...Array(8)].map((_, i) => <Skeleton key={i} variant="text" width={`${70 + Math.random() * 30}%`} />)}
                </Box>
              ) : doc ? (
                <>
                  <Typography variant="h6" align="center" sx={{ mb: 3, fontWeight: 700 }}>
                    {formatDocType(doc.type).toUpperCase()}
                  </Typography>
                  {(
                    ALLOWED_PREVIEW_KEYS[doc.type] ?? Object.keys(formData)
                  ).map((key) => {
                    const value = formData[key];
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
                    const displayValue = key.toLowerCase().includes('rent') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('deposit')
                      ? `₹${parseInt(value).toLocaleString('en-IN')}`
                      : value;
                    return (
                      <Typography key={key} variant="body2" sx={{ mb: 1.5, lineHeight: 1.8 }}>
                        <strong>{label.toUpperCase()}:</strong> {displayValue}
                      </Typography>
                    );
                  })}
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 4, textAlign: 'center' }}>
                    {doc.status === 'generated'
                      ? '[Document generated — download the PDF for the full version]'
                      : '[Preview — click Generate PDF below to create the final document]'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 8 }}>
                  Document not found
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {doc?.status !== 'generated' && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={handleGenerate}
              disabled={generating || !doc}
            >
              {generating ? 'Generating PDF...' : 'Generate PDF'}
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            fullWidth
            sx={{ py: 1.5 }}
            onClick={handleDownload}
            disabled={!doc || doc.status !== 'generated' || generating}
          >
            {generating ? 'Preparing Download...' : 'Download PDF'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<EditIcon />}
            fullWidth
            sx={{ py: 1.5 }}
            onClick={() => navigate(`/legal-workflow/${doc?.type || 'rent-agreement'}`)}
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
