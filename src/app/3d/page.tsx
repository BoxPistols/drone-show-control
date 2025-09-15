'use client';

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Paper,
  Button,
} from '@mui/material';
import {
  ArrowBack,
  DarkMode,
  LightMode,
  Refresh,
  ViewInAr,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useDroneData } from '@/hooks/useDroneData';
import DroneScene from '@/components/3d/DroneScene';

export default function Visualization3DPage() {
  const router = useRouter();
  const { mode, toggleTheme } = useTheme();
  const { drones, loading, error, refreshDroneData } = useDroneData();

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Typography variant="h6">Loading 3D visualization...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent>
            <Typography color="error" className="mb-4">
              {error}
            </Typography>
            <Button variant="contained" onClick={refreshDroneData} fullWidth>
              Retry
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen flex flex-col">
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/')}
            className="mr-2"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" className="flex-grow">
            🌟 3D Drone Visualization
          </Typography>
          <IconButton color="inherit" onClick={refreshDroneData}>
            <Refresh />
          </IconButton>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box className="flex flex-1">
        {/* 3D Scene */}
        <Box className="flex-1 relative">
          <DroneScene drones={drones} />

          {/* Controls Panel */}
          <Paper
            elevation={4}
            className="absolute top-4 left-4 p-4 min-w-64"
            sx={{ backgroundColor: 'background.paper', opacity: 0.95 }}
          >
            <Typography variant="h6" className="mb-3 flex items-center gap-2">
              <ViewInAr className="text-drone-primary" />
              3D Controls
            </Typography>

            <Box className="space-y-2 text-sm">
              <Typography variant="body2" color="textSecondary">
                • Mouse: Rotate view
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Scroll: Zoom in/out
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Right click + drag: Pan
              </Typography>
            </Box>

            <Box className="mt-4 space-y-2">
              <Box className="flex justify-between">
                <Typography variant="body2" color="textSecondary">
                  Active Drones:
                </Typography>
                <Typography variant="body2" className="text-drone-primary">
                  {drones.filter((d) => d.status === 'active').length}
                </Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography variant="body2" color="textSecondary">
                  Total Drones:
                </Typography>
                <Typography variant="body2">{drones.length}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Legend */}
          <Paper
            elevation={4}
            className="absolute bottom-4 left-4 p-3"
            sx={{ backgroundColor: 'background.paper', opacity: 0.95 }}
          >
            <Typography variant="subtitle2" className="mb-2">
              Status Legend
            </Typography>
            <Box className="space-y-1">
              <Box className="flex items-center gap-2">
                <Box
                  className="w-3 h-3 rounded"
                  sx={{ backgroundColor: '#00ff88' }}
                />
                <Typography variant="caption">Active</Typography>
              </Box>
              <Box className="flex items-center gap-2">
                <Box
                  className="w-3 h-3 rounded"
                  sx={{ backgroundColor: '#ffeb3b' }}
                />
                <Typography variant="caption">Warning</Typography>
              </Box>
              <Box className="flex items-center gap-2">
                <Box
                  className="w-3 h-3 rounded"
                  sx={{ backgroundColor: '#f44336' }}
                />
                <Typography variant="caption">Error</Typography>
              </Box>
              <Box className="flex items-center gap-2">
                <Box
                  className="w-3 h-3 rounded"
                  sx={{ backgroundColor: '#9e9e9e' }}
                />
                <Typography variant="caption">Inactive</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
