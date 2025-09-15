'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Star,
  ChangeHistory,
  Circle,
} from '@mui/icons-material';
import { FormationGenerator } from '@/lib/drone-utils';
import { DroneFormation, DronePosition } from '@/types/drone';

interface PatternDemoProps {
  drones: DronePosition[];
  onDroneUpdate?: (drones: DronePosition[]) => void;
  className?: string;
}

interface DemoPattern {
  id: string;
  name: string;
  icon: React.ReactNode;
  formation: DroneFormation;
  duration: number;
  description: string;
}

export default function PatternDemo({
  drones,
  onDroneUpdate,
  className = '',
}: PatternDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [animationId, setAnimationId] = useState<number | null>(null);

  // Create demo patterns
  const createDemoPatterns = (): DemoPattern[] => {
    const droneIds = drones
      .slice(0, Math.min(12, drones.length))
      .map((d) => d.id);
    const centerLat = 35.6762;
    const centerLng = 139.6503;
    const centerAlt = 80;

    return [
      {
        id: 'star-5',
        name: '5角星フォーメーション',
        icon: <Star />,
        formation: FormationGenerator.createStarFormation(
          centerLat,
          centerLng,
          centerAlt,
          40,
          5,
          droneIds
        ),
        duration: 8000, // 8 seconds
        description: '5つの角を持つ星型パターン',
      },
      {
        id: 'triangle',
        name: '三角形フォーメーション',
        icon: <ChangeHistory />,
        formation: FormationGenerator.createTriangleFormation(
          centerLat,
          centerLng,
          centerAlt,
          60,
          droneIds
        ),
        duration: 6000, // 6 seconds
        description: '正三角形の基本パターン',
      },
      {
        id: 'circle',
        name: '円形フォーメーション',
        icon: <Circle />,
        formation: FormationGenerator.createCircleFormation(
          centerLat,
          centerLng,
          centerAlt,
          35,
          droneIds
        ),
        duration: 7000, // 7 seconds
        description: '円周上の均等配置',
      },
      {
        id: 'star-8',
        name: '8角星フォーメーション',
        icon: <Star />,
        formation: FormationGenerator.createStarFormation(
          centerLat,
          centerLng,
          centerAlt,
          50,
          8,
          droneIds
        ),
        duration: 10000, // 10 seconds
        description: '8つの角を持つ複雑な星型',
      },
    ];
  };

  const [demoPatterns] = useState(() => createDemoPatterns());

  const animateToFormation = (
    fromDrones: DronePosition[],
    toFormation: DroneFormation,
    duration: number,
    onUpdate: (drones: DronePosition[]) => void,
    onComplete: () => void
  ) => {
    const startTime = Date.now();
    const startPositions = fromDrones.map((drone) => ({
      lat: drone.latitude,
      lng: drone.longitude,
      alt: drone.altitude,
    }));

    // Calculate target positions
    const targetPositions = toFormation.dronePositions.map((pos) => {
      const latOffset = pos.relativePosition.y / 111320;
      const lngOffset =
        pos.relativePosition.x /
        (111320 * Math.cos((toFormation.centerPoint.latitude * Math.PI) / 180));

      return {
        lat: toFormation.centerPoint.latitude + latOffset,
        lng: toFormation.centerPoint.longitude + lngOffset,
        alt: toFormation.centerPoint.altitude + pos.relativePosition.z,
      };
    });

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out)
      const easeInOut = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const updatedDrones = fromDrones.map((drone, index) => {
        const start = startPositions[index];
        const target = targetPositions[index] || start;

        return {
          ...drone,
          latitude: start.lat + (target.lat - start.lat) * easeInOut,
          longitude: start.lng + (target.lng - start.lng) * easeInOut,
          altitude: start.alt + (target.alt - start.alt) * easeInOut,
          status: 'active' as const,
          lastUpdate: new Date(),
        };
      });

      onUpdate(updatedDrones);
      setProgress((elapsed / duration) * 100);

      if (t < 1) {
        const id = requestAnimationFrame(animate);
        setAnimationId(id);
      } else {
        onComplete();
      }
    };

    animate();
  };

  const playDemo = () => {
    if (drones.length === 0) {
      alert('ドローンデータがありません');
      return;
    }

    setIsPlaying(true);
    setProgress(0);
    runPatternSequence(0);
  };

  const runPatternSequence = (patternIndex: number) => {
    if (patternIndex >= demoPatterns.length) {
      // Demo complete, restart
      setIsPlaying(false);
      setProgress(0);
      setCurrentPatternIndex(0);
      return;
    }

    const pattern = demoPatterns[patternIndex];
    setCurrentPatternIndex(patternIndex);

    animateToFormation(
      drones,
      pattern.formation,
      pattern.duration,
      (updatedDrones) => {
        onDroneUpdate?.(updatedDrones);
      },
      () => {
        // Wait a moment before next pattern
        setTimeout(() => {
          if (isPlaying) {
            runPatternSequence(patternIndex + 1);
          }
        }, 1000);
      }
    );
  };

  const pauseDemo = () => {
    setIsPlaying(false);
    if (animationId) {
      cancelAnimationFrame(animationId);
      setAnimationId(null);
    }
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentPatternIndex(0);
    if (animationId) {
      cancelAnimationFrame(animationId);
      setAnimationId(null);
    }
    // Reset drones to original positions
    onDroneUpdate?.(drones);
  };

  const playSpecificPattern = (patternIndex: number) => {
    if (isPlaying) {
      pauseDemo();
    }

    setCurrentPatternIndex(patternIndex);
    const pattern = demoPatterns[patternIndex];

    animateToFormation(
      drones,
      pattern.formation,
      pattern.duration,
      (updatedDrones) => {
        onDroneUpdate?.(updatedDrones);
      },
      () => {
        setProgress(100);
      }
    );
  };

  useEffect(() => {
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);

  return (
    <Box className={`w-full ${className}`}>
      {/* Demo Controls */}
      <Paper elevation={2} className="p-4 mb-4">
        <Typography variant="h6" className="mb-3">
          パターンデモンストレーション
        </Typography>

        <Box className="flex gap-2 mb-4">
          <Button
            variant="contained"
            onClick={playDemo}
            disabled={isPlaying || drones.length === 0}
            startIcon={<PlayArrow />}
            className="bg-drone-primary hover:bg-green-600"
          >
            全パターン再生
          </Button>

          <Button
            variant="outlined"
            onClick={pauseDemo}
            disabled={!isPlaying}
            startIcon={<Pause />}
          >
            一時停止
          </Button>

          <Button variant="outlined" onClick={stopDemo} startIcon={<Stop />}>
            停止
          </Button>
        </Box>

        {/* Progress */}
        {(isPlaying || progress > 0) && (
          <Box>
            <Box className="flex justify-between items-center mb-1">
              <Typography variant="caption">
                現在のパターン: {demoPatterns[currentPatternIndex]?.name}
              </Typography>
              <Typography variant="caption">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              className="mb-2"
            />
          </Box>
        )}

        {/* Status */}
        <Box className="flex gap-2">
          <Chip
            label={isPlaying ? '再生中' : '停止中'}
            color={isPlaying ? 'success' : 'default'}
            size="small"
          />
          <Chip
            label={`使用ドローン: ${Math.min(12, drones.length)}`}
            size="small"
          />
        </Box>
      </Paper>

      {/* Pattern Selection */}
      <Paper elevation={2} className="p-4">
        <Typography variant="h6" className="mb-3">
          個別パターン実行
        </Typography>

        <Grid container spacing={2}>
          {demoPatterns.map((pattern, index) => (
            <Grid item xs={12} sm={6} md={3} key={pattern.id}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentPatternIndex === index
                    ? 'ring-2 ring-drone-primary'
                    : ''
                }`}
                onClick={() => playSpecificPattern(index)}
              >
                <CardContent className="text-center p-3">
                  <Box className="text-drone-primary mb-2 flex justify-center">
                    {pattern.icon}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    className="font-semibold mb-1"
                  >
                    {pattern.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    className="block"
                  >
                    {pattern.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    className="block mt-1"
                  >
                    実行時間: {pattern.duration / 1000}秒
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    className="block"
                  >
                    ドローン数: {pattern.formation.dronePositions.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
