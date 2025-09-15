'use client';

import { useState, useEffect } from 'react';
import { DronePosition } from '@/types/drone';

// Mock data for development - 東京周辺の座標
const generateMockDrones = (): DronePosition[] => {
  const basePositions = [
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo Station' },
    { lat: 35.6586, lng: 139.7454, name: 'Tokyo Skytree' },
    { lat: 35.6598, lng: 139.7006, name: 'Imperial Palace' },
    { lat: 35.6284, lng: 139.7387, name: 'Asakusa' },
    { lat: 35.6938, lng: 139.7036, name: 'Ueno Park' },
    { lat: 35.647, lng: 139.7164, name: 'Nihonbashi' },
    { lat: 35.6654, lng: 139.7707, name: 'Sumida Park' },
    { lat: 35.6809, lng: 139.7669, name: 'Kinshicho' },
    { lat: 35.698, lng: 139.7731, name: 'Oshiage' },
    { lat: 35.6433, lng: 139.6917, name: 'Marunouchi' },
    { lat: 35.6851, lng: 139.7528, name: 'Mukojima' },
    { lat: 35.6617, lng: 139.704, name: 'Tsukiji' },
  ];

  const statuses: DronePosition['status'][] = [
    'active',
    'active',
    'active',
    'active',
    'active',
    'active',
    'active',
    'warning',
    'active',
    'inactive',
    'active',
    'error',
  ];

  return basePositions.map((pos, index) => ({
    id: `drone-${index + 1}`,
    name: `Drone ${index + 1}`,
    latitude: pos.lat + (Math.random() - 0.5) * 0.01, // Add some randomness
    longitude: pos.lng + (Math.random() - 0.5) * 0.01,
    altitude: Math.floor(Math.random() * 100) + 50, // 50-150m
    status: statuses[index],
    battery: Math.floor(Math.random() * 60) + 40, // 40-100%
    lastUpdate: new Date(Date.now() - Math.random() * 300000), // Within last 5 minutes
  }));
};

export const useDroneData = () => {
  const [drones, setDrones] = useState<DronePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchDroneData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockDrones = generateMockDrones();
        setDrones(mockDrones);
        setError(null);
      } catch (err) {
        setError('Failed to fetch drone data');
        console.error('Error fetching drone data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDroneData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setDrones((currentDrones) =>
        currentDrones.map((drone) => ({
          ...drone,
          // Slightly update positions to simulate movement
          latitude: drone.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: drone.longitude + (Math.random() - 0.5) * 0.0001,
          altitude: Math.max(
            30,
            Math.min(200, drone.altitude + (Math.random() - 0.5) * 5)
          ),
          battery: Math.max(0, drone.battery - Math.random() * 0.1),
          lastUpdate: new Date(),
        }))
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshDroneData = () => {
    const mockDrones = generateMockDrones();
    setDrones(mockDrones);
  };

  return {
    drones,
    loading,
    error,
    refreshDroneData,
  };
};
