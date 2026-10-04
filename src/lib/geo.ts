import campusData from '@/data/campus_buildings.json';
import { Building, LivePosition, RouteCalculation, CampusGraphNode, CampusGraphEdge } from './types';

const EARTH_RADIUS_METERS = 6371000;
const WALKING_SPEED_METERS_PER_SEC = 1.4; // Average human walking speed ~ 5 km/h
export const ARRIVAL_THRESHOLD_METERS = 25;

/**
 * Calculates great-circle distance between two geographic coordinates using Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function calculateWalkingEta(meters: number): {
  minutes: number;
  formattedEta: string;
} {
  const seconds = meters / WALKING_SPEED_METERS_PER_SEC;
  const minutes = Math.ceil(seconds / 60);

  let formattedEta = '~1 min walk';
  if (minutes <= 1) {
    formattedEta = '< 1 min walk';
  } else {
    formattedEta = `~${minutes} min walk`;
  }

  return { minutes, formattedEta };
}

// Map of graph nodes by ID
const nodeMap = new Map<string, CampusGraphNode>();
campusData.nodes.forEach((n) => {
  nodeMap.set(n.id, n as CampusGraphNode);
});

// Adjacency list for Dijkstra pathfinding along campus walkways
interface GraphEdgeWeight {
  to: string;
  weight: number;
}
const adjacencyList = new Map<string, GraphEdgeWeight[]>();

// Build undirected graph
campusData.edges.forEach((edge) => {
  const fromNode = nodeMap.get(edge.from);
  const toNode = nodeMap.get(edge.to);
  if (fromNode && toNode) {
    const dist = calculateHaversineDistance(
      fromNode.lat,
      fromNode.lng,
      toNode.lat,
      toNode.lng
    );

    if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
    if (!adjacencyList.has(edge.to)) adjacencyList.set(edge.to, []);

    adjacencyList.get(edge.from)!.push({ to: edge.to, weight: dist });
    adjacencyList.get(edge.to)!.push({ to: edge.from, weight: dist });
  }
});

/**
 * Finds the nearest graph walkway node to any coordinate.
 */
export function findNearestGraphNode(lat: number, lng: number): CampusGraphNode {
  let nearestNode = campusData.nodes[0] as CampusGraphNode;
  let minDistance = Infinity;

  campusData.nodes.forEach((n) => {
    const dist = calculateHaversineDistance(lat, lng, n.lat, n.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestNode = n as CampusGraphNode;
    }
  });

  return nearestNode;
}

/**
 * Dijkstra's shortest path algorithm over the authentic campus walkway network.
 */
export function findDijkstraWalkwayPath(
  startNodeId: string,
  endNodeId: string
): CampusGraphNode[] {
  if (startNodeId === endNodeId) {
    const node = nodeMap.get(startNodeId);
    return node ? [node] : [];
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  campusData.nodes.forEach((n) => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let currentId: string | null = null;
    let shortestDist = Infinity;

    unvisited.forEach((id) => {
      const d = distances.get(id) ?? Infinity;
      if (d < shortestDist) {
        shortestDist = d;
        currentId = id;
      }
    });

    if (currentId === null || shortestDist === Infinity) {
      break; // No reachable nodes left
    }

    if (currentId === endNodeId) {
      break; // Target reached
    }

    unvisited.delete(currentId);

    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (unvisited.has(neighbor.to)) {
        const alt = shortestDist + neighbor.weight;
        if (alt < (distances.get(neighbor.to) ?? Infinity)) {
          distances.set(neighbor.to, alt);
          previous.set(neighbor.to, currentId);
        }
      }
    }
  }

  // Reconstruct path
  const path: CampusGraphNode[] = [];
  let curr: string | null = endNodeId;

  while (curr !== null) {
    const node = nodeMap.get(curr);
    if (node) path.unshift(node);
    curr = previous.get(curr) || null;
  }

  if (path.length > 0 && path[0].id === startNodeId) {
    return path;
  }

  // Fallback to direct pair if disjoint
  const s = nodeMap.get(startNodeId);
  const e = nodeMap.get(endNodeId);
  return s && e ? [s, e] : [];
}

/**
 * Calculates live route geometry and walking distance along authentic campus walkways.
 */
export function computeLiveRoute(
  userPos: LivePosition | { lat: number; lng: number },
  destination: Building
): RouteCalculation {
  // 1. Direct Euclidean distance for arrival threshold check
  const directDistance = calculateHaversineDistance(
    userPos.lat,
    userPos.lng,
    destination.lat,
    destination.lng
  );
  const isArrived = directDistance < ARRIVAL_THRESHOLD_METERS;

  // 2. Map destination to building graph node
  const buildingNodeMapping = (campusData as any).building_nodes || {};
  const targetNodeId = buildingNodeMapping[destination.id] || `b_${destination.id}`;

  const nearestStartNode = findNearestGraphNode(userPos.lat, userPos.lng);
  const targetGraphNode = nodeMap.get(targetNodeId) || findNearestGraphNode(destination.lat, destination.lng);

  // 3. Compute walkway graph route
  const walkwayNodes = findDijkstraWalkwayPath(nearestStartNode.id, targetGraphNode.id);

  // 4. Assemble complete coordinates list [User GPS -> Waypoints -> Destination]
  const pathCoordinates: [number, number][] = [];
  pathCoordinates.push([userPos.lat, userPos.lng]);

  walkwayNodes.forEach((n) => {
    // Avoid duplicate points
    const last = pathCoordinates[pathCoordinates.length - 1];
    if (last[0] !== n.lat || last[1] !== n.lng) {
      pathCoordinates.push([n.lat, n.lng]);
    }
  });

  const lastPoint = pathCoordinates[pathCoordinates.length - 1];
  if (lastPoint[0] !== destination.lat || lastPoint[1] !== destination.lng) {
    pathCoordinates.push([destination.lat, destination.lng]);
  }

  // 5. Compute true cumulative walking distance along walkways
  let totalWalkwayDistance = 0;
  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    totalWalkwayDistance += calculateHaversineDistance(
      pathCoordinates[i][0],
      pathCoordinates[i][1],
      pathCoordinates[i + 1][0],
      pathCoordinates[i + 1][1]
    );
  }

  const finalDistance = Math.max(totalWalkwayDistance, directDistance);
  const { minutes: etaMinutes, formattedEta } = calculateWalkingEta(finalDistance);
  const formattedDistance = formatDistance(finalDistance);

  return {
    distanceMeters: finalDistance,
    formattedDistance,
    etaMinutes,
    formattedEta,
    pathCoordinates,
    isArrived,
    isDirectLine: false,
  };
}

export const CAMPUS_CENTER = campusData.campus_center;
export const MAIN_ENTRANCE_FALLBACK = {
  lat: 26.93675348229897,
  lng: 80.90468493469317,
  name: 'Main Entrance',
};
