import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  Button,
  Skeleton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getDocuments, deleteDocument, downloadDocumentUrl } from '../../lib/api';

function formatDocType(type: string) {
  return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

const DOC_TYPE_ROUTES: Record<string, string> = {
  'rent-agreement': '/legal-workflow/rent-agreement',
  'affidavit': '/legal-workflow/affidavit',
  'legal-notice': '/legal-workflow/legal-notice',
  'consumer-complaint': '/legal-workflow/consumer-complaint',
  'fir-help': '/legal-workflow/fir-help',
};

interface Doc {
  _id: string;
  type: string;
  status: string;
  createdAt: string;
  formData: Record<string, string>;
}

export default function DocumentsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'drafts' ? 1 : 0;

  const [tabValue, setTabValue] = useState(initialTab);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocs)
      .catch(() => setSnackbar({ open: true, message: 'Failed to load documents' }))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument(deleteTarget);
      setDocs((prev) => prev.filter((d) => d._id !== deleteTarget));
      setSnackbar({ open: true, message: 'Document deleted' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete document' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredDocs = tabValue === 0
    ? docs.filter((d) => d.status === 'generated')
    : docs.filter((d) => d.status === 'draft');

  const generatedCount = docs.filter((d) => d.status === 'generated').length;
  const draftCount = docs.filter((d) => d.status === 'draft').length;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/profile')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
            My Documents
          </Typography>
          <IconButton color="primary" onClick={() => navigate('/')} title="Create new document">
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_e, v) => setTabValue(v)}
            variant="fullWidth"
            sx={{ '& .MuiTab-root': { fontWeight: 600 } }}
          >
            <Tab label={`Generated${generatedCount > 0 ? ` (${generatedCount})` : ''}`} />
            <Tab label={`Drafts${draftCount > 0 ? ` (${draftCount})` : ''}`} />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="rounded" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : filteredDocs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              {tabValue === 0 ? 'No generated documents yet' : 'No saved drafts'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
              {tabValue === 0
                ? 'Generate a document to see it here'
                : 'Start a document and save it as a draft'}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/')}>
              Create Document
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredDocs.map((doc) => {
              const subtitle = Object.values(doc.formData).filter(Boolean).slice(0, 2).join(' • ');
              return (
                <Card
                  key={doc._id}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                  onClick={() => navigate(`/document/${doc._id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <DescriptionIcon sx={{ fontSize: 26, color: 'primary.main' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {formatDocType(doc.type)}
                          </Typography>
                          <Chip
                            label={doc.status === 'generated' ? 'Ready' : 'Draft'}
                            color={doc.status === 'generated' ? 'success' : 'default'}
                            size="small"
                            sx={{ ml: 1, flexShrink: 0 }}
                          />
                        </Box>
                        {subtitle && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {subtitle}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {timeAgo(doc.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }} onClick={(e) => e.stopPropagation()}>
                      {doc.status === 'generated' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => window.open(downloadDocumentUrl(doc._id), '_blank')}
                        >
                          Download
                        </Button>
                      )}
                      {doc.status === 'draft' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(DOC_TYPE_ROUTES[doc.type] || '/')}
                        >
                          Continue
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteTarget(doc._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Document?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone. The document and its PDF will be permanently deleted.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
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
