'use client';

import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import {
  Close,
  BatteryFull,
  LocationOn,
  Height,
  Schedule,
} from '@mui/icons-material';
import { DronePosition } from '@/types/drone';

interface DroneInfoPanelProps {
  drone: DronePosition | null;
  onClose: () => void;
  className?: string;
}

export function DroneInfoPanel({
  drone,
  onClose,
  className = '',
}: DroneInfoPanelProps) {
  if (!drone) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return '#4caf50'; // Green
    if (battery > 30) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Paper
      elevation={4}
      className={`absolute top-4 right-4 p-4 min-w-[300px] z-10 ${className}`}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* Header */}
      <Box className="flex items-center justify-between mb-3">
        <Typography variant="h6" className="font-semibold">
          {drone.name}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Divider className="mb-3" />

      {/* Status and Battery */}
      <Box className="mb-3">
        <Box className="flex items-center justify-between mb-2">
          <Chip
            label={drone.status.toUpperCase()}
            color={
              getStatusColor(drone.status) as
                | 'success'
                | 'warning'
                | 'error'
                | 'default'
                | 'primary'
            }
            size="small"
          />
          <Box className="flex items-center gap-1">
            <BatteryFull style={{ color: getBatteryColor(drone.battery) }} />
            <Typography
              variant="body2"
              style={{ color: getBatteryColor(drone.battery) }}
            >
              {drone.battery}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Position Data */}
      <Box className="mb-3">
        <Typography
          variant="subtitle2"
          className="mb-2 flex items-center gap-1"
        >
          <LocationOn fontSize="small" />
          Position
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Box className="bg-gray-50 p-2 rounded">
              <Typography variant="caption" color="textSecondary">
                Latitude
              </Typography>
              <Typography variant="body2" className="font-mono">
                {drone.latitude.toFixed(6)}°
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box className="bg-gray-50 p-2 rounded">
              <Typography variant="caption" color="textSecondary">
                Longitude
              </Typography>
              <Typography variant="body2" className="font-mono">
                {drone.longitude.toFixed(6)}°
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box className="bg-gray-50 p-2 rounded flex items-center gap-1">
              <Height fontSize="small" />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Altitude
                </Typography>
                <Typography variant="body2" className="font-mono">
                  {drone.altitude.toFixed(1)}m
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Light Settings (if available) */}
      {drone.lightColor && (
        <Box className="mb-3">
          <Typography variant="subtitle2" className="mb-2">
            Light Settings
          </Typography>
          <Box className="bg-gray-50 p-2 rounded">
            <Box className="flex items-center justify-between mb-1">
              <Typography variant="caption" color="textSecondary">
                Color
              </Typography>
              <Box
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: drone.lightColor }}
              />
            </Box>
            {drone.lightIntensity && (
              <Box className="flex items-center justify-between mb-1">
                <Typography variant="caption" color="textSecondary">
                  Intensity
                </Typography>
                <Typography variant="body2">
                  {drone.lightIntensity.toFixed(1)}
                </Typography>
              </Box>
            )}
            {drone.lightEffect && (
              <Box className="flex items-center justify-between">
                <Typography variant="caption" color="textSecondary">
                  Effect
                </Typography>
                <Chip
                  label={drone.lightEffect}
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Last Update */}
      <Box className="flex items-center gap-1">
        <Schedule fontSize="small" color="action" />
        <Typography variant="caption" color="textSecondary">
          Last Update: {formatTime(drone.lastUpdate)}
        </Typography>
      </Box>
    </Paper>
  );
}
