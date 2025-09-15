export interface DronePosition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  status: 'active' | 'inactive' | 'warning' | 'error';
  battery: number;
  lastUpdate: Date;
}

export interface DroneShowPattern {
  id: string;
  name: string;
  type: 'star' | 'triangle' | 'circle' | 'line' | 'custom';
  positions: Array<{
    time: number;
    latitude: number;
    longitude: number;
    altitude: number;
  }>;
  duration: number;
  color?: string;
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface DroneShowEvent {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  drones: DronePosition[];
  patterns: DroneShowPattern[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

// Extended drone information for advanced control
export interface DroneInfo extends DronePosition {
  model: string;
  firmware: string;
  maxAltitude: number;
  maxSpeed: number;
  flightTime: number;
  homePosition: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  capabilities: DroneCapabilities;
}

export interface DroneCapabilities {
  hasCamera: boolean;
  hasLights: boolean;
  lightColors: string[];
  maxFlightTime: number;
  payload: number;
  weatherResistance: 'low' | 'medium' | 'high';
}

// Drone control commands
export interface DroneCommand {
  droneId: string;
  command: DroneCommandType;
  parameters: DroneCommandParameters;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'emergency';
}

export type DroneCommandType =
  | 'takeoff'
  | 'land'
  | 'hover'
  | 'move'
  | 'rotate'
  | 'light'
  | 'emergency_land'
  | 'return_home';

export interface DroneCommandParameters {
  position?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  rotation?: {
    yaw?: number;
    pitch?: number;
    roll?: number;
  };
  speed?: number;
  duration?: number;
  lightColor?: string;
  lightIntensity?: number;
}

// Formation control
export interface DroneFormation {
  id: string;
  name: string;
  description: string;
  dronePositions: Array<{
    droneId: string;
    relativePosition: {
      x: number;
      y: number;
      z: number;
    };
    role: 'leader' | 'follower' | 'anchor';
  }>;
  centerPoint: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  scale: number;
  rotation: number;
}

// Show sequence management
export interface ShowSequence {
  id: string;
  name: string;
  formations: Array<{
    formationId: string;
    startTime: number;
    duration: number;
    transition: TransitionType;
    transitionDuration: number;
  }>;
  totalDuration: number;
  music?: {
    filename: string;
    startOffset: number;
  };
}

export type TransitionType =
  | 'immediate'
  | 'fade'
  | 'slide'
  | 'spiral'
  | 'explosion'
  | 'custom';

// Flight plan and waypoints
export interface FlightPlan {
  droneId: string;
  waypoints: Waypoint[];
  totalDistance: number;
  estimatedFlightTime: number;
  safetyMargins: {
    altitudeBuffer: number;
    lateralBuffer: number;
    temporalBuffer: number;
  };
}

export interface Waypoint {
  id: string;
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  timestamp: number;
  speed: number;
  action?: WaypointAction;
}

export interface WaypointAction {
  type: 'hover' | 'light' | 'rotate' | 'wait';
  parameters: Record<string, unknown>;
  duration: number;
}

// Performance monitoring
export interface DronePerformanceMetrics {
  droneId: string;
  timestamp: Date;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    batteryTemperature: number;
    motorTemperatures: number[];
    gpsAccuracy: number;
    signalStrength: number;
    vibrationLevel: number;
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}
