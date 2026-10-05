import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ZONES = [
  "Khairatabad", "Charminar", "Secunderabad", "Kukatpally", "Serilingampally", "LB Nagar",
  "Island City", "Western Suburbs", "Eastern Suburbs",
  "NDMC", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "Central Delhi"
];

export const ZONE_CENTERS: Record<string, { lat: number, lng: number }> = {
  "Khairatabad": { lat: 17.4116, lng: 78.4550 },
  "Charminar": { lat: 17.3616, lng: 78.4747 },
  "Secunderabad": { lat: 17.4399, lng: 78.4983 },
  "Kukatpally": { lat: 17.4849, lng: 78.4069 },
  "Serilingampally": { lat: 17.4800, lng: 78.3200 },
  "LB Nagar": { lat: 17.3457, lng: 78.5522 },
  "Island City": { lat: 18.9067, lng: 72.8147 },
  "Western Suburbs": { lat: 19.1136, lng: 72.8697 },
  "Eastern Suburbs": { lat: 19.0553, lng: 72.9022 },
  "NDMC": { lat: 28.6304, lng: 77.2177 },
  "South Delhi": { lat: 28.5293, lng: 77.1539 },
  "North Delhi": { lat: 28.7041, lng: 77.1025 },
  "East Delhi": { lat: 28.6258, lng: 77.2913 },
  "West Delhi": { lat: 28.6473, lng: 77.0864 },
  "Central Delhi": { lat: 28.6465, lng: 77.2442 }
};

const STREETS: Record<string, string[]> = {
  "Khairatabad": ["Banjara Hills Rd", "Jubilee Hills Checkpost", "Punjagutta Main Road"],
  "Charminar": ["Falaknuma Rd", "Lad Bazaar", "Shah Ali Banda"],
  "Secunderabad": ["SP Road", "Tarnaka Street", "Mettuguda Rd"],
  "Kukatpally": ["JNTU Road", "KPHB Main", "Pragathi Nagar Rd"],
  "Serilingampally": ["Gachibowli Rd", "Hitec City Main", "Kondapur Center"],
  "LB Nagar": ["Kothapet Rd", "Dilsukhnagar Main", "Hayathnagar Rd"],
  "Island City": ["Marine Drive", "Colaba Causeway", "Nariman Point"],
  "Western Suburbs": ["SV Road", "Link Road", "WEH"],
  "Eastern Suburbs": ["LBS Marg", "EEH", "Ghatkopar Rd"],
  "NDMC": ["Connaught Place", "Parliament Street", "Janpath"],
  "South Delhi": ["Outer Ring Road", "Aurobindo Marg", "Mehrauli Rd"],
  "North Delhi": ["Civil Lines", "Mall Road", "Ring Road"],
  "East Delhi": ["Vikas Marg", "Preet Vihar", "Mayur Vihar Rd"],
  "West Delhi": ["Rajouri Garden", "Punjabi Bagh", "Janakpuri"],
  "Central Delhi": ["Karol Bagh", "Pahar Ganj", "DB Gupta Rd"],
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
