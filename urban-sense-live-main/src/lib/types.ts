export type Severity = "low" | "medium" | "high" | "critical";

export type DetectionType =
  | "pothole"
  | "road_damage"
  | "traffic_sign"
  | "damaged_sign"
  | "zebra_crossing"
  | "road_divider"
  | "waterlogging"
  | "traffic_congestion"
  | "pedestrian_risk"
  | "rash_driving"
  | "incident_vehicle";

export type ModuleStatus = "active" | "ready" | "pending" | "analytics";

export interface DetectionEvent {
  id: string;
  type: DetectionType;
  confidence: number;
  latitude: number;
  longitude: number;
  h3Index: string;
  busId: string;
  severity: Severity;
  timestamp: string;
  status: "open" | "acknowledged" | "resolved";
  simulated?: boolean;
  bbox?: [number, number, number, number];
}

export interface Zone {
  h3Index: string;
  /** grid coords for the hex map */
  q: number;
  r: number;
  center: { lat: number; lng: number };
  counts: Record<string, number>;
  incidents: number;
  roadHealth: number;
  traffic: "low" | "medium" | "high" | "severe";
  risk: Severity | "none";
  lastDetection?: string | undefined;
}

export interface Bus {
  id: string;
  route: string;
  status: "online" | "warning" | "offline";
  speed: number;
  lat: number;
  lng: number;
  gps: boolean;
  camera: boolean;
  ai: boolean;
  fps: number;
  detections: number;
  driver: string;
  trail: Array<[number, number]>;
}
