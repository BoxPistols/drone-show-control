'use client';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Typography,
  IconButton,
  Divider,
  Box,
} from '@mui/material';
import {
  Home,
  Public,
  ThreeDRotation,
  Pattern,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import Link from 'next/link';
import { useLayout } from '@/lib/layout/LayoutContext';
import { useTheme as useCustomTheme } from '@/lib/theme/ThemeProvider';

const drawerWidth = 240;

const navItems = [
  { text: 'Home', href: '/', icon: <Home /> },
  { text: '3D', href: '/3d', icon: <ThreeDRotation /> },
  { text: 'Map', href: '/map', icon: <Public /> },
  { text: 'Patterns', href: '/patterns', icon: <Pattern /> },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const theme = useTheme();
  const { mode, toggleTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setSidebarOpen(false);
  };

  const drawer = (
    <>
      {/* App Title Section */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" noWrap component="div">
          Drone Control
        </Typography>
        <Box>
          <IconButton
            size="small"
            onClick={toggleTheme}
            sx={{ color: 'primary.contrastText' }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Box>
      <Divider />

      {/* Navigation Menu */}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {drawer}
        </Drawer>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
}
