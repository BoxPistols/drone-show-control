'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';
import { Box as MuiBox } from '@mui/material';
import { DronePosition } from '@/types/drone';
import * as THREE from 'three';

interface DroneSceneProps {
  drones?: DronePosition[];
  className?: string;
}

interface Drone3DProps {
  drone: DronePosition;
}

function Drone3D({ drone }: Drone3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => {
    switch (drone.status) {
      case 'active':
        return '#00ff88';
      case 'warning':
        return '#ffeb3b';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }, [drone.status]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  // Convert GPS coordinates to 3D space
  // This is a simplified conversion - in a real app you'd use proper projection
  const x = (drone.longitude - 139.6503) * 1000; // Center on Tokyo
  const z = (drone.latitude - 35.6762) * 1000;
  const y = drone.altitude / 10; // Scale altitude

  return (
    <group position={[x, y, z]}>
      {/* Drone body */}
      <Box ref={meshRef} args={[2, 0.5, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} />
      </Box>

      {/* Drone propellers */}
      <Sphere args={[0.3]} position={[-1, 0.5, -1]}>
        <meshStandardMaterial color="#333" />
      </Sphere>
      <Sphere args={[0.3]} position={[1, 0.5, -1]}>
        <meshStandardMaterial color="#333" />
      </Sphere>
      <Sphere args={[0.3]} position={[-1, 0.5, 1]}>
        <meshStandardMaterial color="#333" />
      </Sphere>
      <Sphere args={[0.3]} position={[1, 0.5, 1]}>
        <meshStandardMaterial color="#333" />
      </Sphere>

      {/* Drone label */}
      <Text
        position={[0, 3, 0]}
        fontSize={1}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {drone.name}
      </Text>

      {/* Battery indicator */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.7}
        color={drone.battery > 30 ? '#4caf50' : '#f44336'}
        anchorX="center"
        anchorY="middle"
      >
        {drone.battery}%
      </Text>
    </group>
  );
}

function Scene({ drones = [] }: { drones: DronePosition[] }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Ground plane */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a1a" opacity={0.8} transparent />
      </mesh>

      {/* Grid */}
      <gridHelper args={[100, 20, '#444', '#444']} position={[0, -4.9, 0]} />

      {/* Drones */}
      {drones.map((drone) => (
        <Drone3D key={drone.id} drone={drone} />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export default function DroneScene({
  drones = [],
  className = '',
}: DroneSceneProps) {
  return (
    <MuiBox className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)' }}
      >
        <Scene drones={drones} />
      </Canvas>
    </MuiBox>
  );
}
