import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import SplashScreen from './components/SplashScreen';
import OnboardingScreens from './components/OnboardingScreens';
import AuthScreen from './components/AuthScreen';
import HomeDashboard from './components/HomeDashboard';
import AIAssistant from './components/AIAssistant';
import LegalWorkflow from './components/LegalWorkflow';
import DocumentPreview from './components/DocumentPreview';
import ConsultationRequest from './components/ConsultationRequest';
import NotificationsScreen from './components/NotificationsScreen';
import UserProfile from './components/UserProfile';
import SubscriptionPricing from './components/SubscriptionPricing';
import SettingsScreen from './components/SettingsScreen';
import EditProfile from './components/EditProfile';
import DocumentsList from './components/DocumentsList';
import RequestDocument from './components/RequestDocument';
import MyDocumentRequests from './components/MyDocumentRequests';
import ReviewAndSign from './components/ReviewAndSign';
import { isAuthenticated, clearTokens, logout, getPreferences } from '../lib/api';


function buildTheme(dark: boolean) {
  return createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: {
        main: '#1565C0',
        light: '#5E92F3',
        dark: '#003C8F',
      },
      secondary: {
        main: dark ? '#1E1E1E' : '#FFFFFF',
        contrastText: '#1565C0',
      },
      success: { main: '#4CAF50' },
      warning: { main: '#FFA726' },
      error: { main: '#EF5350' },
      background: {
        default: dark ? '#121212' : '#F5F5F5',
        paper: dark ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: dark ? '#E0E0E0' : '#212121',
        secondary: dark ? '#9E9E9E' : '#757575',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, fontSize: '1.75rem' },
      h5: { fontWeight: 600, fontSize: '1.5rem' },
      h6: { fontWeight: 600, fontSize: '1.25rem' },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    shadows: [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 4px 8px rgba(0, 0, 0, 0.08)',
      '0px 6px 12px rgba(0, 0, 0, 0.1)',
      '0px 8px 16px rgba(0, 0, 0, 0.12)',
      '0px 12px 24px rgba(0, 0, 0, 0.15)',
      '0px 16px 32px rgba(0, 0, 0, 0.18)',
      '0px 20px 40px rgba(0, 0, 0, 0.2)',
      '0px 24px 48px rgba(0, 0, 0, 0.22)',
      '0px 32px 64px rgba(0, 0, 0, 0.25)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
      '0px 2px 4px rgba(0, 0, 0, 0.05)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, padding: '12px 24px', fontSize: '1rem' },
          contained: {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
            '&:hover': { boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.12)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: 16, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)' } },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } },
        },
      },
    },
  });
}

export default function App() {
  const localDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const [showSplash, setShowSplash] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(() => localDev || localStorage.getItem('hasOnboarded') === 'true');
  const [authenticated, setAuthenticated] = useState(() => localDev || isAuthenticated());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const theme = useMemo(() => buildTheme(darkMode), [darkMode]);

  useEffect(() => {
    const onboarded = localStorage.getItem('hasOnboarded') === 'true';
    if (localDev && !getAccessToken()) {
      setTokens('local-dev-token');
    }
    setHasOnboarded(onboarded || localDev);
    setAuthenticated(isAuthenticated() || localDev);

    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, [localDev]);

  // Load dark mode preference from backend once authenticated
  useEffect(() => {
    if (!authenticated) return;
    getPreferences()
      .then((p) => {
        const dm = p.darkMode ?? false;
        setDarkMode(dm);
        localStorage.setItem('darkMode', String(dm));
      })
      .catch(() => {});
  }, [authenticated]);

  // Listen for instant dark mode toggle from SettingsScreen
  useEffect(() => {
    const handler = (e: Event) => {
      const dm = (e as CustomEvent<boolean>).detail;
      setDarkMode(dm);
    };
    window.addEventListener('darkModeChange', handler);
    return () => window.removeEventListener('darkModeChange', handler);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasOnboarded', 'true');
    setHasOnboarded(true);
  };

  const handleAuthSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    await logout();
    clearTokens();
    setAuthenticated(false);
  };

  if (showSplash) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SplashScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', maxWidth: '100vw', overflowX: 'hidden' }}>
        <BrowserRouter>
          <Routes>
            {!hasOnboarded && (
              <Route path="/onboarding" element={<OnboardingScreens onComplete={handleOnboardingComplete} />} />
            )}
            {!authenticated && hasOnboarded && (
              <Route path="/auth" element={<AuthScreen onAuthSuccess={handleAuthSuccess} />} />
            )}
            {authenticated && (
              <>
                <Route path="/" element={<HomeDashboard />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/legal-workflow/:type" element={<LegalWorkflow />} />
                <Route path="/document/:id" element={<DocumentPreview />} />
                <Route path="/consultations" element={<ConsultationRequest />} />
                <Route path="/notifications" element={<NotificationsScreen />} />
                <Route path="/profile" element={<UserProfile onLogout={handleLogout} />} />
                <Route path="/subscription" element={<SubscriptionPricing />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/documents" element={<DocumentsList />} />
                <Route path="/document-requests" element={<MyDocumentRequests />} />
                <Route path="/document-requests/new" element={<RequestDocument />} />
                <Route path="/document-requests/:id" element={<ReviewAndSign />} />

              </>
            )}
            <Route
              path="*"
              element={
                <Navigate
                  to={!hasOnboarded ? '/onboarding' : !authenticated ? '/auth' : '/'}
                  replace
                />
              }
            />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}
