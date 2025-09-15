import {
  DroneCommand,
  DroneFormation,
  FlightPlan,
  Waypoint,
  DroneShowPattern,
} from '@/types/drone';

// Formation generators
export class FormationGenerator {
  static createStarFormation(
    centerLat: number,
    centerLng: number,
    centerAlt: number,
    radius: number,
    points: number = 5,
    droneIds: string[]
  ): DroneFormation {
    const starPositions = [];
    const totalPoints = points * 2; // Inner and outer points

    for (let i = 0; i < Math.min(totalPoints, droneIds.length); i++) {
      const angle = (i * 2 * Math.PI) / totalPoints;
      const isOuter = i % 2 === 0;
      const currentRadius = isOuter ? radius : radius * 0.5;

      const x = Math.cos(angle) * currentRadius;
      const y = Math.sin(angle) * currentRadius;

      starPositions.push({
        droneId: droneIds[i],
        relativePosition: { x, y, z: 0 },
        role: (i === 0 ? 'leader' : 'follower') as
          | 'leader'
          | 'follower'
          | 'anchor',
      });
    }

    return {
      id: `formation-star-${Date.now()}`,
      name: `Star Formation (${points} points)`,
      description: `Star formation with ${points} points and radius ${radius}m`,
      dronePositions: starPositions,
      centerPoint: {
        latitude: centerLat,
        longitude: centerLng,
        altitude: centerAlt,
      },
      scale: 1,
      rotation: 0,
    };
  }

  static createTriangleFormation(
    centerLat: number,
    centerLng: number,
    centerAlt: number,
    sideLength: number,
    droneIds: string[]
  ): DroneFormation {
    const trianglePositions = [];
    const radius = sideLength / Math.sqrt(3); // Circumradius of equilateral triangle

    // Create vertices of equilateral triangle
    for (let i = 0; i < Math.min(3, droneIds.length); i++) {
      const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2; // Start from top
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      trianglePositions.push({
        droneId: droneIds[i],
        relativePosition: { x, y, z: 0 },
        role: (i === 0 ? 'leader' : 'follower') as
          | 'leader'
          | 'follower'
          | 'anchor',
      });
    }

    // Fill edges with additional drones
    let droneIndex = 3;
    for (let edge = 0; edge < 3 && droneIndex < droneIds.length; edge++) {
      const vertex1 = trianglePositions[edge];
      const vertex2 = trianglePositions[(edge + 1) % 3];

      // Add drones along the edge
      const edgeDrones = Math.floor((droneIds.length - 3) / 3);
      for (let j = 1; j <= edgeDrones && droneIndex < droneIds.length; j++) {
        const t = j / (edgeDrones + 1);
        const x: number =
          vertex1.relativePosition.x +
          t * (vertex2.relativePosition.x - vertex1.relativePosition.x);
        const y: number =
          vertex1.relativePosition.y +
          t * (vertex2.relativePosition.y - vertex1.relativePosition.y);

        trianglePositions.push({
          droneId: droneIds[droneIndex],
          relativePosition: { x, y, z: 0 },
          role: 'follower' as 'leader' | 'follower' | 'anchor',
        });
        droneIndex++;
      }
    }

    return {
      id: `formation-triangle-${Date.now()}`,
      name: 'Triangle Formation',
      description: `Equilateral triangle formation with ${sideLength}m sides`,
      dronePositions: trianglePositions,
      centerPoint: {
        latitude: centerLat,
        longitude: centerLng,
        altitude: centerAlt,
      },
      scale: 1,
      rotation: 0,
    };
  }

  static createCircleFormation(
    centerLat: number,
    centerLng: number,
    centerAlt: number,
    radius: number,
    droneIds: string[]
  ): DroneFormation {
    const circlePositions = [];

    for (let i = 0; i < droneIds.length; i++) {
      const angle = (i * 2 * Math.PI) / droneIds.length;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      circlePositions.push({
        droneId: droneIds[i],
        relativePosition: { x, y, z: 0 },
        role: (i === 0 ? 'leader' : 'follower') as
          | 'leader'
          | 'follower'
          | 'anchor',
      });
    }

    return {
      id: `formation-circle-${Date.now()}`,
      name: 'Circle Formation',
      description: `Circular formation with ${radius}m radius`,
      dronePositions: circlePositions,
      centerPoint: {
        latitude: centerLat,
        longitude: centerLng,
        altitude: centerAlt,
      },
      scale: 1,
      rotation: 0,
    };
  }
}

// Flight planning utilities
export class FlightPlanner {
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  static generateFlightPlan(
    droneId: string,
    waypoints: Waypoint[],
    defaultSpeed: number = 5
  ): FlightPlan {
    let totalDistance = 0;
    let estimatedFlightTime = 0;

    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];

      const distance = this.calculateDistance(
        prev.position.latitude,
        prev.position.longitude,
        curr.position.latitude,
        curr.position.longitude
      );

      // Add altitude difference
      const altitudeDiff = Math.abs(
        curr.position.altitude - prev.position.altitude
      );
      const totalSegmentDistance = Math.sqrt(
        distance * distance + altitudeDiff * altitudeDiff
      );

      totalDistance += totalSegmentDistance;

      // Calculate time based on speed
      const speed = prev.speed || defaultSpeed;
      estimatedFlightTime += totalSegmentDistance / speed;

      // Add action time if any
      if (curr.action) {
        estimatedFlightTime += curr.action.duration;
      }
    }

    return {
      droneId,
      waypoints,
      totalDistance,
      estimatedFlightTime,
      safetyMargins: {
        altitudeBuffer: 5,
        lateralBuffer: 10,
        temporalBuffer: 2,
      },
    };
  }

  static validateFlightPlan(plan: FlightPlan): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check altitude limits
    for (const waypoint of plan.waypoints) {
      if (waypoint.position.altitude > 400) {
        errors.push(`Waypoint ${waypoint.id}: Altitude exceeds 400m limit`);
      }
      if (waypoint.position.altitude < 0) {
        errors.push(`Waypoint ${waypoint.id}: Altitude cannot be negative`);
      }
    }

    // Check speed limits
    for (const waypoint of plan.waypoints) {
      if (waypoint.speed > 20) {
        errors.push(`Waypoint ${waypoint.id}: Speed exceeds 20 m/s limit`);
      }
    }

    // Check minimum distance between waypoints
    for (let i = 1; i < plan.waypoints.length; i++) {
      const distance = this.calculateDistance(
        plan.waypoints[i - 1].position.latitude,
        plan.waypoints[i - 1].position.longitude,
        plan.waypoints[i].position.latitude,
        plan.waypoints[i].position.longitude
      );

      if (distance < 1) {
        errors.push(
          `Waypoints ${plan.waypoints[i - 1].id} and ${plan.waypoints[i].id}: Too close together`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Show pattern utilities
export class ShowPatternUtils {
  static createPatternFromFormation(
    formation: DroneFormation,
    duration: number,
    color?: string
  ): DroneShowPattern {
    const positions = formation.dronePositions.map((dronePos, index) => {
      // Convert relative position to GPS coordinates
      // This is a simplified conversion - in production, use proper coordinate transformation
      const latOffset = dronePos.relativePosition.y / 111320; // Rough meters to degrees
      const lngOffset =
        dronePos.relativePosition.x /
        (111320 * Math.cos((formation.centerPoint.latitude * Math.PI) / 180));

      return {
        time: (index / formation.dronePositions.length) * 5, // Stagger arrival times
        latitude: formation.centerPoint.latitude + latOffset,
        longitude: formation.centerPoint.longitude + lngOffset,
        altitude: formation.centerPoint.altitude + dronePos.relativePosition.z,
      };
    });

    return {
      id: `pattern-${formation.id}`,
      name: `Pattern: ${formation.name}`,
      type: formation.name.toLowerCase().includes('star')
        ? 'star'
        : formation.name.toLowerCase().includes('triangle')
          ? 'triangle'
          : formation.name.toLowerCase().includes('circle')
            ? 'circle'
            : 'custom',
      positions,
      duration,
      color,
    };
  }

  static interpolateFormations(
    fromFormation: DroneFormation,
    toFormation: DroneFormation,
    steps: number = 10
  ): DroneFormation[] {
    const interpolatedFormations: DroneFormation[] = [];

    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const interpolatedPositions = fromFormation.dronePositions.map(
        (fromPos, index) => {
          const toPos = toFormation.dronePositions[index];
          if (!toPos) return fromPos;

          return {
            droneId: fromPos.droneId,
            relativePosition: {
              x:
                fromPos.relativePosition.x +
                t * (toPos.relativePosition.x - fromPos.relativePosition.x),
              y:
                fromPos.relativePosition.y +
                t * (toPos.relativePosition.y - fromPos.relativePosition.y),
              z:
                fromPos.relativePosition.z +
                t * (toPos.relativePosition.z - fromPos.relativePosition.z),
            },
            role: fromPos.role,
          };
        }
      );

      interpolatedFormations.push({
        id: `formation-interpolated-${step}`,
        name: `Interpolated ${step}/${steps}`,
        description: `Interpolation step ${step} from ${fromFormation.name} to ${toFormation.name}`,
        dronePositions: interpolatedPositions,
        centerPoint: {
          latitude:
            fromFormation.centerPoint.latitude +
            t *
              (toFormation.centerPoint.latitude -
                fromFormation.centerPoint.latitude),
          longitude:
            fromFormation.centerPoint.longitude +
            t *
              (toFormation.centerPoint.longitude -
                fromFormation.centerPoint.longitude),
          altitude:
            fromFormation.centerPoint.altitude +
            t *
              (toFormation.centerPoint.altitude -
                fromFormation.centerPoint.altitude),
        },
        scale:
          fromFormation.scale + t * (toFormation.scale - fromFormation.scale),
        rotation:
          fromFormation.rotation +
          t * (toFormation.rotation - fromFormation.rotation),
      });
    }

    return interpolatedFormations;
  }
}

// Command utilities
export class DroneCommandUtils {
  static createMoveCommand(
    droneId: string,
    latitude: number,
    longitude: number,
    altitude: number,
    speed: number = 5
  ): DroneCommand {
    return {
      droneId,
      command: 'move',
      parameters: {
        position: { latitude, longitude, altitude },
        speed,
      },
      timestamp: new Date(),
      priority: 'normal',
    };
  }

  static createLightCommand(
    droneId: string,
    color: string,
    intensity: number = 100
  ): DroneCommand {
    return {
      droneId,
      command: 'light',
      parameters: {
        lightColor: color,
        lightIntensity: intensity,
      },
      timestamp: new Date(),
      priority: 'normal',
    };
  }

  static createEmergencyLandCommand(droneId: string): DroneCommand {
    return {
      droneId,
      command: 'emergency_land',
      parameters: {},
      timestamp: new Date(),
      priority: 'emergency',
    };
  }
}
