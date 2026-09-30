import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ZONES = [
  "Khairatabad",
  "Charminar",
  "Secunderabad",
  "Kukatpally",
  "Serilingampally",
  "LB Nagar"
];

export const ZONE_CENTERS: Record<string, { lat: number, lng: number }> = {
  "Khairatabad": { lat: 17.4116, lng: 78.4550 },
  "Charminar": { lat: 17.3616, lng: 78.4747 },
  "Secunderabad": { lat: 17.4399, lng: 78.4983 },
  "Kukatpally": { lat: 17.4849, lng: 78.4069 },
  "Serilingampally": { lat: 17.4800, lng: 78.3200 },
  "LB Nagar": { lat: 17.3457, lng: 78.5522 }
};

const STREETS: Record<string, string[]> = {
  "Khairatabad": ["Banjara Hills Rd", "Jubilee Hills Checkpost", "Punjagutta Main Road"],
  "Charminar": ["Falaknuma Rd", "Lad Bazaar", "Shah Ali Banda"],
  "Secunderabad": ["SP Road", "Tarnaka Street", "Mettuguda Rd"],
  "Kukatpally": ["JNTU Road", "KPHB Main", "Pragathi Nagar Rd"],
  "Serilingampally": ["Gachibowli Rd", "Hitec City Main", "Kondapur Center"],
  "LB Nagar": ["Kothapet Rd", "Dilsukhnagar Main", "Hayathnagar Rd"],
};

function getHash(h3Index: string | undefined): number {
  if (!h3Index) return 0;
  let hash = 0;
  for (let i = 0; i < h3Index.length; i++) {
    hash = h3Index.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAreaName(h3Index: string | undefined): string {
  if (!h3Index) return "Unknown Zone";
  const hash = getHash(h3Index);
  return ZONES[hash % ZONES.length] ?? "Unknown Zone";
}

export function getStreetName(h3Index: string | undefined): string {
  if (!h3Index) return "Unknown Street";
  const hash = getHash(h3Index);
  const zone = ZONES[hash % ZONES.length] as keyof typeof STREETS;
  const streetsStr = STREETS[zone];
  const streetIdx = streetsStr ? (hash >> 2) % streetsStr.length : 0;
  return streetsStr ? (streetsStr[streetIdx] ?? "Unknown Street") : "Unknown Street";
}
