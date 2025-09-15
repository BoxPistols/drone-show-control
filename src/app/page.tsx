'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Flight,
  LocationOn,
  Visibility,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function Home() {
  const { mode, toggleTheme } = useTheme();

  const stats = [
    { label: 'Active Drones', value: '12', icon: <Flight /> },
    { label: 'Locations', value: '3', icon: <LocationOn /> },
    { label: 'Live Shows', value: '2', icon: <Visibility /> },
  ];

  return (
    <Box className="min-h-screen">
      {/* App Bar */}
      <AppBar position="static" elevation={0} className="bg-drone-primary">
        <Toolbar>
          <Typography variant="h6" className="flex-grow">
            🚁 Drone Show Control
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" className="py-8">
        {/* Hero Section */}
        <Paper
          elevation={0}
          className="p-8 mb-8 text-center night-sky"
          sx={{ borderRadius: 3 }}
        >
          <Typography
            variant="h2"
            className="text-white mb-4 font-bold tracking-tight"
          >
            Drone Show Management
          </Typography>
          <Typography variant="h6" className="text-gray-300 mb-6">
            Advanced control system for spectacular drone shows
          </Typography>
          <Box className="flex gap-4 justify-center">
            <Button
              variant="contained"
              size="large"
              className="bg-drone-primary hover:bg-green-600 drone-glow"
              href="/map"
            >
              Open Map Control
            </Button>
            <Button
              variant="outlined"
              size="large"
              className="text-white"
              href="/3d"
            >
              View 3D Scene
            </Button>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} elevation={0} className="p-4 map-overlay">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box className="text-drone-primary opacity-60">
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Features Grid */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardContent className="p-6">
              <Typography variant="h5" className="mb-3 font-semibold">
                3D Visualization
              </Typography>
              <Typography color="textSecondary" className="mb-4">
                Real-time 3D simulation of drone formations and patterns
              </Typography>
              <Box className="h-32 bg-space-bg rounded-lg flex items-center justify-center">
                <Button
                  variant="contained"
                  className="bg-drone-primary hover:bg-green-600"
                  href="/3d"
                >
                  🌟 Launch 3D Scene
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-6">
              <Typography variant="h5" className="mb-3 font-semibold">
                Map Control
              </Typography>
              <Typography color="textSecondary" className="mb-4">
                GPS-based drone positioning with real-time tracking
              </Typography>
              <Box className="h-32 bg-map-day rounded-lg flex items-center justify-center">
                <Typography className="text-blue-600">
                  🗺️ Map Interface
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-6">
              <Typography variant="h5" className="mb-3 font-semibold">
                Pattern Designer
              </Typography>
              <Typography color="textSecondary" className="mb-4">
                Create custom flight patterns and formations
              </Typography>
              <Button
                variant="contained"
                className="bg-drone-secondary hover:bg-orange-600"
                fullWidth
                href="/patterns"
              >
                Pattern Generator
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-6">
              <Typography variant="h5" className="mb-3 font-semibold">
                Show Management
              </Typography>
              <Typography color="textSecondary" className="mb-4">
                Schedule and control multiple drone shows
              </Typography>
              <Button
                variant="contained"
                className="bg-drone-secondary hover:bg-orange-600"
                fullWidth
              >
                Manage Shows
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
