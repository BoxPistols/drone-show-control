'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PlayArrow,
  AutoAwesome,
  Star,
  FiberManualRecord,
  Settings,
} from '@mui/icons-material';
import { FormationGenerator } from '@/lib/drone-utils';
import { DroneFormation, DronePosition } from '@/types/drone';
import DroneShowSimulator from '@/components/simulation/DroneShowSimulator';

interface PatternDemoProps {
  drones: DronePosition[];
  onDroneUpdate?: (drones: DronePosition[]) => void;
  className?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function PatternDemo({
  drones,
  onDroneUpdate,
  className = '',
}: PatternDemoProps) {
  const [selectedShowIndex, setSelectedShowIndex] = useState(0);
  const [currentFormation, setCurrentFormation] =
    useState<DroneFormation | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // 使用するドローンIDを制限（最大15機）
  const availableDroneIds = useMemo(() => {
    return drones.slice(0, Math.min(15, drones.length)).map((d) => d.id);
  }, [drones]);

  // デモ用のショーシーケンスを作成
  const demoShows = useMemo(() => {
    const centerLat = 35.6762;
    const centerLng = 139.6503;
    const centerAlt = 80;

    return [
      {
        id: 'basic-shapes',
        name: '基本図形ショー',
        description: '星形 → 三角形 → 円形の基本的なフォーメーション',
        formations: [
          FormationGenerator.createStarFormation(
            centerLat,
            centerLng,
            centerAlt,
            40,
            5,
            availableDroneIds
          ),
          FormationGenerator.createTriangleFormation(
            centerLat,
            centerLng,
            centerAlt,
            60,
            availableDroneIds
          ),
          FormationGenerator.createCircleFormation(
            centerLat,
            centerLng,
            centerAlt,
            35,
            availableDroneIds
          ),
        ],
      },
      {
        id: 'star-evolution',
        name: '星形進化ショー',
        description: '5角星 → 6角星 → 8角星への変化',
        formations: [
          FormationGenerator.createStarFormation(
            centerLat,
            centerLng,
            centerAlt,
            30,
            5,
            availableDroneIds
          ),
          FormationGenerator.createStarFormation(
            centerLat,
            centerLng,
            centerAlt,
            35,
            6,
            availableDroneIds
          ),
          FormationGenerator.createStarFormation(
            centerLat,
            centerLng,
            centerAlt,
            40,
            8,
            availableDroneIds
          ),
        ],
      },
      {
        id: 'size-variation',
        name: 'サイズ変化ショー',
        description: '円形フォーメーションのサイズ変化',
        formations: [
          FormationGenerator.createCircleFormation(
            centerLat,
            centerLng,
            centerAlt,
            20,
            availableDroneIds
          ),
          FormationGenerator.createCircleFormation(
            centerLat,
            centerLng,
            centerAlt,
            40,
            availableDroneIds
          ),
          FormationGenerator.createCircleFormation(
            centerLat,
            centerLng,
            centerAlt,
            60,
            availableDroneIds
          ),
          FormationGenerator.createCircleFormation(
            centerLat,
            centerLng,
            centerAlt,
            30,
            availableDroneIds
          ),
        ],
      },
      {
        id: 'complex-show',
        name: '複合演技ショー',
        description: '複数の図形を組み合わせた複雑な演技',
        formations: [
          FormationGenerator.createStarFormation(
            centerLat,
            centerLng,
            centerAlt,
            45,
            8,
            availableDroneIds
          ),
          FormationGenerator.createTriangleFormation(
            centerLat,
            centerLng + 0.001,
            centerAlt + 20,
            50,
            availableDroneIds
          ),
          FormationGenerator.createCircleFormation(
            centerLat,
            centerLng - 0.001,
            centerAlt - 10,
            40,
            availableDroneIds
          ),
          FormationGenerator.createStarFormation(
            centerLat,
            centerLng,
            centerAlt,
            35,
            5,
            availableDroneIds
          ),
        ],
      },
    ];
  }, [availableDroneIds]);

  const handleFormationChange = (formation: DroneFormation, _index: number) => {
    setCurrentFormation(formation);
    onDroneUpdate?.([]); // シミュレーター内でドローンを管理
  };

  const getShowIcon = (showId: string) => {
    switch (showId) {
      case 'basic-shapes':
        return <Settings />;
      case 'star-evolution':
        return <Star />;
      case 'size-variation':
        return <FiberManualRecord />;
      case 'complex-show':
        return <AutoAwesome />;
      default:
        return <PlayArrow />;
    }
  };

  if (availableDroneIds.length === 0) {
    return (
      <Paper className="p-4">
        <Alert severity="warning">
          ドローンデータが利用できません。ドローンを接続してください。
        </Alert>
      </Paper>
    );
  }

  return (
    <Box className={`w-full ${className}`}>
      {/* 情報バナー */}
      <Alert severity="info" icon={<AutoAwesome />} className="mb-4">
        ドローンショーのデモシミュレーション。複数のフォーメーションが時系列で変化する様子を確認できます。
        {availableDroneIds.length}機のドローンが使用されます。
      </Alert>

      {/* タブ */}
      <Paper elevation={2} className="mb-4">
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="ショー選択" />
          <Tab label="シミュレーション" />
        </Tabs>
      </Paper>

      {/* タブパネル */}
      <TabPanel value={tabValue} index={0}>
        {/* ショー選択 */}
        <Paper elevation={2} className="p-4 mb-4">
          <Typography variant="h6" className="mb-3">
            デモショー選択
          </Typography>
          <Grid container spacing={2}>
            {demoShows.map((show, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={show.id}>
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedShowIndex === index
                      ? 'ring-2 ring-drone-primary'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedShowIndex(index);
                    setTabValue(1); // シミュレーションタブに移動
                  }}
                >
                  <CardContent className="text-center p-3">
                    <Box className="text-drone-primary mb-2 flex justify-center">
                      {getShowIcon(show.id)}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      className="font-semibold mb-1"
                    >
                      {show.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      className="block mb-2"
                    >
                      {show.description}
                    </Typography>
                    <Chip
                      label={`${show.formations.length}フォーメーション`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* 選択されたショーの詳細 */}
        {demoShows[selectedShowIndex] && (
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="mb-2">
              {demoShows[selectedShowIndex].name} - フォーメーション一覧
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mb-3">
              {demoShows[selectedShowIndex].description}
            </Typography>
            <Box className="space-y-2">
              {demoShows[selectedShowIndex].formations.map(
                (formation, index) => (
                  <Box
                    key={formation.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <Chip label={`#${index + 1}`} size="small" />
                    <Typography variant="body2" className="flex-1">
                      {formation.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formation.dronePositions.length}機
                    </Typography>
                  </Box>
                )
              )}
            </Box>
            <Box className="mt-4">
              <Button
                variant="contained"
                onClick={() => setTabValue(1)}
                startIcon={<PlayArrow />}
                className="bg-drone-primary hover:bg-green-600"
              >
                シミュレーション開始
              </Button>
            </Box>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* シミュレーション */}
        <DroneShowSimulator
          formations={demoShows[selectedShowIndex]?.formations || []}
          onFormationChange={handleFormationChange}
          className="w-full"
        />

        {/* 現在のフォーメーション情報 */}
        {currentFormation && (
          <Paper elevation={1} className="mt-4 p-4">
            <Typography variant="h6" className="mb-2">
              現在のフォーメーション: {currentFormation.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mb-2">
              {currentFormation.description}
            </Typography>
            <Box className="flex gap-2 flex-wrap">
              <Chip
                label={`ドローン数: ${currentFormation.dronePositions.length}`}
                size="small"
              />
              <Chip
                label={`中心座標: ${currentFormation.centerPoint.latitude.toFixed(4)}, ${currentFormation.centerPoint.longitude.toFixed(4)}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`高度: ${currentFormation.centerPoint.altitude}m`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Paper>
        )}
      </TabPanel>
    </Box>
  );
}
