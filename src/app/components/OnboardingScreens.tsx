import { useState } from 'react';
import { Box, Typography, Button, MobileStepper } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import DescriptionIcon from '@mui/icons-material/Description';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GavelIcon from '@mui/icons-material/Gavel';

interface OnboardingScreensProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: DescriptionIcon,
    title: 'Generate Legal Documents',
    description: 'Create rent agreements, affidavits, legal notices, and more with AI assistance in minutes.',
    color: '#1565C0',
  },
  {
    icon: SmartToyIcon,
    title: 'AI Legal Guidance',
    description: 'Get instant answers to your legal questions from our intelligent AI assistant trained on Indian law.',
    color: '#00897B',
  },
  {
    icon: GavelIcon,
    title: 'Connect with Lawyers',
    description: 'Book consultations with verified legal experts for personalized advice when you need it.',
    color: '#6A1B9A',
  },
];

export default function OnboardingScreens({ onComplete }: OnboardingScreensProps) {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeStep === slides.length - 1) {
      onComplete();
      navigate('/auth');
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    navigate('/auth');
  };

  const currentSlide = slides[activeStep];
  const Icon = currentSlide.icon;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <Button
          onClick={handleSkip}
          sx={{
            color: 'text.secondary',
            fontSize: '0.95rem',
          }}
        >
          Skip
        </Button>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          pb: 10,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '32px',
                background: `linear-gradient(135deg, ${currentSlide.color}20 0%, ${currentSlide.color}10 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <Icon sx={{ fontSize: 70, color: currentSlide.color }} />
            </Box>

            <Typography
              variant="h5"
              sx={{
                mb: 2,
                px: 2,
                maxWidth: '400px',
              }}
            >
              {currentSlide.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: '350px',
                lineHeight: 1.7,
              }}
            >
              {currentSlide.description}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      <Box
        sx={{
          px: 4,
          pb: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <MobileStepper
          variant="dots"
          steps={slides.length}
          position="static"
          activeStep={activeStep}
          sx={{
            backgroundColor: 'transparent',
            justifyContent: 'center',
            '& .MuiMobileStepper-dot': {
              width: 8,
              height: 8,
              mx: 0.5,
            },
            '& .MuiMobileStepper-dotActive': {
              backgroundColor: 'primary.main',
              width: 24,
              borderRadius: 4,
            },
          }}
          nextButton={<div />}
          backButton={<div />}
        />

        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '1.05rem',
          }}
        >
          {activeStep === slides.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
      </Box>
    </Box>
  );
}
