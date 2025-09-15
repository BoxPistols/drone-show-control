'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Box, Paper, Typography, Chip, IconButton } from '@mui/material';
import { Flight, BatteryFull } from '@mui/icons-material';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { DronePosition, MapViewState } from '@/types/drone';

import 'maplibre-gl/dist/maplibre-gl.css';

interface DroneMapProps {
  drones?: DronePosition[];
  initialViewState?: Partial<MapViewState>;
  onDroneClick?: (drone: DronePosition) => void;
  className?: string;
}

const defaultViewState: MapViewState = {
  latitude: 35.6762,
  longitude: 139.6503,
  zoom: 12,
  bearing: 0,
  pitch: 0,
};

export default function DroneMap({
  drones = [],
  initialViewState = {},
  onDroneClick,
  className = '',
}: DroneMapProps) {
  const { mode } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [selectedDrone, setSelectedDrone] = useState<DronePosition | null>(
    null
  );

  const mapStyle =
    mode === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  const handleMarkerClick = useCallback(
    (drone: DronePosition) => {
      setSelectedDrone(drone);
      onDroneClick?.(drone);
    },
    [onDroneClick]
  );

  const getDroneColor = (status: DronePosition['status']) => {
    switch (status) {
      case 'active':
        return '#00ff88';
      case 'warning':
        return '#ffeb3b';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  // 地図初期化
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [
        initialViewState.longitude || defaultViewState.longitude,
        initialViewState.latitude || defaultViewState.latitude,
      ],
      zoom: initialViewState.zoom || defaultViewState.zoom,
    });

    // Navigation Controls
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'top-right'
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    initialViewState.latitude,
    initialViewState.longitude,
    initialViewState.zoom,
    mapStyle,
  ]);

  // マップスタイル更新
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  // ドローンマーカー更新
  useEffect(() => {
    if (!mapRef.current) return;

    // 既存のマーカーをクリア
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // 新しいマーカーを追加
    drones.forEach((drone) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'drone-marker';
      markerElement.style.cssText = `
        width: 32px;
        height: 32px;
        cursor: pointer;
        color: ${getDroneColor(drone.status)};
        filter: drop-shadow(0 0 6px currentColor);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        transform: rotate(45deg);
      `;
      markerElement.innerHTML = '✈️';

      const marker = new maplibregl.Marker(markerElement)
        .setLngLat([drone.longitude, drone.latitude])
        .addTo(mapRef.current!);

      markerElement.addEventListener('click', () => handleMarkerClick(drone));
      markersRef.current.set(drone.id, marker);
    });
  }, [drones, handleMarkerClick]);

  const DroneInfoPopup = ({ drone }: { drone: DronePosition }) => (
    <Paper
      elevation={8}
      className="absolute top-4 left-4 p-4 min-w-64 z-10"
      sx={{ backgroundColor: 'background.paper' }}
    >
      <Typography variant="h6" className="mb-2 flex items-center gap-2">
        <Flight sx={{ color: getDroneColor(drone.status) }} />
        {drone.name}
      </Typography>

      <Box className="space-y-2">
        <Box className="flex items-center justify-between">
          <Typography variant="body2" color="textSecondary">
            Status:
          </Typography>
          <Chip
            label={drone.status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: getDroneColor(drone.status),
              color: 'white',
            }}
          />
        </Box>

        <Box className="flex items-center justify-between">
          <Typography variant="body2" color="textSecondary">
            Battery:
          </Typography>
          <Box className="flex items-center gap-1">
            <BatteryFull
              sx={{
                color: drone.battery > 30 ? '#4caf50' : '#f44336',
                fontSize: 16,
              }}
            />
            <Typography variant="body2">{drone.battery}%</Typography>
          </Box>
        </Box>

        <Box className="flex items-center justify-between">
          <Typography variant="body2" color="textSecondary">
            Altitude:
          </Typography>
          <Typography variant="body2">{drone.altitude}m</Typography>
        </Box>

        <Box className="space-y-1">
          <Typography variant="body2" color="textSecondary">
            Position:
          </Typography>
          <Typography variant="caption" className="block">
            Lat: {drone.latitude.toFixed(6)}
          </Typography>
          <Typography variant="caption" className="block">
            Lng: {drone.longitude.toFixed(6)}
          </Typography>
        </Box>

        <Box className="flex items-center justify-between">
          <Typography variant="body2" color="textSecondary">
            Last Update:
          </Typography>
          <Typography variant="caption">
            {drone.lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      <IconButton
        size="small"
        onClick={() => setSelectedDrone(null)}
        sx={{ position: 'absolute', top: 4, right: 4 }}
      >
        ×
      </IconButton>
    </Paper>
  );

  return (
    <Box className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Drone Info Popup */}
      {selectedDrone && <DroneInfoPopup drone={selectedDrone} />}

      {/* Map Statistics */}
      <Paper
        elevation={4}
        className="absolute bottom-4 left-4 px-3 py-2"
        sx={{ backgroundColor: 'background.paper' }}
      >
        <Typography variant="caption" color="textSecondary">
          Active Drones: {drones.filter((d) => d.status === 'active').length} /{' '}
          {drones.length}
        </Typography>
      </Paper>
    </Box>
  );
}
