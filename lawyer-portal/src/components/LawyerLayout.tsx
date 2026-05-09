import { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Divider,
  Avatar,
  ListItemButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Briefcase, 
  IndianRupee, 
  User, 
  LogOut,
  Menu
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router';

const drawerWidth = 260;

export default function LawyerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [available, setAvailable] = useState(true);

  const menuItems = [
    { text: 'My Cases', icon: <Briefcase size={20} />, path: '/' },
    { text: 'Earnings', icon: <IndianRupee size={20} />, path: '/earnings' },
    { text: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('lawyerToken');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#002B5B', color: 'white' }}>
      <Toolbar sx={{ py: 3, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: '#FFD369', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ color: '#002B5B', fontWeight: 900 }}>N</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>NyayAI Lawyer</Typography>
        </Box>
      </Toolbar>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Box sx={{ px: 3, py: 2 }}>
        <FormControlLabel
          control={<Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} color="warning" />}
          label={<Typography variant="caption" sx={{ fontWeight: 700 }}>{available ? 'ONLINE' : 'OFFLINE'}</Typography>}
          sx={{ color: available ? '#FFD369' : 'rgba(255,255,255,0.5)' }}
        />
      </Box>

      <List sx={{ px: 2, py: 1, flex: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: active ? 'rgba(255,211,105,0.15)' : 'transparent',
                  borderLeft: active ? '4px solid #FFD369' : 'none',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                  transition: 'all 0.2s'
                }}
              >
                <ListItemIcon sx={{ color: active ? '#FFD369' : 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem', 
                    fontWeight: active ? 700 : 500,
                    color: active ? '#FFD369' : 'rgba(255,255,255,0.8)'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <List sx={{ px: 1 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#FF7676' }}>
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7F6' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <Menu />
          </IconButton>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {menuItems.find(i => i.path === location.pathname)?.text || 'Lawyer Portal'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#002B5B', fontWeight: 600, fontSize: '0.9rem' }}>L</Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
