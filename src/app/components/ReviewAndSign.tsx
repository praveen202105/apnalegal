import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useParams } from 'react-router';
import SignatureCanvas from 'react-signature-canvas';
import {
  getDocumentRequest,
  signDocumentRequest,
  cancelDocumentRequest,
  documentRequestDeliverableUrl,
  documentRequestSignedUrl,
  DocumentRequest,
} from '../../lib/api';

const STATUS_TIMELINE = [
  'submitted',
  'under_review',
  'assigned',
  'in_progress',
  'delivered',
  'signed',
  'completed',
] as const;

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Lawyer Assigned',
  in_progress: 'Lawyer Working',
  delivered: 'Ready to Sign',
  signed: 'Signed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ReviewAndSign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sigRef = useRef<SignatureCanvas | null>(null);

  const reload = () => {
    if (!id) return;
    setLoading(true);
    getDocumentRequest(id)
      .then(setDoc)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(reload, [id]);

  const handleSign = async () => {
    if (!id || !sigRef.current) return;
    if (sigRef.current.isEmpty()) {
      setError('Please draw your signature first');
      return;
    }
    const png = sigRef.current.getCanvas().toDataURL('image/png');
    setSubmitting(true);
    setError(null);
    try {
      const updated = await signDocumentRequest(id, png);
      setDoc(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm('Cancel this request? This cannot be undone.')) return;
    try {
      const updated = await cancelDocumentRequest(id);
      setDoc(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }
  if (!doc) {
    return <Box sx={{ p: 3 }}><Alert severity="error">Request not found.</Alert></Box>;
  }

  const currentIdx = STATUS_TIMELINE.indexOf(doc.status as typeof STATUS_TIMELINE[number]);
  const canSign = doc.status === 'delivered';
  const canCancel = !['signed', 'completed', 'cancelled'].includes(doc.status);
  const hasSigned = ['signed', 'completed'].includes(doc.status);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>{doc.title}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 720, mx: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {/* Status timeline */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Status</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {doc.status === 'cancelled' ? (
              <Chip label="Cancelled" color="error" size="small" />
            ) : (
              STATUS_TIMELINE.map((s, idx) => (
                <Chip
                  key={s}
                  label={STATUS_LABEL[s]}
                  size="small"
                  color={idx <= currentIdx ? 'primary' : 'default'}
                  variant={idx === currentIdx ? 'filled' : 'outlined'}
                />
              ))
            )}
          </Box>
        </Paper>

        {/* Description / Lawyer info */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Your request</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{doc.description}</Typography>
          <Typography variant="caption" color="text.secondary">
            {doc.city}{doc.state ? `, ${doc.state}` : ''} · {doc.preferredLanguage}
          </Typography>

          {doc.lawyerId && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Assigned Lawyer</Typography>
              <Typography variant="body2"><b>{doc.lawyerId.name}</b>{doc.lawyerId.city ? ` · ${doc.lawyerId.city}` : ''}</Typography>
              {doc.lawyerId.phone && <Typography variant="caption" color="text.secondary">📞 {doc.lawyerId.phone}</Typography>}
              {doc.lawyerId.email && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>✉️ {doc.lawyerId.email}</Typography>}
            </>
          )}
        </Paper>

        {/* Deliverable / Sign / Download */}
        {['delivered', 'signed', 'completed'].includes(doc.status) && doc.deliverable && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Prepared Document</Typography>
            {doc.deliverable.lawyerNotes && (
              <Alert severity="info" sx={{ mb: 2 }}>{doc.deliverable.lawyerNotes}</Alert>
            )}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                href={documentRequestDeliverableUrl(doc._id)}
                target="_blank"
              >
                View Draft
              </Button>
              {hasSigned && (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href={documentRequestSignedUrl(doc._id)}
                  target="_blank"
                >
                  Download Signed Copy
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        {canSign && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Sign to finalize</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Draw your signature in the box below using your mouse or finger.
            </Typography>
            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, mb: 1, bgcolor: 'background.paper' }}>
              <SignatureCanvas
                ref={(ref) => { sigRef.current = ref; }}
                penColor="#0d2a4d"
                canvasProps={{ width: 600, height: 180, style: { width: '100%', height: 180 } }}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<EditIcon />} onClick={() => sigRef.current?.clear()} variant="text">Clear</Button>
              <Button
                variant="contained"
                disabled={submitting}
                onClick={handleSign}
                sx={{ ml: 'auto' }}
              >
                {submitting ? 'Signing…' : 'Submit Signature'}
              </Button>
            </Stack>
          </Paper>
        )}

        {canCancel && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button color="error" size="small" onClick={handleCancel}>Cancel this request</Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
