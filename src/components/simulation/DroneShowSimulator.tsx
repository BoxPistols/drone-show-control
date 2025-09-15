'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slider,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Replay,
  Speed,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import DroneScene from '@/components/3d/DroneScene';
import { DroneFormation, DronePosition } from '@/types/drone';

interface DroneShowSimulatorProps {
  formations: DroneFormation[];
  onFormationChange?: (formation: DroneFormation, index: number) => void;
  className?: string;
}

interface SimulationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  currentFormationIndex: number;
  transitionProgress: number;
}

export default function DroneShowSimulator({
  formations,
  onFormationChange,
  className = '',
}: DroneShowSimulatorProps) {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isPlaying: false,
    currentTime: 0,
    duration: formations.length * 5, // 5秒ずつの基準
    speed: 1,
    currentFormationIndex: 0,
    transitionProgress: 0,
  });

  const [currentDrones, setCurrentDrones] = useState<DronePosition[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  // フォーメーションからドローンポジションを生成
  const generateDronesFromFormation = useCallback(
    (formation: DroneFormation, progress: number = 1): DronePosition[] => {
      // フォーメーションタイプに基づく色テーマを決定
      const getFormationColorTheme = (
        formationName: string,
        index: number,
        total: number
      ) => {
        const hueBase = (index / total) * 360;

        if (formationName.includes('Star')) {
          // 星形: 黄色〜オレンジ〜赤の暖色系
          const hue = 30 + (index % 5) * 15; // 30-90度（黄色からオレンジ）
          return {
            color: `hsl(${hue}, 100%, 60%)`,
            intensity: 2.5,
            effect: (index % 3 === 0 ? 'pulse' : 'steady') as
              | 'pulse'
              | 'steady',
          };
        } else if (formationName.includes('Triangle')) {
          // 三角形: 青〜紫の寒色系
          const hue = 200 + (index % 3) * 40; // 200-280度（青から紫）
          return {
            color: `hsl(${hue}, 80%, 65%)`,
            intensity: 2.0,
            effect: 'fade' as const,
          };
        } else if (formationName.includes('Circle')) {
          // 円形: 虹色のフルスペクトラム
          const hue = hueBase;
          return {
            color: `hsl(${hue}, 90%, 60%)`,
            intensity: 1.8,
            effect: (index % 4 === 0 ? 'strobe' : 'steady') as
              | 'strobe'
              | 'steady',
          };
        } else {
          // その他: ランダムな色
          const hue = Math.random() * 360;
          return {
            color: `hsl(${hue}, 85%, 65%)`,
            intensity: 2.0,
            effect: 'steady' as const,
          };
        }
      };

      return formation.dronePositions.map((pos, index) => {
        // 相対位置からGPS座標に変換
        const latOffset = pos.relativePosition.y / 111320;
        const lngOffset =
          pos.relativePosition.x /
          (111320 * Math.cos((formation.centerPoint.latitude * Math.PI) / 180));

        // アニメーション進行度を適用
        const targetLat = formation.centerPoint.latitude + latOffset;
        const targetLng = formation.centerPoint.longitude + lngOffset;
        const targetAlt =
          formation.centerPoint.altitude + pos.relativePosition.z;

        // 初期位置からの補間（中心から展開）
        const centerLat = formation.centerPoint.latitude;
        const centerLng = formation.centerPoint.longitude;
        const centerAlt = formation.centerPoint.altitude;

        // フォーメーション色テーマを取得
        const colorTheme = getFormationColorTheme(
          formation.name,
          index,
          formation.dronePositions.length
        );

        return {
          id: pos.droneId,
          name: `Light ${index + 1}`,
          latitude: centerLat + (targetLat - centerLat) * progress,
          longitude: centerLng + (targetLng - centerLng) * progress,
          altitude: centerAlt + (targetAlt - centerAlt) * progress,
          status: 'active' as const,
          battery: 90 + Math.random() * 10,
          lastUpdate: new Date(),
          // 花火のような光の表現
          lightColor: colorTheme.color,
          lightIntensity: colorTheme.intensity,
          lightEffect: colorTheme.effect,
        };
      });
    },
    []
  );

  // フォーメーション間の補間
  const interpolateBetweenFormations = useCallback(
    (
      fromFormation: DroneFormation,
      toFormation: DroneFormation,
      progress: number
    ): DronePosition[] => {
      const fromDrones = generateDronesFromFormation(fromFormation, 1);
      const toDrones = generateDronesFromFormation(toFormation, 1);

      return fromDrones.map((fromDrone, index) => {
        const toDrone = toDrones[index];
        if (!toDrone) return fromDrone;

        return {
          ...fromDrone,
          latitude:
            fromDrone.latitude +
            (toDrone.latitude - fromDrone.latitude) * progress,
          longitude:
            fromDrone.longitude +
            (toDrone.longitude - fromDrone.longitude) * progress,
          altitude:
            fromDrone.altitude +
            (toDrone.altitude - fromDrone.altitude) * progress,
        };
      });
    },
    [generateDronesFromFormation]
  );

  // アニメーションループ
  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed =
        (timestamp - startTimeRef.current) * simulationState.speed;
      const newTime = elapsed / 1000; // 秒に変換

      if (newTime >= simulationState.duration) {
        // シミュレーション終了
        setSimulationState((prev) => ({
          ...prev,
          isPlaying: false,
          currentTime: prev.duration,
          transitionProgress: 1,
        }));
        return;
      }

      // 現在のフォーメーションインデックスと進行度を計算
      const formationDuration = simulationState.duration / formations.length;
      const currentFormationIndex = Math.floor(newTime / formationDuration);
      const formationProgress =
        (newTime % formationDuration) / formationDuration;

      // フォーメーション間の遷移
      let currentDrones: DronePosition[];

      if (currentFormationIndex >= formations.length - 1) {
        // 最後のフォーメーション
        currentDrones = generateDronesFromFormation(
          formations[formations.length - 1],
          1
        );
      } else {
        // フォーメーション間の補間
        const fromFormation = formations[currentFormationIndex];
        const toFormation = formations[currentFormationIndex + 1];

        if (formationProgress < 0.8) {
          // フォーメーション保持期間
          currentDrones = generateDronesFromFormation(fromFormation, 1);
        } else {
          // 遷移期間（最後の20%）
          const transitionProgress = (formationProgress - 0.8) / 0.2;
          currentDrones = interpolateBetweenFormations(
            fromFormation,
            toFormation,
            transitionProgress
          );
        }
      }

      setCurrentDrones(currentDrones);
      setSimulationState((prev) => ({
        ...prev,
        currentTime: newTime,
        currentFormationIndex: Math.min(
          currentFormationIndex,
          formations.length - 1
        ),
        transitionProgress: formationProgress,
      }));

      // フォーメーション変更の通知
      if (onFormationChange && currentFormationIndex < formations.length) {
        onFormationChange(
          formations[currentFormationIndex],
          currentFormationIndex
        );
      }

      if (simulationState.isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    },
    [
      formations,
      simulationState.speed,
      simulationState.duration,
      simulationState.isPlaying,
      generateDronesFromFormation,
      interpolateBetweenFormations,
      onFormationChange,
    ]
  );

  // 再生制御
  const handlePlay = () => {
    setSimulationState((prev) => ({ ...prev, isPlaying: true }));
    startTimeRef.current = undefined;
  };

  const handlePause = () => {
    setSimulationState((prev) => ({ ...prev, isPlaying: false }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleStop = () => {
    setSimulationState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentFormationIndex: 0,
      transitionProgress: 0,
    }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    startTimeRef.current = undefined;

    // 初期フォーメーションに戻す
    if (formations.length > 0) {
      setCurrentDrones(generateDronesFromFormation(formations[0], 1));
    }
  };

  const handleReset = () => {
    handleStop();
  };

  const handleSpeedChange = (_: Event, newValue: number | number[]) => {
    setSimulationState((prev) => ({ ...prev, speed: newValue as number }));
  };

  const handleTimeChange = (_: Event, newValue: number | number[]) => {
    const newTime = newValue as number;
    setSimulationState((prev) => ({ ...prev, currentTime: newTime }));

    // 新しい時間に基づいてドローン位置を更新
    const formationDuration = simulationState.duration / formations.length;
    const formationIndex = Math.floor(newTime / formationDuration);
    const formationProgress = (newTime % formationDuration) / formationDuration;

    if (formationIndex < formations.length) {
      setCurrentDrones(
        generateDronesFromFormation(
          formations[formationIndex],
          formationProgress
        )
      );
    }
  };

  const handlePreviousFormation = () => {
    const newIndex = Math.max(0, simulationState.currentFormationIndex - 1);
    const newTime = newIndex * (simulationState.duration / formations.length);
    setSimulationState((prev) => ({
      ...prev,
      currentTime: newTime,
      currentFormationIndex: newIndex,
    }));
  };

  const handleNextFormation = () => {
    const newIndex = Math.min(
      formations.length - 1,
      simulationState.currentFormationIndex + 1
    );
    const newTime = newIndex * (simulationState.duration / formations.length);
    setSimulationState((prev) => ({
      ...prev,
      currentTime: newTime,
      currentFormationIndex: newIndex,
    }));
  };

  // アニメーション開始/停止
  useEffect(() => {
    if (simulationState.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulationState.isPlaying, animate]);

  // 初期フォーメーションの設定
  useEffect(() => {
    if (formations.length > 0 && currentDrones.length === 0) {
      setCurrentDrones(generateDronesFromFormation(formations[0], 1));
    }
  }, [formations, generateDronesFromFormation, currentDrones.length]);

  if (formations.length === 0) {
    return (
      <Paper className="p-4">
        <Typography variant="body1" color="textSecondary">
          シミュレーションするフォーメーションがありません。
        </Typography>
      </Paper>
    );
  }

  return (
    <Box className={`w-full ${className}`}>
      {/* 3Dシーン */}
      <Paper elevation={2} className="mb-4" style={{ height: '500px' }}>
        <DroneScene drones={currentDrones} className="w-full h-full" />
      </Paper>

      {/* 制御パネル */}
      <Paper elevation={2} className="p-4">
        <Box className="mb-4">
          <Typography variant="h6" className="mb-2">
            ドローンショー シミュレーター
          </Typography>
          <Box className="flex items-center gap-2 mb-2">
            <Chip
              label={`フォーメーション ${simulationState.currentFormationIndex + 1}/${formations.length}`}
              color="primary"
              size="small"
            />
            <Chip
              label={
                formations[simulationState.currentFormationIndex]?.name || 'N/A'
              }
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        {/* 進行度バー */}
        <Box className="mb-4">
          <Box className="flex justify-between mb-1">
            <Typography variant="caption">進行度</Typography>
            <Typography variant="caption">
              {Math.round(
                (simulationState.currentTime / simulationState.duration) * 100
              )}
              %
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={
              (simulationState.currentTime / simulationState.duration) * 100
            }
            className="mb-2"
          />
          <Slider
            value={simulationState.currentTime}
            onChange={handleTimeChange}
            min={0}
            max={simulationState.duration}
            step={0.1}
            disabled={simulationState.isPlaying}
          />
        </Box>

        {/* 制御ボタン */}
        <Box className="flex items-center justify-center gap-2 mb-4">
          <IconButton
            onClick={handlePreviousFormation}
            disabled={simulationState.isPlaying}
          >
            <SkipPrevious />
          </IconButton>

          {!simulationState.isPlaying ? (
            <IconButton onClick={handlePlay} color="primary" size="large">
              <PlayArrow />
            </IconButton>
          ) : (
            <IconButton onClick={handlePause} color="primary" size="large">
              <Pause />
            </IconButton>
          )}

          <IconButton onClick={handleStop}>
            <Stop />
          </IconButton>

          <IconButton onClick={handleReset}>
            <Replay />
          </IconButton>

          <IconButton
            onClick={handleNextFormation}
            disabled={simulationState.isPlaying}
          >
            <SkipNext />
          </IconButton>
        </Box>

        {/* 速度調整 */}
        <Box className="flex items-center gap-2">
          <Speed />
          <Typography variant="caption" className="min-w-[50px]">
            {simulationState.speed}x
          </Typography>
          <Slider
            value={simulationState.speed}
            onChange={handleSpeedChange}
            min={0.1}
            max={5}
            step={0.1}
            className="flex-1"
            disabled={simulationState.isPlaying}
          />
        </Box>
      </Paper>
    </Box>
  );
}
