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
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

interface Plan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export default function SubscriptionPricing() {
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      color: '#757575',
      features: [
        '5 AI conversations per month',
        '2 document generations',
        'Basic legal templates',
        'Email support',
      ],
    },
    {
      name: 'Pro',
      price: 499,
      period: 'month',
      description: 'Best for individuals',
      popular: true,
      color: '#1565C0',
      features: [
        'Unlimited AI conversations',
        'Unlimited document generations',
        'All premium templates',
        'Priority lawyer matching',
        'Video consultations',
        '24/7 support',
        'Download in multiple formats',
      ],
    },
    {
      name: 'Business',
      price: 1999,
      period: 'month',
      description: 'For businesses & firms',
      color: '#6A1B9A',
      features: [
        'Everything in Pro',
        'Team collaboration (up to 10 users)',
        'Dedicated account manager',
        'Custom legal workflows',
        'API access',
        'Advanced analytics',
        'White-label option',
      ],
    },
  ];

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
          <IconButton edge="start" onClick={() => navigate('/profile')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Subscription & Pricing
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Choose Your Plan
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Select the perfect plan for your legal needs
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {plans.map((plan, index) => (
            <Card
              key={index}
              sx={{
                position: 'relative',
                border: '2px solid',
                borderColor: plan.popular ? 'primary.main' : 'divider',
                overflow: 'visible',
              }}
            >
              {plan.popular && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: 16 }} />}
                  label="Most Popular"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    fontWeight: 600,
                  }}
                />
              )}

              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      color: plan.color,
                    }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {plan.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: plan.color }}>
                      ₹{plan.price}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      /{plan.period}
                    </Typography>
                  </Box>
                </Box>

                <List sx={{ mb: 3, py: 0 }}>
                  {plan.features.map((feature, fIndex) => (
                    <ListItem key={fIndex} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: plan.color }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">{feature}</Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  variant={plan.popular ? 'contained' : 'outlined'}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    backgroundColor: plan.popular ? plan.color : 'transparent',
                    borderColor: plan.color,
                    color: plan.popular ? 'white' : plan.color,
                    '&:hover': {
                      backgroundColor: plan.popular ? plan.color : `${plan.color}15`,
                      borderColor: plan.color,
                    },
                  }}
                >
                  {plan.price === 0 ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card
          sx={{
            mt: 4,
            background: 'linear-gradient(135deg, #E3F2FD 0%, #F5F5F5 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              💎 All plans include:
            </Typography>
            <List dense sx={{ py: 0 }}>
              {[
                'Secure data encryption',
                'Regular feature updates',
                'Cancel anytime',
                '30-day money-back guarantee',
              ].map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="caption">{item}</Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
            mt: 3,
          }}
        >
          All prices are in Indian Rupees (₹). GST applicable as per law.
        </Typography>
      </Box>
    </Box>
  );
}
