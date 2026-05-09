import { Box, Typography } from '@mui/material';
import { motion } from 'motion/react';
import GavelIcon from '@mui/icons-material/Gavel';

export default function SplashScreen() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
        color: 'white',
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <GavelIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            NyayAI
          </Typography>

          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              textAlign: 'center',
              maxWidth: '280px',
            }}
          >
            Your AI Legal Assistant
          </Typography>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'white',
                mt: 2,
              }}
            />
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
}
