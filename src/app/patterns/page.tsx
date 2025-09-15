'use client';

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  DarkMode,
  LightMode,
  AutoAwesome,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useDroneData } from '@/hooks/useDroneData';
import PatternGenerator from '@/components/patterns/PatternGenerator';
import PatternDemo from '@/components/patterns/PatternDemo';
import DroneScene from '@/components/3d/DroneScene';
import DroneMap from '@/components/map/DroneMap';
import { DroneFormation, DronePosition } from '@/types/drone';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function PatternsPage() {
  const router = useRouter();
  const { mode, toggleTheme } = useTheme();
  const { drones, loading, error } = useDroneData();
  const [tabValue, setTabValue] = useState(0);
  const [currentFormation, setCurrentFormation] =
    useState<DroneFormation | null>(null);
  const [previewDrones, setPreviewDrones] = useState<DronePosition[]>([]);

  const handlePatternGenerated = (formation: DroneFormation) => {
    setCurrentFormation(formation);
    generatePreviewDrones(formation);
  };

  const handlePatternPreview = (formation: DroneFormation) => {
    generatePreviewDrones(formation);
    // Switch to visualization tab
    setTabValue(1);
  };

  const generatePreviewDrones = (formation: DroneFormation) => {
    // Convert formation positions to drone preview data
    const previewDrones: DronePosition[] = formation.dronePositions.map(
      (pos, index) => {
        // Convert relative position to GPS coordinates
        const latOffset = pos.relativePosition.y / 111320; // Rough meters to degrees
        const lngOffset =
          pos.relativePosition.x /
          (111320 * Math.cos((formation.centerPoint.latitude * Math.PI) / 180));

        return {
          id: pos.droneId,
          name: `Preview Drone ${index + 1}`,
          latitude: formation.centerPoint.latitude + latOffset,
          longitude: formation.centerPoint.longitude + lngOffset,
          altitude: formation.centerPoint.altitude + pos.relativePosition.z,
          status: 'active' as const,
          battery: 85 + Math.random() * 15, // Random battery between 85-100%
          lastUpdate: new Date(),
        };
      }
    );

    setPreviewDrones(previewDrones);
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Typography variant="h6">Loading pattern generator...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Alert severity="error" className="max-w-md">
          {error}
        </Alert>
      </Box>
    );
  }

  const droneIds = drones.map((drone) => drone.id);

  return (
    <Box className="min-h-screen flex flex-col">
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/')}
            className="mr-2"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" className="flex-grow">
            ✨ ドローンショーパターン生成
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box className="flex-1 p-4">
        {/* Info Banner */}
        <Alert severity="info" className="mb-4" icon={<AutoAwesome />}>
          ドローンショーのパターン生成とシミュレーション。カスタムパターンを作成するか、
          デモショーで複数のフォーメーションが動く様子を確認できます。
        </Alert>

        {/* Tabs */}
        <Paper elevation={2} className="mb-4">
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="パターン生成" />
            <Tab label="3Dプレビュー" />
            <Tab label="マッププレビュー" />
            <Tab label="ショーシミュレーション" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <PatternGenerator
            droneIds={droneIds}
            onPatternGenerated={handlePatternGenerated}
            onPreview={handlePatternPreview}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper elevation={2} className="h-96 md:h-[600px]">
            <DroneScene
              drones={previewDrones.length > 0 ? previewDrones : drones}
              className="w-full h-full"
            />
          </Paper>
          {currentFormation && (
            <Paper elevation={1} className="mt-4 p-4">
              <Typography variant="h6" className="mb-2">
                現在のフォーメーション: {currentFormation.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {currentFormation.description}
              </Typography>
              <Typography variant="caption" className="block mt-1">
                ドローン数: {currentFormation.dronePositions.length} | 中心位置:
                ({currentFormation.centerPoint.latitude.toFixed(4)},{' '}
                {currentFormation.centerPoint.longitude.toFixed(4)}) | 高度:{' '}
                {currentFormation.centerPoint.altitude}m
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper elevation={2} className="h-96 md:h-[600px]">
            <DroneMap
              drones={previewDrones.length > 0 ? previewDrones : drones}
              initialViewState={{
                latitude: currentFormation?.centerPoint.latitude || 35.6762,
                longitude: currentFormation?.centerPoint.longitude || 139.6503,
                zoom: 14,
              }}
              className="w-full h-full"
            />
          </Paper>
          {currentFormation && (
            <Paper elevation={1} className="mt-4 p-4">
              <Typography variant="h6" className="mb-2">
                マップビュー: {currentFormation.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                地図上でドローンの配置を確認できます。マーカーをクリックすると詳細情報が表示されます。
              </Typography>
            </Paper>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <PatternDemo
            drones={drones}
            onDroneUpdate={(updatedDrones) => {
              // シミュレーション中のドローン更新をハンドル
              setPreviewDrones(updatedDrones);
            }}
          />
        </TabPanel>
      </Box>
    </Box>
  );
}
