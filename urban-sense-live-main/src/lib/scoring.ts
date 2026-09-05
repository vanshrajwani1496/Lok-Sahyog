import type { DetectionEvent, Severity, Zone } from "./types";

/**
 * Prototype composite "Urban Road Safety Score".
 * NOT a validated safety metric — a demonstration weighting used to show how
 * live AI detections propagate into city-level intelligence.
 */
export const WEIGHTS = {
  road: 0.4,
  traffic: 0.25,
  pedestrian: 0.2,
  infrastructure: 0.15,
};

const SEVERITY_WEIGHT: Record<Severity, number> = {
  low: 0.5,
  medium: 1,
  high: 1.8,
  critical: 3,
};

export interface SafetyBreakdown {
  road: number;
  traffic: number;
  pedestrian: number;
  infrastructure: number;
  overall: number;
  label: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeSafety(events: DetectionEvent[], zones: Zone[]): SafetyBreakdown {
  let roadPenalty = 0;
  let trafficPenalty = 0;
  let pedPenalty = 0;
  let infraPenalty = 0;

  for (const e of events) {
    const w = SEVERITY_WEIGHT[e.severity];
    switch (e.type) {
      case "pothole":
      case "road_damage":
        roadPenalty += 0.55 * w;
        break;
      case "waterlogging":
        roadPenalty += 0.4 * w;
        trafficPenalty += 0.3 * w;
        break;
      case "traffic_congestion":
      case "rash_driving":
        trafficPenalty += 0.9 * w;
        break;
      case "pedestrian_risk":
        pedPenalty += 1.4 * w;
        break;
      case "incident_vehicle":
        trafficPenalty += 1.2 * w;
        pedPenalty += 1.2 * w;
        break;
      default:
        infraPenalty += 1.1 * w;
    }
  }

  // Clustering penalty: many detections inside one H3 cell hurt more.
  for (const z of zones) {
    if (z.incidents > 4) roadPenalty += (z.incidents - 4) * 0.6;
    if (z.traffic === "severe") trafficPenalty += 2;
    else if (z.traffic === "high") trafficPenalty += 1;
  }

  const road = clamp(100 - roadPenalty);
  const traffic = clamp(100 - trafficPenalty);
  const pedestrian = clamp(100 - pedPenalty);
  const infrastructure = clamp(100 - infraPenalty);

  const overall = clamp(
    road * WEIGHTS.road +
      traffic * WEIGHTS.traffic +
      pedestrian * WEIGHTS.pedestrian +
      infrastructure * WEIGHTS.infrastructure,
  );

  return { road, traffic, pedestrian, infrastructure, overall, label: scoreLabel(overall) };
}

export function scoreLabel(score: number) {
  if (score >= 85) return "EXCELLENT";
  if (score >= 75) return "GOOD";
  if (score >= 60) return "MODERATE";
  if (score >= 45) return "POOR";
  return "CRITICAL";
}

export function zoneRisk(incidents: number, severityScore: number): Severity | "none" {
  const v = incidents + severityScore;
  if (v === 0) return "none";
  if (v >= 12) return "critical";
  if (v >= 7) return "high";
  if (v >= 3) return "medium";
  return "low";
}

export function roadHealthFor(zone: { incidents: number }) {
  return Math.max(20, 100 - zone.incidents * 6);
}
