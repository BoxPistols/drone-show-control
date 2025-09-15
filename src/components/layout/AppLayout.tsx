'use client';

import { Box, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { Menu } from '@mui/icons-material';
import { Sidebar } from './Sidebar';
import { useLayout } from '@/lib/layout/LayoutContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const { toggleSidebar } = useLayout();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: isMobile ? 2 : 3,
          width: isMobile ? '100%' : 'calc(100% - 240px)',
        }}
      >
        {/* Mobile hamburger menu button */}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={toggleSidebar}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Menu />
            </IconButton>
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}
