import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Rating,
  Chip,
  Divider,
  TextField,
  Skeleton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import StarIcon from '@mui/icons-material/Star';
import { getLawyer, getLawyerReviews, submitReview, type Lawyer, type Review } from '../../lib/api';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

export default function LawyerProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const [reviewDialog, setReviewDialog] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getLawyer(id), getLawyerReviews(id)])
      .then(([l, r]) => { setLawyer(l); setReviews(r); })
      .catch(() => setSnackbar({ open: true, message: 'Failed to load profile' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async () => {
    if (!id || !myRating) return;
    setSubmitting(true);
    try {
      const review = await submitReview(id, myRating, myComment);
      setReviews((prev) => [review, ...prev]);
      setReviewDialog(false);
      setMyRating(0);
      setMyComment('');
      setSnackbar({ open: true, message: 'Review submitted — thank you!' });
    } catch (err: unknown) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Failed to submit review' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
            Lawyer Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        {/* Header card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={80} height={80} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="80%" height={22} />
                  <Skeleton variant="text" width="50%" height={22} />
                </Box>
              </Box>
            ) : lawyer && (
              <>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 80, height: 80, backgroundColor: 'primary.main', fontSize: '2rem' }}>
                    {lawyer.name.split(' ').find((w) => w !== 'Adv.')?.charAt(0) ?? 'L'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{lawyer.name}</Typography>
                      {lawyer.verified && <VerifiedIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {lawyer.specialty} • {lawyer.experience} years experience
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      {lawyer.city}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={lawyer.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {lawyer.rating} ({lawyer.reviewCount} reviews)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    label={lawyer.availability}
                    size="small"
                    color={lawyer.availability.includes('Today') ? 'success' : 'default'}
                  />
                  <Chip
                    label={`₹${lawyer.pricePerHour}/hour`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                {lawyer.bio && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {lawyer.bio}
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<VideoCallIcon />}
            sx={{ py: 1.5 }}
            onClick={() => navigate(`/booking/${id}`)}
            disabled={loading}
          >
            Book Consultation
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<StarIcon />}
            sx={{ py: 1.5 }}
            onClick={() => setReviewDialog(true)}
            disabled={loading}
          >
            Write Review
          </Button>
        </Box>

        {/* Reviews */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Reviews ({reviews.length})
        </Typography>

        {loading ? (
          [1, 2].map((i) => (
            <Card key={i} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <StarIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No reviews yet</Typography>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', cursor: 'pointer', mt: 0.5 }}
                onClick={() => setReviewDialog(true)}
              >
                Be the first to write a review
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviews.map((review, index) => {
              const userName = typeof review.userId === 'object' ? review.userId.name : 'User';
              const initial = userName.charAt(0).toUpperCase();
              return (
                <Card key={review._id || index}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, backgroundColor: 'secondary.main', color: 'primary.main', fontWeight: 700 }}>
                        {initial}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{userName}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{timeAgo(review.createdAt)}</Typography>
                        </Box>
                        <Rating value={review.rating} size="small" readOnly sx={{ mb: 0.5 }} />
                        {review.comment && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            {review.comment}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {index < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Review dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Your Rating</Typography>
              <Rating
                value={myRating}
                onChange={(_e, v) => setMyRating(v)}
                size="large"
              />
            </Box>
            <TextField
              label="Your Review (optional)"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Share your experience with this lawyer..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!myRating || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
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
