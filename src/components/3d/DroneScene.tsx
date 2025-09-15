'use client';

import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box as MuiBox } from '@mui/material';
import { DronePosition } from '@/types/drone';
import { DroneLight } from './DroneLight';
import * as THREE from 'three';

interface DroneSceneProps {
  drones?: DronePosition[];
  className?: string;
  showLabels?: boolean;
  lightIntensity?: number;
}

function Scene({
  drones = [],
  showLabels = false,
  lightIntensity = 1,
}: {
  drones: DronePosition[];
  showLabels?: boolean;
  lightIntensity?: number;
}) {
  useFrame((state) => {
    // 深い夜の霧効果（光をより幻想的に）
    if (!state.scene.fog) {
      state.scene.fog = new THREE.FogExp2(0x000011, 0.005);
    }
  });

  return (
    <>
      {/* 最小限の環境光（夜空を表現） */}
      <ambientLight intensity={0.05} color="#001122" />

      {/* 遠くの街明かり（微妙な雰囲気作り） */}
      <directionalLight
        position={[50, -5, 20]}
        intensity={0.1}
        color="#ffaa44"
        castShadow={false}
      />

      {/* 星空背景 */}
      <mesh position={[0, 40, 0]}>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial
          color="#000011"
          side={THREE.BackSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 地面（見えないが参考用） */}
      <mesh
        position={[0, -10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.1} />
      </mesh>

      {/* ドローンライト（メインの光の祭典） */}
      {drones.map((drone) => (
        <DroneLight
          key={drone.id}
          drone={drone}
          showLabels={showLabels}
          lightIntensity={lightIntensity}
        />
      ))}

      {/* カメラコントロール */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 5, 0]} // 空中を中心に
      />
    </>
  );
}

export default function DroneScene({
  drones = [],
  className = '',
  showLabels = false,
  lightIntensity = 1.0,
}: DroneSceneProps) {
  return (
    <MuiBox className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [20, 15, 20], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          background:
            'radial-gradient(ellipse at center, #000033 0%, #000000 100%)',
        }}
      >
        <Scene
          drones={drones}
          showLabels={showLabels}
          lightIntensity={lightIntensity}
        />
      </Canvas>
    </MuiBox>
  );
}
