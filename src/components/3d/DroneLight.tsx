'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { DronePosition } from '@/types/drone';
import * as THREE from 'three';

interface DroneLightProps {
  drone: DronePosition;
  showLabels?: boolean;
  lightIntensity?: number;
}

export function DroneLight({
  drone,
  showLabels = false,
  lightIntensity = 1,
}: DroneLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  // ドローンのライト色とエフェクト設定
  const { color, glowIntensity, pulseSpeed } = useMemo(() => {
    // カスタム色が指定されている場合はそれを優先
    const baseColor =
      drone.lightColor ||
      (() => {
        switch (drone.status) {
          case 'active':
            return '#00ff88'; // 緑色の光
          case 'warning':
            return '#ffeb3b'; // 黄色の光
          case 'error':
            return '#ff4444'; // 赤色の光
          case 'inactive':
            return '#333333'; // 暗い灰色
          default:
            return '#ffffff'; // 白色の光
        }
      })();

    const baseIntensity = drone.lightIntensity || 2.0;

    // エフェクトに基づく設定
    switch (drone.lightEffect) {
      case 'pulse':
        return {
          color: baseColor,
          glowIntensity: baseIntensity * 1.5,
          pulseSpeed: 1.5,
        };
      case 'strobe':
        return {
          color: baseColor,
          glowIntensity: baseIntensity * 2.0,
          pulseSpeed: 8.0, // 高速点滅
        };
      case 'fade':
        return {
          color: baseColor,
          glowIntensity: baseIntensity * 0.8,
          pulseSpeed: 0.3, // ゆっくりフェード
        };
      case 'steady':
      default:
        return {
          color: baseColor,
          glowIntensity: baseIntensity,
          pulseSpeed: drone.status === 'warning' ? 2.0 : 0.0, // warning時のみ点滅
        };
    }
  }, [drone.status, drone.lightColor, drone.lightIntensity, drone.lightEffect]);

  // バッテリーレベルに基づく明度調整
  const batteryAlpha = Math.max(0.3, drone.battery / 100);

  // GPS座標を3D空間座標に変換
  const x = (drone.longitude - 139.6503) * 1000;
  const z = (drone.latitude - 35.6762) * 1000;
  const y = drone.altitude / 10;

  // アニメーション: 光の脈動エフェクト
  useFrame((state) => {
    if (lightRef.current && sphereRef.current && pulseSpeed > 0) {
      const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3 + 0.7;
      const finalIntensity =
        glowIntensity * lightIntensity * batteryAlpha * pulse;

      lightRef.current.intensity = finalIntensity;

      // 球体のスケールも脈動
      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.2;
      sphereRef.current.scale.setScalar(scale);
    } else if (lightRef.current) {
      // 点滅しない場合は固定の明度
      lightRef.current.intensity =
        glowIntensity * lightIntensity * batteryAlpha;
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* メインの光源（ドローンのLED） */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={glowIntensity * lightIntensity * batteryAlpha}
        distance={15}
        decay={2}
      />

      {/* 光る球体（光の可視化） */}
      <Sphere ref={sphereRef} args={[0.3]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={batteryAlpha}
          toneMapped={false} // HDR色彩を維持
        />
      </Sphere>

      {/* 光のハロー効果 */}
      <Sphere args={[0.6]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2 * batteryAlpha}
          side={THREE.BackSide} // 内側から光る
          blending={THREE.AdditiveBlending} // 加算合成で光る効果
        />
      </Sphere>

      {/* 外側のグロー */}
      <Sphere args={[1.0]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1 * batteryAlpha}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* ドローンの小さな本体（オプション） */}
      <Sphere args={[0.1]}>
        <meshStandardMaterial
          color="#111111"
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </Sphere>

      {/* ラベル（デバッグ用、オプション） */}
      {showLabels && (
        <group position={[0, 2, 0]}>
          <Sphere args={[0.05]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
        </group>
      )}
    </group>
  );
}
