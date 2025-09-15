'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  DarkMode,
  LightMode,
  MyLocation,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useDroneData } from '@/hooks/useDroneData';
import DroneMap from '@/components/map/DroneMap';
import { DronePosition } from '@/types/drone';

export default function MapPage() {
  const router = useRouter();
  const { mode, toggleTheme } = useTheme();
  const { drones, loading, error, refreshDroneData } = useDroneData();
  const [selectedDrone, setSelectedDrone] = useState<DronePosition | null>(
    null
  );

  const handleDroneClick = (drone: DronePosition) => {
    setSelectedDrone(drone);
  };

  const centerOnTokyo = () => {
    // This would typically update the map's viewState
    console.log('Centering on Tokyo');
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography variant="h6" className="mt-4">
            Loading drone data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Container maxWidth="sm">
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={refreshDroneData}
            fullWidth
            size="large"
          >
            Retry
          </Button>
        </Container>
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
            🗺️ Drone Map Control
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
      <Box className="flex flex-1 relative">
        {/* Map Container */}
        <Box className="flex-1 relative">
          <DroneMap
            drones={drones}
            onDroneClick={handleDroneClick}
            initialViewState={{
              latitude: 35.6762,
              longitude: 139.6503,
              zoom: 12,
            }}
          />

          {/* Floating Action Button */}
          <Fab
            color="primary"
            onClick={centerOnTokyo}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: 'var(--drone-primary)',
            }}
          >
            <MyLocation />
          </Fab>
        </Box>

        {/* Sidebar with Drone List */}
        <Box className="w-80 bg-background border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <Box className="p-4">
            <Typography variant="h6" className="mb-4">
              Active Drones (
              {drones.filter((d) => d.status === 'active').length})
            </Typography>

            <Box className="space-y-2">
              {drones.map((drone) => (
                <Card
                  key={drone.id}
                  elevation={selectedDrone?.id === drone.id ? 3 : 1}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDrone?.id === drone.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleDroneClick(drone)}
                >
                  <CardContent className="p-3">
                    <Box className="flex items-center justify-between mb-2">
                      <Typography variant="subtitle2" className="font-semibold">
                        {drone.name}
                      </Typography>
                      <Box
                        className="w-3 h-3 rounded-full"
                        sx={{
                          backgroundColor:
                            drone.status === 'active'
                              ? '#00ff88'
                              : drone.status === 'warning'
                                ? '#ffeb3b'
                                : drone.status === 'error'
                                  ? '#f44336'
                                  : '#9e9e9e',
                        }}
                      />
                    </Box>

                    <Box className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <Box className="flex justify-between">
                        <span>Battery:</span>
                        <span
                          className={
                            drone.battery > 30
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {drone.battery}%
                        </span>
                      </Box>
                      <Box className="flex justify-between">
                        <span>Altitude:</span>
                        <span>{drone.altitude}m</span>
                      </Box>
                      <Box className="flex justify-between">
                        <span>Status:</span>
                        <span
                          className={`uppercase text-xs font-semibold ${
                            drone.status === 'active'
                              ? 'text-green-600'
                              : drone.status === 'warning'
                                ? 'text-yellow-600'
                                : drone.status === 'error'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                          }`}
                        >
                          {drone.status}
                        </span>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
