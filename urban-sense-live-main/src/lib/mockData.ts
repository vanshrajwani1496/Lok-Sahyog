import { CITY_CENTER, hexToH3, hexToLatLng } from "./h3Utils";
import type { Bus, DetectionEvent, DetectionType, ModuleStatus, Severity, Zone } from "./types";

export interface CapabilityDef {
  key: DetectionType;
  label: string;
  status: ModuleStatus;
  note: string;
}

export const CAPABILITIES: CapabilityDef[] = [
  { key: "pothole", label: "Pothole Detection", status: "active", note: "YOLO model deployed" },
  { key: "road_damage", label: "Road Damage", status: "ready", note: "Awaiting model weights" },
  { key: "traffic_sign", label: "Traffic Sign Detection", status: "pending", note: "Model pending" },
  { key: "zebra_crossing", label: "Zebra Crossing", status: "pending", note: "Model pending" },
  { key: "road_divider", label: "Road Divider", status: "pending", note: "Model pending" },
  { key: "waterlogging", label: "Waterlogging", status: "ready", note: "Dataset collection" },
  {
    key: "traffic_congestion",
    label: "Traffic Congestion",
    status: "analytics",
    note: "Heuristic analytics only",
  },
  {
    key: "pedestrian_risk",
    label: "Pedestrian / Child Crossing",
    status: "pending",
    note: "Model pending",
  },
  { key: "rash_driving", label: "Rash / Dangerous Driving", status: "pending", note: "Model pending" },
  {
    key: "incident_vehicle",
    label: "Incident Vehicle Tracking",
    status: "pending",
    note: "Model pending",
  },
];

export const TYPE_LABEL: Record<DetectionType, string> = {
  pothole: "Pothole",
  road_damage: "Road Damage",
  traffic_sign: "Traffic Sign",
  damaged_sign: "Damaged Sign",
  zebra_crossing: "Zebra Crossing",
  road_divider: "Road Divider",
  waterlogging: "Waterlogging",
  traffic_congestion: "Traffic Congestion",
  pedestrian_risk: "Pedestrian Risk",
  rash_driving: "Rash Driving",
  incident_vehicle: "Incident Vehicle",
};

export const ROUTES = ["8A (Secunderabad - Chandrayangutta)", "10K (Secunderabad - Sanath Nagar)", "5K (Mehdipatnam - Secunderabad)", "218 (Patancheru - Dilsukhnagar)", "49M (Secunderabad - Mehdipatnam)", "127K (Koti - Kondapur)"];

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random so SSR and client agree on initial data */
/* ------------------------------------------------------------------ */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const BASE_TIME = new Date().getTime();

export const GRID: Array<{ q: number; r: number }> = (() => {
  const cells: Array<{ q: number; r: number }> = [];
  for (let r = -6; r <= 6; r++) {
    for (let q = -7; q <= 7; q++) {
      if (Math.abs(q + r / 2) <= 8) cells.push({ q, r });
    }
  }
  return cells;
})();

export function buildZones(): Zone[] {
  const rng = makeRng(42);
  return GRID.map(({ q, r }) => {
    const center = hexToLatLng(q, r);
    const t = rng();
    return {
      h3Index: hexToH3(q, r),
      q,
      r,
      center,
      counts: {},
      incidents: 0,
      roadHealth: 100,
      traffic: t > 0.88 ? "severe" : t > 0.7 ? "high" : t > 0.4 ? "medium" : "low",
      risk: "none",
    } as Zone;
  });
}

export function buildBuses(): Bus[] {
  const rng = makeRng(7);
  const ids = ["042", "017", "021", "088", "104", "156", "203", "231", "277", "312", "334", "401"];
  const buses = ids.map((id, i) => {
    const status: Bus["status"] = i === 9 ? "offline" : i === 6 || i === 11 ? "warning" : "online";
    const lat = CITY_CENTER.lat + (rng() - 0.5) * 0.03;
    const lng = CITY_CENTER.lng + (rng() - 0.5) * 0.03;
    return {
      id: `BUS-${id}`,
      route: ROUTES[i % ROUTES.length]!,
      status,
      speed: status === "offline" ? 0 : Math.round(18 + rng() * 34),
      lat,
      lng,
      gps: status !== "offline",
      camera: status === "online",
      ai: status === "online",
      fps: status === "online" ? 28 + Math.round(rng() * 8) : 0,
      detections: Math.round(rng() * 16),
      driver: ["R. Kumar", "S. Reddy", "A. Fatima", "M. Rao", "P. Singh", "V. Nair"][i % 6]!,
      trail: Array.from({ length: 8 }, (_, k) => [
        lat + (k - 4) * 0.0016 + (rng() - 0.5) * 0.0008,
        lng + (k - 4) * 0.0021 + (rng() - 0.5) * 0.0008,
      ]) as Array<[number, number]>,
    };
  });
  buses.unshift({
    id: "ME (Demo Camera)",
    route: "Admin / Sensor Node",
    status: "online",
    speed: 0,
    lat: CITY_CENTER.lat,
    lng: CITY_CENTER.lng,
    gps: true,
    camera: true,
    ai: true,
    fps: 30,
    detections: 0,
    driver: "System Admin",
    trail: []
  });
  return buses;
}

const SEED_TYPES: Array<{ type: DetectionType; sim: boolean }> = [
  { type: "pothole", sim: false },
  { type: "pothole", sim: false },
  { type: "pothole", sim: false },
  { type: "road_damage", sim: true },
  { type: "pothole", sim: false },
  { type: "waterlogging", sim: true },
  { type: "pothole", sim: false },
  { type: "pedestrian_risk", sim: true },
  { type: "pothole", sim: false },
  { type: "traffic_congestion", sim: true },
];

export function severityFrom(confidence: number, type: DetectionType): Severity {
  if (type === "incident_vehicle" || type === "rash_driving") return "critical";
  if (confidence >= 0.92) return "high";
  if (confidence >= 0.8) return "medium";
  return "low";
}

export function buildSeedEvents(zones: Zone[], buses: Bus[]): DetectionEvent[] {
  const rng = makeRng(1337);
  const events: DetectionEvent[] = [];
  for (let i = 0; i < 58; i++) {
    const spec = SEED_TYPES[Math.floor(rng() * SEED_TYPES.length)]!;
    // Bias detections towards a handful of hotspot zones.
    const hotspot = rng() < 0.55;
    const zone = hotspot
      ? zones[Math.floor(rng() * 6) * 7 + 3]! || zones[0]!
      : zones[Math.floor(rng() * zones.length)]!;
    const conf = 0.62 + rng() * 0.36;
    const bus = buses[Math.floor(rng() * buses.length)]!;
    events.push({
      id: `INC-${1000 + i}`,
      type: spec.type,
      confidence: Math.round(conf * 100) / 100,
      latitude: Math.round((zone.center.lat + (rng() - 0.5) * 0.002) * 10000) / 10000,
      longitude: Math.round((zone.center.lng + (rng() - 0.5) * 0.002) * 10000) / 10000,
      h3Index: zone.h3Index,
      busId: bus.id,
      severity: severityFrom(conf, spec.type),
      timestamp: new Date(BASE_TIME - i * 1000 * 60 * (7 + Math.floor(rng() * 40))).toISOString(),
      status: i % 5 === 0 ? "resolved" : i % 3 === 0 ? "acknowledged" : "open",
      simulated: spec.sim,
    });
  }
  return events.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

/* ---------------------------- analytics --------------------------- */

export const POTHOLES_7D = [
  { day: "Mon", potholes: 22, damage: 6 },
  { day: "Tue", potholes: 31, damage: 8 },
  { day: "Wed", potholes: 27, damage: 5 },
  { day: "Thu", potholes: 38, damage: 11 },
  { day: "Fri", potholes: 44, damage: 9 },
  { day: "Sat", potholes: 29, damage: 7 },
  { day: "Sun", potholes: 18, damage: 4 },
];

export const SAFETY_TREND = [
  { day: "Mon", score: 76 },
  { day: "Tue", score: 78 },
  { day: "Wed", score: 80 },
  { day: "Thu", score: 79 },
  { day: "Fri", score: 82 },
  { day: "Sat", score: 83 },
  { day: "Sun", score: 82 },
];

export const VEHICLE_DENSITY_HOURLY = [
  { hour: "06", density: 18 },
  { hour: "08", density: 74 },
  { hour: "10", density: 52 },
  { hour: "12", density: 46 },
  { hour: "14", density: 44 },
  { hour: "16", density: 61 },
  { hour: "18", density: 88 },
  { hour: "20", density: 57 },
  { hour: "22", density: 24 },
];

export const VEHICLE_CLASSES = [
  { name: "Cars", value: 11240 },
  { name: "Motorcycles", value: 7420 },
  { name: "Auto-rickshaws", value: 3180 },
  { name: "Buses", value: 1690 },
  { name: "Trucks", value: 1301 },
];

export const BOTTLENECKS = [
  { route: "8A", location: "Panjagutta Junction", density: "Severe", delay: "9 min", status: "Active" },
  { route: "10K", location: "Ameerpet Flyover", density: "High", delay: "6 min", status: "Active" },
  { route: "5C", location: "Begumpet Rd", density: "High", delay: "5 min", status: "Easing" },
  { route: "218", location: "Jubilee Check Post", density: "Medium", delay: "3 min", status: "Active" },
  { route: "49M", location: "Khairatabad", density: "Severe", delay: "11 min", status: "Active" },
  { route: "127K", location: "Lakdikapul", density: "Medium", delay: "4 min", status: "Easing" },
  { route: "8A", location: "Somajiguda Circle", density: "Low", delay: "1 min", status: "Clear" },
  { route: "10K", location: "SR Nagar", density: "Medium", delay: "3 min", status: "Active" },
];

export const IMPLEMENTED = [
  "Phone camera streaming",
  "GPS acquisition",
  "Video reception on edge laptop",
  "Pothole AI detection (YOLO)",
  "Confidence filtering",
  "GPS-tagged detection events",
  "H3-based location mapping",
  "Live event visualization",
];

export const NEXT_MODULES = [
  "Road damage detection",
  "Traffic sign detection",
  "Zebra crossing detection",
  "Waterlogging detection",
  "Pedestrian risk detection",
  "Rash driving detection",
  "Incident vehicle tracking",
];
