'use client';

import { useState, useEffect } from 'react';
import { DronePosition } from '@/types/drone';

const dummyDrones: DronePosition[] = [
  {
    id: 'drone-1',
    name: 'Alpha-1',
    latitude: 35.678,
    longitude: 139.655,
    altitude: 50,
    battery: 85,
    status: 'active',
    lastUpdate: new Date(),
  },
  {
    id: 'drone-2',
    name: 'Bravo-2',
    latitude: 35.675,
    longitude: 139.652,
    altitude: 60,
    battery: 25,
    status: 'warning',
    lastUpdate: new Date(),
  },
  {
    id: 'drone-3',
    name: 'Charlie-3',
    latitude: 35.679,
    longitude: 139.651,
    altitude: 55,
    battery: 95,
    status: 'active',
    lastUpdate: new Date(),
  },
  {
    id: 'drone-4',
    name: 'Delta-4',
    latitude: 35.676,
    longitude: 139.648,
    altitude: 0,
    battery: 10,
    status: 'error',
    lastUpdate: new Date(),
  },
  {
    id: 'drone-5',
    name: 'Echo-5',
    latitude: 35.674,
    longitude: 139.656,
    altitude: 70,
    battery: 70,
    status: 'active',
    lastUpdate: new Date(),
  },
];

export function useDroneData() {
  const [drones, setDrones] = useState<DronePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDroneData = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setDrones(dummyDrones);
      setLoading(false);
    }, 1000);
  };

  const refreshDroneData = () => {
    fetchDroneData();
  };

  useEffect(() => {
    fetchDroneData();
  }, []);

  return { drones, loading, error, refreshDroneData };
}
