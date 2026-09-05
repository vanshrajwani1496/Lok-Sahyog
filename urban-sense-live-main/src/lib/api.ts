import type { Bus, DetectionEvent, Zone } from "./types";

export const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

export const WS_URL = API_URL.replace(/^http/, "ws") + "/ws";

// Set to false to hit FastAPI; falls back gracefully to mock if offline
export const USE_MOCK = false;

export interface PotholeIncident {
  id: number;
  type?: "pothole" | "road_damage";
  bus_id?: string;
  h3_index: string;
  latitude: number;
  longitude: number;
  confidence: number;
  report_count: number;
  timestamp?: string;
  image_url?: string;
  bbox?: [number, number, number, number];
}

async function get<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`FastAPI endpoint offline (${path}), using fallback:`, err);
    return fallback;
  }
}

export const api = {
  /** GET /api/v1/potholes — Live FastAPI Supabase layer */
  potholes: async (fallback: PotholeIncident[] = []) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/potholes`);
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  },

  /** POST /api/v1/telemetry — Sends detection telemetry to FastAPI */
  sendTelemetry: async (payload: any) => {
    if (USE_MOCK) return { status: "mock_success" };
    try {
      const res = await fetch(`${API_URL}/api/v1/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error("Telemetry upload error:", err);
      return null;
    }
  },

  /** Existing Lovable endpoints */
  events: (fallback: DetectionEvent[]) => get("/api/events", fallback),
  recentEvents: (fallback: DetectionEvent[]) => get("/api/events/recent", fallback),
  buses: (fallback: Bus[]) => get("/api/buses", fallback),
  bus: (id: string, fallback: Bus | undefined) => get(`/api/buses/${id}`, fallback),
  zones: (fallback: Zone[]) => get("/api/zones", fallback),
  zone: (h3Index: string, fallback: Zone | undefined) => get(`/api/zones/${h3Index}`, fallback),
  analytics: <T,>(fallback: T) => get("/api/analytics", fallback),
  health: (fallback: { status: string }) => get("/api/health", fallback),
};

/** Real-time channel — mock mode uses local event simulator instead */
export function connectEventSocket(onEvent: (e: DetectionEvent) => void): () => void {
  if (USE_MOCK || typeof window === "undefined") return () => { };
  const ws = new WebSocket(WS_URL);
  ws.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data) as DetectionEvent);
    } catch {
      /* ignore malformed frame */
    }
  };
  return () => ws.close();
}