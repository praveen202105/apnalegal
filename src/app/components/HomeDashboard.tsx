import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Fab,
  Chip,
  Avatar,
  Skeleton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getMe, getDocuments, getConsultationRequests, listDocumentRequests, type ConsultationRequest, type DocumentRequest } from '../../lib/api';
import EditNoteIcon from '@mui/icons-material/EditNote';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDocType(type: string) {
  return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
}

const statusSteps = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Reviewing' },
  { key: 'assigned', label: 'Matched' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'Ongoing' },
  { key: 'closed', label: 'Closed' },
];

export default function HomeDashboard() {
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [documents, setDocuments] = useState<{ _id: string; type: string; status: string; createdAt: string }[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    getMe()
      .then((u) => setUserName(u.name || 'User'))
      .catch(() => setUserName('User'))
      .finally(() => setLoadingUser(false));

    getDocuments()
      .then((docs) => setDocuments(docs.slice(0, 3)))
      .catch(() => {});

    getConsultationRequests()
      .then((reqs) => setConsultations(reqs))
      .catch(() => {});

    listDocumentRequests()
      .then((reqs) => setDocRequests(reqs.slice(0, 3)))
      .catch(() => {});
  }, []);

  const latestRequest = consultations[0];
  const activeStep = latestRequest ? statusSteps.findIndex(s => s.key === latestRequest.status) : -1;

  const quickActions = [
    { icon: ArticleIcon, title: 'Rent Agreement', description: 'Generate rental agreement', color: '#1565C0', route: '/legal-workflow/rent-agreement' },
    { icon: DescriptionIcon, title: 'Affidavit', description: 'Create affidavit document', color: '#00897B', route: '/legal-workflow/affidavit' },
    { icon: ReceiptLongIcon, title: 'Legal Notice', description: 'Draft legal notice', color: '#6A1B9A', route: '/legal-workflow/legal-notice' },
    { icon: ReportProblemIcon, title: 'Consumer Complaint', description: 'File consumer complaint', color: '#F57C00', route: '/legal-workflow/consumer-complaint' },
    { icon: LocalPoliceIcon, title: 'FIR Help', description: 'FIR assistance', color: '#D32F2F', route: '/legal-workflow/fir-help' },
    { icon: AccountBalanceIcon, title: 'Dispute/Bail', description: 'Dispute and bail intake', color: '#455A64', route: '/legal-workflow/dispute' },
  ];

  const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/consultations', '/notifications', '/profile'];
    if (routes[newValue]) navigate(routes[newValue]);
  };

  return (
    <Box sx={{ pb: 10, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          color: 'white',
          px: 3,
          pt: 4,
          pb: 6,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>{getGreeting()}</Typography>
            {loadingUser ? (
              <Skeleton variant="text" width={160} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {userName ? `Welcome, ${userName.split(' ')[0]}!` : 'Welcome Back!'}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{ width: 48, height: 48, bgcolor: 'rgba(255, 255, 255, 0.2)', cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            {userName ? userName.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
        </Box>

        <TextField
          fullWidth
          placeholder="Search for legal help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              navigate(`/ai-assistant?q=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
          }}
        />
      </Box>

      <Box sx={{ px: 3, mt: -3 }}>
        {/* Case Status Tracker */}
        {latestRequest && (
          <Card sx={{ mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'primary.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ACTIVE CONSULTATION
                </Typography>
                <Chip label={latestRequest.legalCategory} size="small" variant="outlined" />
              </Box>
              
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                {statusSteps.map((step) => (
                  <Step key={step.key}>
                    <StepLabel>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{step.label}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {latestRequest.status === 'assigned' && latestRequest.assignedLawyerId && (
                <Box sx={{ p: 2, backgroundColor: 'success.light', borderRadius: 2, opacity: 0.1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                    Lawyer Matched: {latestRequest.assignedLawyerId.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    They will contact you shortly.
                  </Typography>
                </Box>
              )}
              
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                Updated {timeAgo(latestRequest.createdAt)}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card
          sx={{ background: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)', color: 'white', mb: 2, cursor: 'pointer' }}
          onClick={() => navigate('/document-requests/new')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EditNoteIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Lawyer-Prepared Document</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Request, review, e-sign &amp; download</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{ background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)', color: 'white', mb: 3, cursor: 'pointer' }}
          onClick={() => navigate('/ai-assistant')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SmartToyIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>AI Legal Assistant</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Get instant legal guidance</Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}
                onClick={() => navigate(action.route)}
              >
                <CardContent>
                  <Box
                    sx={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}
                  >
                    <Icon sx={{ fontSize: 26, color: action.color }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>{action.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{action.description}</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Recent Documents</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Card key={doc._id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/document/${doc._id}`)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{formatDocType(doc.type)}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{timeAgo(doc.createdAt)}</Typography>
                  </Box>
                  <Chip
                    label={doc.status === 'generated' ? 'Ready' : 'Draft'}
                    size="small"
                    color={doc.status === 'generated' ? 'success' : 'default'}
                    sx={{ fontWeight: 500 }}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card sx={{ cursor: 'pointer', border: '1px dashed', borderColor: 'divider' }} onClick={() => navigate('/legal-workflow/rent-agreement')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No documents yet</Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>Create your first document →</Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>My Document Requests</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {docRequests.length > 0 ? (
            <>
              {docRequests.map((r) => (
                <Card key={r._id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/document-requests/${r._id}`)}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EditNoteIcon sx={{ fontSize: 32, color: '#6A1B9A' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{r.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{r.city}</Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                        Status: {r.status.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
                onClick={() => navigate('/document-requests')}
              >
                View all →
              </Typography>
            </>
          ) : (
            <Card sx={{ cursor: 'pointer', border: '1px dashed', borderColor: 'divider' }} onClick={() => navigate('/document-requests/new')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <EditNoteIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No document requests yet</Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>Have a lawyer prepare one →</Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>My Consultations</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {consultations.length > 0 ? (
            consultations.map((c) => (
              <Card key={c._id} sx={{ cursor: 'pointer' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 32, color: c.status === 'closed' ? 'success.main' : 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{c.legalCategory}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{c.city}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                      Status: {c.status.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card sx={{ cursor: 'pointer', border: '1px dashed', borderColor: 'divider' }} onClick={() => navigate('/consultations')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <GavelIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No consultation requests</Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>Get legal help now →</Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Card
          sx={{ background: 'linear-gradient(135deg, #6A1B9A15 0%, #6A1B9A05 100%)', border: '1px solid', borderColor: '#6A1B9A30', cursor: 'pointer', mb: 4 }}
          onClick={() => navigate('/subscription')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 32, color: '#6A1B9A' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Upgrade to Pro</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unlimited AI assistance & priority support</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 20, boxShadow: 4 }}
        onClick={() => navigate('/ai-assistant')}
      >
        <SmartToyIcon />
      </Fab>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.1)', zIndex: 1000 }}
        elevation={3}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          sx={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, height: 70 }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Get Help" icon={<GavelIcon />} />
          <BottomNavigationAction label="Alerts" icon={<NotificationsIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
