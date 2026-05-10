import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Fab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router';
import { listDocumentRequests, DocumentRequest, DocumentRequestStatus } from '../../lib/api';

const STATUS_COLOR: Record<DocumentRequestStatus, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  submitted: 'warning',
  under_review: 'info',
  assigned: 'info',
  in_progress: 'primary',
  delivered: 'primary',
  signed: 'success',
  completed: 'success',
  cancelled: 'error',
};

const STATUS_LABEL: Record<DocumentRequestStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Lawyer Assigned',
  in_progress: 'In Progress',
  delivered: 'Ready to Sign',
  signed: 'Signed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function MyDocumentRequests() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDocumentRequests()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>My Document Requests</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 720, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              You haven't requested any documents yet.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/document-requests/new')}>
              Request a Document
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {items.map((r) => (
              <Card key={r._id} sx={{ borderRadius: 3 }} onClick={() => navigate(`/document-requests/${r._id}`)} role="button">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{r.title}</Typography>
                    <Chip
                      label={STATUS_LABEL[r.status]}
                      color={STATUS_COLOR[r.status]}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 1,
                  }}>
                    {r.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.city}{r.state ? `, ${r.state}` : ''} · {new Date(r.createdAt).toLocaleDateString()}
                    {r.lawyerId ? ` · Lawyer: ${r.lawyerId.name}` : ''}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => navigate('/document-requests/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
