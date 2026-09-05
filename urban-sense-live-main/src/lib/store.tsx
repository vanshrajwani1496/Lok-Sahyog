import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { connectEventSocket, type PotholeIncident } from "./api";
import { latLngToH3 } from "./h3Utils";
import { buildBuses, buildSeedEvents, buildZones, severityFrom, TYPE_LABEL } from "./mockData";
import { computeSafety, roadHealthFor, zoneRisk, type SafetyBreakdown } from "./scoring";
import type { Bus, DetectionEvent, DetectionType, Zone } from "./types";

const SEV_SCORE = { low: 0.5, medium: 1, high: 2, critical: 3 } as const;

function aggregate(zones: Zone[], events: DetectionEvent[]): Zone[] {
  const byZone = new Map<string, DetectionEvent[]>();
  for (const e of events) {
    const arr = byZone.get(e.h3Index);
    if (arr) arr.push(e);
    else byZone.set(e.h3Index, [e]);
  }
  const activeIds = new Set(zones.map((z) => z.h3Index));
  const extendedZones = [...zones];
  // Dynamically unfold the H3 matrix infinitely as the camera travels outside known bounds
  for (const [h3, list] of byZone.entries()) {
    if (!activeIds.has(h3)) {
      const p0 = list[0]!;
      const x = (p0.longitude - 78.4730) / 0.0034;
      const y = (p0.latitude - 17.3770) / 0.0032;
      extendedZones.push({
        h3Index: h3,
        q: Math.round(x - y / 2),
        r: Math.round(y),
        center: { lat: p0.latitude, lng: p0.longitude },
        risk: "none", incidents: 0, roadHealth: 100, counts: {}, traffic: "low"
      });
    }
  }
  return extendedZones.map((z) => {
    const list = byZone.get(z.h3Index) ?? [];
    const counts: Record<string, number> = {};
    let sev = 0;
    let incidents = 0;
    for (const e of list) {
      // Decompress the report payload so a single cell reflects massive incidents
      const rc = (e as any).reportCount || 1;
      counts[e.type] = (counts[e.type] ?? 0) + rc;
      sev += SEV_SCORE[e.severity] * rc;
      incidents += rc;
    }
    return {
      ...z,
      counts,
      incidents,
      roadHealth: roadHealthFor({ incidents }),
      risk: zoneRisk(incidents, sev),
      lastDetection: list[0]?.timestamp,
    };
  });
}

function potholeToEvent(pothole: PotholeIncident): DetectionEvent {
  const type: DetectionType = pothole.type || "pothole";
  const confidence = pothole.confidence ?? 0.9;
  return {
    id: `LIVE-${pothole.id}`,
    type,
    confidence,
    latitude: pothole.latitude,
    longitude: pothole.longitude,
    h3Index: pothole.h3_index || latLngToH3(pothole.latitude, pothole.longitude),
    busId: pothole.bus_id || "BUS-LIVE",
    severity: severityFrom(confidence, type),
    timestamp: pothole.timestamp || new Date().toISOString(),
    status: "open",
    simulated: false,
    reportCount: 1,
    bbox: pothole.bbox,
  } as DetectionEvent & { reportCount: number };
}

interface StoreValue {
  events: DetectionEvent[];
  zones: Zone[];
  buses: Bus[];
  safety: SafetyBreakdown;
  prevSafety: number;
  demoMode: boolean;
  toggleDemoMode: () => void;
  lastEvent: DetectionEvent | null;
  todayCount: number;
  prevTodayCount: number;
  selectedEventId: string | null;
  selectEvent: (id: string | null) => void;
  selectedZoneId: string | null;
  selectZone: (id: string | null) => void;
  markZoneMaintenance: (id: string) => void;
  setEventStatus: (id: string, status: DetectionEvent["status"]) => void;
  emitEvent: () => void;
  syncLivePotholes: (potholes: PotholeIncident[]) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

import { USE_MOCK } from "./api";

// Enforcing rigorous real-time purity. No mock traces.
const baseZones: Zone[] = [];
const baseBuses: Bus[] = [];
const baseEvents: DetectionEvent[] = [];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<DetectionEvent[]>(baseEvents);
  const [buses, setBuses] = useState<Bus[]>(baseBuses);
  const [demoMode, setDemoMode] = useState(false);
  const [lastEvent, setLastEvent] = useState<DetectionEvent | null>(null);
  const [selectedEventId, selectEvent] = useState<string | null>(null);
  const [selectedZoneId, selectZone] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState<string[]>([]);
  const counter = useRef(1058);
  const prevSafetyRef = useRef(0);
  const prevPotholeRef = useRef(0);

  const zones = useMemo(() => aggregate(baseZones, events), [events]);
  const safety = useMemo(() => computeSafety(events, zones), [events, zones]);
  const todayCount = useMemo(() => {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    return events.filter(e => new Date(e.timestamp).getTime() >= startOfDay).length;
  }, [events]);

  const prevSafety = prevSafetyRef.current || safety.overall;
  const prevTodayCount = prevPotholeRef.current || todayCount;

  // When events changes, simulate the "live pip" blink if there's a net-new detection today
  useEffect(() => {
    if (todayCount > prevPotholeRef.current) {
      prevPotholeRef.current = todayCount;
    }
  }, [todayCount]);

  const pushEvent = useCallback(
    (event: DetectionEvent) => {
      prevSafetyRef.current = safety.overall;
      prevPotholeRef.current = todayCount;
      setEvents((prev) => [event, ...prev]);
      setLastEvent(event);
      setBuses((prev) =>
        prev.map((b) => (b.id === event.busId ? { ...b, detections: b.detections + 1 } : b)),
      );
      toast(`NEW ROAD HAZARD — ${TYPE_LABEL[event.type]}`, {
        description: `${Math.round(event.confidence * 100)}% confidence · ${event.busId} · ${event.severity.toUpperCase()} risk zone`,
        action: { label: "View", onClick: () => selectEvent(event.id) },
      });
    },
    [safety.overall, todayCount],
  );

  const syncLivePotholes = useCallback(
    (potholes: PotholeIncident[]) => {
      setEvents((prev) => {
        const existingIds = new Set(prev.map((e) => e.id));
        const newEvents: DetectionEvent[] = [];

        for (const pothole of potholes) {
          const eventId = `LIVE-${pothole.id}`;
          if (!existingIds.has(eventId)) {
            newEvents.push(potholeToEvent(pothole));
          }
        }

        if (newEvents.length === 0) return prev;

        prevSafetyRef.current = safety.overall;
        prevPotholeRef.current = todayCount;
        return [...newEvents, ...prev];
      });

      setBuses((prev) => {
        const updated = [...prev];
        for (const pothole of potholes) {
          if (pothole.bus_id && !updated.some((b) => b.id === pothole.bus_id)) {
            updated.push({
              id: pothole.bus_id,
              route: "Live Hardware Sensor",
              status: "online",
              speed: 40,
              lat: pothole.latitude,
              lng: pothole.longitude,
              gps: true,
              camera: true,
              ai: true,
              fps: 30,
              detections: 1,
              driver: "Edge Device",
              trail: [[pothole.latitude, pothole.longitude]]
            });
          }
        }
        return updated;
      });
    },
    [safety.overall, todayCount],
  );

  const makeEvent = useCallback((): DetectionEvent => {
    const bus = buses.filter((b) => b.status === "online")[
      Math.floor(Math.random() * Math.max(1, buses.filter((b) => b.status === "online").length))
    ]!;
    const lat = bus.lat + (Math.random() - 0.5) * 0.004;
    const lng = bus.lng + (Math.random() - 0.5) * 0.004;
    const confidence = Math.round((0.72 + Math.random() * 0.26) * 100) / 100;
    const type: DetectionType = "pothole";
    counter.current += 1;
    return {
      id: `INC-${counter.current}`,
      type,
      confidence,
      latitude: Math.round(lat * 10000) / 10000,
      longitude: Math.round(lng * 10000) / 10000,
      h3Index: latLngToH3(lat, lng),
      busId: bus.id,
      severity: severityFrom(confidence, type),
      timestamp: new Date().toISOString(),
      status: "open",
    };
  }, [buses]);

  const emitEvent = useCallback(() => pushEvent(makeEvent()), [makeEvent, pushEvent]);

  // Demo mode simulation
  useEffect(() => {
    if (!demoMode) return;
    const move = setInterval(() => {
      setBuses((prev) => {
        const updatedBuses = [...prev];
        // Logic for updating buses
        return updatedBuses.map((b) =>
          b.status === "offline"
            ? b
            : {
              ...b,
              lat: b.lat + (Math.random() - 0.5) * 0.0016,
              lng: b.lng + (Math.random() - 0.5) * 0.0016,
              speed: Math.max(6, Math.min(58, b.speed + Math.round((Math.random() - 0.5) * 8))),
            },
        );
      });
    }, 2000);
    const detect = setInterval(() => pushEvent(makeEvent()), 7000);
    return () => {
      clearInterval(move);
      clearInterval(detect);
    };
  }, [demoMode, makeEvent, pushEvent]);

  // Live WebSocket backend channel
  useEffect(() => connectEventSocket(pushEvent), [pushEvent]);

  const value: StoreValue = {
    events,
    zones: zones.map((z) =>
      maintenance.includes(z.h3Index) ? { ...z, risk: z.risk, lastDetection: z.lastDetection } : z,
    ),
    buses,
    safety,
    prevSafety,
    demoMode,
    toggleDemoMode: () =>
      setDemoMode((d) => {
        toast(d ? "Demo mode disabled" : "Demo mode enabled", {
          description: d
            ? "Dashboard is idle and ready to connect to the FastAPI backend."
            : "Simulating bus movement, GPS and pothole detections.",
        });
        return !d;
      }),
    lastEvent,
    todayCount,
    prevTodayCount,
    selectedEventId,
    selectEvent,
    selectedZoneId,
    selectZone,
    markZoneMaintenance: (id) => {
      setMaintenance((m) => (m.includes(id) ? m : [...m, id]));
      toast.success("Zone flagged for maintenance", { description: id });
    },
    setEventStatus: (id, status) =>
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e))),
    emitEvent,
    syncLivePotholes,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}