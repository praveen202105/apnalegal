import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Snackbar,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { getPlans, getCurrentPlan, upgradePlan, type Plan } from '../../lib/api';

const PLAN_COLORS: Record<string, string> = {
  free: '#757575',
  pro: '#1565C0',
  business: '#6A1B9A',
};

export default function SubscriptionPricing() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState('free');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPlans(), getCurrentPlan()])
      .then(([p, current]) => {
        setPlans(p);
        setCurrentPlanId(current.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlanId) return;
    setUpgrading(planId);
    try {
      await upgradePlan(planId);
      setCurrentPlanId(planId);
      setSnackbar({ open: true, message: `Upgraded to ${plans.find((p) => p.id === planId)?.name} plan!` });
    } catch (err: unknown) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Upgrade failed' });
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Subscription & Pricing
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Choose Your Plan</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Select the perfect plan for your legal needs
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={280} />)}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {plans.map((plan) => {
              const color = PLAN_COLORS[plan.id] || '#1565C0';
              const isCurrent = plan.id === currentPlanId;
              const isUpgrading = upgrading === plan.id;

              return (
                <Card
                  key={plan.id}
                  sx={{
                    position: 'relative',
                    border: '2px solid',
                    borderColor: plan.popular ? 'primary.main' : isCurrent ? 'success.main' : 'divider',
                    overflow: 'visible',
                  }}
                >
                  {plan.popular && !isCurrent && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: 16 }} />}
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: -12, right: 20, fontWeight: 600 }}
                    />
                  )}
                  {isCurrent && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                      label="Current Plan"
                      color="success"
                      size="small"
                      sx={{ position: 'absolute', top: -12, right: 20, fontWeight: 600 }}
                    />
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{plan.description}</Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color }}>₹{plan.price}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>/{plan.period}</Typography>
                      </Box>
                    </Box>

                    <List sx={{ mb: 3, py: 0 }}>
                      {plan.features.map((feature, fIndex) => (
                        <ListItem key={fIndex} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon sx={{ fontSize: 20, color }} />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">{feature}</Typography>} />
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      variant={plan.popular || isCurrent ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      disabled={isCurrent || isUpgrading}
                      onClick={() => handleUpgrade(plan.id)}
                      sx={{
                        py: 1.5,
                        backgroundColor: isCurrent ? 'success.main' : plan.popular ? color : 'transparent',
                        borderColor: color,
                        color: isCurrent || plan.popular ? 'white' : color,
                        '&:hover': { backgroundColor: isCurrent ? 'success.main' : plan.popular ? color : `${color}15`, borderColor: color },
                        '&.Mui-disabled': { opacity: isCurrent ? 1 : 0.6 },
                      }}
                    >
                      {isUpgrading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : isCurrent ? (
                        'Active Plan'
                      ) : plan.price === 0 ? (
                        'Downgrade to Free'
                      ) : (
                        'Upgrade Now'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #E3F2FD 0%, #F5F5F5 100%)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>💎 All plans include:</Typography>
            <List dense sx={{ py: 0 }}>
              {['Secure data encryption', 'Regular feature updates', 'Cancel anytime', '30-day money-back guarantee'].map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={<Typography variant="caption">{item}</Typography>} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 3 }}>
          All prices are in Indian Rupees (₹). GST applicable as per law.
        </Typography>
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
