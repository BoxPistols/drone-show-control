'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import {
  Star,
  ChangeHistory,
  Circle,
  PlayArrow,
  Refresh,
  Download,
  Visibility,
} from '@mui/icons-material';
import { FormationGenerator } from '@/lib/drone-utils';
import { DroneFormation } from '@/types/drone';

interface PatternGeneratorProps {
  droneIds: string[];
  onPatternGenerated?: (formation: DroneFormation) => void;
  onPreview?: (formation: DroneFormation) => void;
  className?: string;
}

type PatternType = 'star' | 'triangle' | 'circle';

export default function PatternGenerator({
  droneIds,
  onPatternGenerated,
  onPreview,
  className = '',
}: PatternGeneratorProps) {
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('star');
  const [patternParams, setPatternParams] = useState({
    centerLat: 35.6762,
    centerLng: 139.6503,
    centerAlt: 50,
    size: 30,
    starPoints: 5,
    rotation: 0,
  });
  const [generatedFormation, setGeneratedFormation] =
    useState<DroneFormation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const patternOptions = [
    {
      type: 'star' as const,
      name: '星型フォーメーション',
      icon: <Star />,
      description: '複数の角を持つ星型パターン',
    },
    {
      type: 'triangle' as const,
      name: '三角形フォーメーション',
      icon: <ChangeHistory />,
      description: '正三角形の基本パターン',
    },
    {
      type: 'circle' as const,
      name: '円形フォーメーション',
      icon: <Circle />,
      description: '円周上の均等配置パターン',
    },
  ];

  const generatePattern = async () => {
    if (droneIds.length === 0) {
      alert('ドローンが選択されていません');
      return;
    }

    setIsGenerating(true);

    try {
      let formation: DroneFormation;

      switch (selectedPattern) {
        case 'star':
          formation = FormationGenerator.createStarFormation(
            patternParams.centerLat,
            patternParams.centerLng,
            patternParams.centerAlt,
            patternParams.size,
            patternParams.starPoints,
            droneIds
          );
          break;
        case 'triangle':
          formation = FormationGenerator.createTriangleFormation(
            patternParams.centerLat,
            patternParams.centerLng,
            patternParams.centerAlt,
            patternParams.size,
            droneIds
          );
          break;
        case 'circle':
          formation = FormationGenerator.createCircleFormation(
            patternParams.centerLat,
            patternParams.centerLng,
            patternParams.centerAlt,
            patternParams.size,
            droneIds
          );
          break;
        default:
          throw new Error('Unknown pattern type');
      }

      // Apply rotation if specified
      if (patternParams.rotation !== 0) {
        formation.rotation = patternParams.rotation;
      }

      setGeneratedFormation(formation);
      onPatternGenerated?.(formation);
    } catch (error) {
      console.error('Pattern generation failed:', error);
      alert('パターン生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPattern = () => {
    if (generatedFormation) {
      onPreview?.(generatedFormation);
    }
  };

  const exportPattern = () => {
    if (generatedFormation) {
      const dataStr = JSON.stringify(generatedFormation, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedFormation.name.replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const resetParams = () => {
    setPatternParams({
      centerLat: 35.6762,
      centerLng: 139.6503,
      centerAlt: 50,
      size: 30,
      starPoints: 5,
      rotation: 0,
    });
    setGeneratedFormation(null);
  };

  return (
    <Box className={`w-full ${className}`}>
      {/* Pattern Type Selection */}
      <Paper elevation={2} className="p-4 mb-4">
        <Typography variant="h6" className="mb-3">
          パターンタイプ選択
        </Typography>
        <Grid container spacing={2}>
          {patternOptions.map((option) => (
            <Grid size={{ xs: 12, md: 4 }} key={option.type}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPattern === option.type
                    ? 'ring-2 ring-drone-primary'
                    : ''
                }`}
                onClick={() => setSelectedPattern(option.type)}
              >
                <CardContent className="text-center">
                  <Box className="text-drone-primary mb-2 flex justify-center">
                    {option.icon}
                  </Box>
                  <Typography variant="subtitle2" className="font-semibold">
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Pattern Parameters */}
      <Paper elevation={2} className="p-4 mb-4">
        <Typography variant="h6" className="mb-3">
          パターンパラメータ
        </Typography>
        <Grid container spacing={3}>
          {/* Center Position */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" className="mb-3">
              中心座標
            </Typography>
            <Box className="space-y-3">
              <Box>
                <label
                  htmlFor="centerLat"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  緯度
                </label>
                <input
                  id="centerLat"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={patternParams.centerLat}
                  onChange={(e) =>
                    setPatternParams((prev) => ({
                      ...prev,
                      centerLat: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </Box>
              <Box>
                <label
                  htmlFor="centerLng"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  経度
                </label>
                <input
                  id="centerLng"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={patternParams.centerLng}
                  onChange={(e) =>
                    setPatternParams((prev) => ({
                      ...prev,
                      centerLng: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </Box>
              <Box>
                <label
                  htmlFor="centerAlt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  高度 (m)
                </label>
                <input
                  id="centerAlt"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={patternParams.centerAlt}
                  onChange={(e) =>
                    setPatternParams((prev) => ({
                      ...prev,
                      centerAlt: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </Box>
            </Box>
          </Grid>

          {/* Pattern Size */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" className="mb-3">
              パターンサイズ
            </Typography>
            <Box className="space-y-4">
              <Box>
                <label
                  htmlFor="patternSize"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  サイズ: {patternParams.size}m
                </label>
                <Slider
                  id="patternSize"
                  value={patternParams.size}
                  onChange={(_, value) =>
                    setPatternParams((prev) => ({
                      ...prev,
                      size: value as number,
                    }))
                  }
                  min={10}
                  max={100}
                  step={5}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Box>

            {/* Star-specific parameters */}
            {selectedPattern === 'star' && (
              <Box>
                <label
                  htmlFor="starPoints"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  星の角数: {patternParams.starPoints}
                </label>
                <Slider
                  id="starPoints"
                  value={patternParams.starPoints}
                  onChange={(_, value) =>
                    setPatternParams((prev) => ({
                      ...prev,
                      starPoints: value as number,
                    }))
                  }
                  min={3}
                  max={8}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}

            {/* Rotation */}
            <Box>
              <label
                htmlFor="rotation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                回転角度: {patternParams.rotation}°
              </label>
              <Slider
                id="rotation"
                value={patternParams.rotation}
                onChange={(_, value) =>
                  setPatternParams((prev) => ({
                    ...prev,
                    rotation: value as number,
                  }))
                }
                min={-180}
                max={180}
                step={15}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Control Buttons */}
      <Paper elevation={2} className="p-4 mb-4">
        <Typography variant="h6" className="mb-3">
          生成・制御
        </Typography>
        <Box className="flex gap-2 flex-wrap">
          <Button
            variant="contained"
            onClick={generatePattern}
            disabled={isGenerating || droneIds.length === 0}
            startIcon={<PlayArrow />}
            className="bg-drone-primary hover:bg-green-600"
          >
            {isGenerating ? '生成中...' : 'パターン生成'}
          </Button>

          <Button
            variant="outlined"
            onClick={previewPattern}
            disabled={!generatedFormation}
            startIcon={<Visibility />}
          >
            プレビュー
          </Button>

          <Button
            variant="outlined"
            onClick={exportPattern}
            disabled={!generatedFormation}
            startIcon={<Download />}
          >
            エクスポート
          </Button>

          <Button
            variant="outlined"
            onClick={resetParams}
            startIcon={<Refresh />}
          >
            リセット
          </Button>
        </Box>

        {/* Drone Count Info */}
        <Box className="mt-3">
          <Chip
            label={`使用ドローン数: ${droneIds.length}`}
            color={droneIds.length > 0 ? 'primary' : 'default'}
            size="small"
          />
        </Box>
      </Paper>

      {/* Generated Pattern Info */}
      {generatedFormation && (
        <Paper elevation={2} className="p-4">
          <Typography variant="h6" className="mb-3">
            生成されたパターン
          </Typography>
          <Box className="space-y-2">
            <Typography variant="body2">
              <strong>名前:</strong> {generatedFormation.name}
            </Typography>
            <Typography variant="body2">
              <strong>説明:</strong> {generatedFormation.description}
            </Typography>
            <Typography variant="body2">
              <strong>ドローン数:</strong>{' '}
              {generatedFormation.dronePositions.length}
            </Typography>
            <Typography variant="body2">
              <strong>中心位置:</strong> (
              {generatedFormation.centerPoint.latitude.toFixed(6)},
              {generatedFormation.centerPoint.longitude.toFixed(6)},
              {generatedFormation.centerPoint.altitude}m)
            </Typography>
            <Typography variant="body2">
              <strong>スケール:</strong> {generatedFormation.scale}
            </Typography>
            <Typography variant="body2">
              <strong>回転:</strong> {generatedFormation.rotation}°
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
