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
  Avatar,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Snackbar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getLawyer, getLawyerAvailability, createBooking, pay, type Lawyer } from '../../lib/api';

const consultationTypes = [
  { value: 'video', label: 'Video Call', icon: VideoCallIcon, price: 2000 },
  { value: 'audio', label: 'Audio Call', icon: PhoneIcon, price: 1500 },
  { value: 'chat', label: 'Chat', icon: ChatIcon, price: 1000 },
];

function parseDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: dateStr,
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
    dayNum: d.getDate().toString(),
  };
}

export default function ConsultationBooking() {
  const navigate = useNavigate();
  const { lawyerId } = useParams<{ lawyerId: string }>();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [slots, setSlots] = useState<{ date: string; times: string[] }[]>([]);
  const [loadingLawyer, setLoadingLawyer] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [consultationType, setConsultationType] = useState('video');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!lawyerId) return;
    Promise.all([getLawyer(lawyerId), getLawyerAvailability(lawyerId)])
      .then(([l, availability]) => {
        setLawyer(l);
        setSlots(availability);
        if (availability.length > 0) {
          setSelectedDate(availability[0].date);
          if (availability[0].times.length > 0) setSelectedTime(availability[0].times[0]);
        }
      })
      .catch(() => setError('Failed to load lawyer details. Please go back and try again.'))
      .finally(() => setLoadingLawyer(false));
  }, [lawyerId]);

  const availableTimes = slots.find((s) => s.date === selectedDate)?.times ?? [];

  const selectedTypeInfo = consultationTypes.find((t) => t.value === consultationType)!;

  const handleBooking = async () => {
    if (!lawyerId || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');
    try {
      const booking = await createBooking({ lawyerId, date: selectedDate, time: selectedTime, type: consultationType });
      await pay(booking._id, selectedTypeInfo.price);
      setBookingSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/lawyers')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Book Consultation
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {loadingLawyer ? (
              <CircularProgress size={40} />
            ) : (
              <>
                <Avatar sx={{ width: 56, height: 56, backgroundColor: 'primary.main', fontSize: '1.5rem' }}>
                  {lawyer?.name.split(' ').find((w) => w !== 'Adv.')?.charAt(0) ?? 'L'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>{lawyer?.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    {lawyer?.specialty} • {lawyer?.experience} years exp
                  </Typography>
                  <Chip
                    label={lawyer?.availability || 'Available'}
                    color={lawyer?.availability?.includes('Today') ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2 }}>Select Consultation Type</Typography>
        <RadioGroup value={consultationType} onChange={(e) => setConsultationType(e.target.value)} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {consultationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Paper
                  key={type.value}
                  sx={{
                    border: '2px solid',
                    borderColor: consultationType === type.value ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setConsultationType(type.value)}
                >
                  <FormControlLabel
                    value={type.value}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, flex: 1 }}>
                        <Icon sx={{ fontSize: 28, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{type.label}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>₹{type.price}/hour</Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, p: 2, width: '100%' }}
                  />
                </Paper>
              );
            })}
          </Box>
        </RadioGroup>

        <Typography variant="h6" sx={{ mb: 2 }}>
          <CalendarMonthIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Select Date
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2, mb: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
          {slots.map((slot) => {
            const { date, day, dayNum } = parseDateLabel(slot.date);
            return (
              <Paper
                key={date}
                sx={{
                  minWidth: 70, p: 1.5, textAlign: 'center', cursor: 'pointer',
                  border: '2px solid',
                  borderColor: selectedDate === date ? 'primary.main' : 'divider',
                  backgroundColor: selectedDate === date ? 'primary.main' : 'white',
                  color: selectedDate === date ? 'white' : 'text.primary',
                  transition: 'all 0.2s',
                }}
                onClick={() => {
                  setSelectedDate(date);
                  if (slot.times.length > 0) setSelectedTime(slot.times[0]);
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>{day}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{dayNum}</Typography>
              </Paper>
            );
          })}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          <AccessTimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Select Time
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 3 }}>
          {availableTimes.map((time) => (
            <Chip
              key={time}
              label={time}
              onClick={() => setSelectedTime(time)}
              sx={{
                py: 2.5,
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: selectedTime === time ? 'primary.main' : 'white',
                color: selectedTime === time ? 'white' : 'text.primary',
                border: '2px solid',
                borderColor: selectedTime === time ? 'primary.main' : 'divider',
                '&:hover': { backgroundColor: selectedTime === time ? 'primary.dark' : 'grey.100' },
              }}
            />
          ))}
        </Box>

        <Paper sx={{ p: 2.5, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Booking Summary</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Lawyer</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{lawyer?.name ?? '—'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Consultation Type</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedTypeInfo.label}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Date & Time</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}, {selectedTime}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.3)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total Amount</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹{selectedTypeInfo.price}</Typography>
          </Box>
        </Paper>

        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={bookingSuccess ? <CheckCircleIcon /> : submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          onClick={handleBooking}
          disabled={bookingSuccess || submitting || !selectedDate || !selectedTime}
          sx={{ py: 1.5, fontSize: '1.05rem' }}
        >
          {bookingSuccess ? 'Booking Confirmed!' : submitting ? 'Processing...' : 'Confirm Booking & Pay'}
        </Button>
      </Box>

      <Snackbar
        open={bookingSuccess}
        message="Booking confirmed! Redirecting to home..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
