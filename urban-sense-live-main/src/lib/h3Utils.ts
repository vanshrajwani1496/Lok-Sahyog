/**
 * Lightweight H3-compatible helpers for the prototype.
 *
 * The real H3 indexing happens in the Python/FastAPI backend (h3-py, res 9).
 * Here we mirror the same contract — a lat/lng resolves deterministically to a
 * single hexagonal cell id — so the frontend logic (zone aggregation, risk
 * escalation, hex rendering) is identical once real h3Index values arrive.
 */

export const H3_RESOLUTION = 9;

/** City anchor: Begum Bazar, Hyderabad */
export const CITY_CENTER = { lat: 17.3770, lng: 78.4730 };

/** Approximate size of one res-9 cell in degrees for the prototype grid. */
const CELL_LAT = 0.0032;
const CELL_LNG = 0.0034;

export interface HexCoord {
  q: number;
  r: number;
}

/** Axial hex coords from a lat/lng (pointy-top layout). */
export function latLngToHex(lat: number, lng: number): HexCoord {
  const x = (lng - CITY_CENTER.lng) / CELL_LNG;
  const y = (lat - CITY_CENTER.lat) / CELL_LAT;
  const q = Math.round(x - y / 2);
  const r = Math.round(y);
  return { q, r };
}

export function hexToLatLng(q: number, r: number) {
  return {
    lat: CITY_CENTER.lat + r * CELL_LAT,
    lng: CITY_CENTER.lng + (q + r / 2) * CELL_LNG,
  };
}

/** Deterministic, H3-shaped 15-char index for a grid cell. */
export function hexToH3(q: number, r: number): string {
  const seed = ((q + 512) * 1024 + (r + 512)) >>> 0;
  const body = (seed * 2654435761) >>> 0;
  return `89283${body.toString(16).padStart(8, "0").slice(0, 6)}${((seed * 97) % 4096)
    .toString(16)
    .padStart(3, "0")}fff`.slice(0, 15);
}

export function latLngToH3(lat: number, lng: number): string {
  const { q, r } = latLngToHex(lat, lng);
  return hexToH3(q, r);
}

/** Pixel center of a hex in an SVG grid (pointy-top). */
export function hexPixel(q: number, r: number, size: number) {
  return {
    x: size * Math.sqrt(3) * (q + r / 2),
    y: size * 1.5 * r,
  };
}

export function hexPoints(cx: number, cy: number, size: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(cx + size * Math.cos(a)).toFixed(2)},${(cy + size * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export function shortH3(index: string) {
  return `${index.slice(0, 7)}…${index.slice(-4)}`;
}
