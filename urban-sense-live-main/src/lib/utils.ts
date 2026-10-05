import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ZONES = [
  "Khairatabad", "Charminar", "Secunderabad", "Kukatpally", "Serilingampally", "LB Nagar",
  "Island City", "Western Suburbs", "Eastern Suburbs",
  "NDMC", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "Central Delhi",
  "South Zone", "East Zone", "West Zone", "Mahadevapura", "Yelahanka", "Bommanahalli",
  "Shivajinagar-Ghole Road", "Kothrud-Bavdhan", "Hadapsar-Mundhwa", "Aundh-Baner", "Yerawada-Kalas",
  "South Region", "Central Region", "North Region", "Adyar", "Anna Nagar"
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
  "Central Delhi": { lat: 28.6465, lng: 77.2442 },
  "South Zone": { lat: 12.9352, lng: 77.6245 },
  "East Zone": { lat: 12.9784, lng: 77.6408 },
  "West Zone": { lat: 12.9860, lng: 77.5501 },
  "Mahadevapura": { lat: 12.9904, lng: 77.6974 },
  "Yelahanka": { lat: 13.1007, lng: 77.5963 },
  "Bommanahalli": { lat: 12.9030, lng: 77.6242 },
  "Shivajinagar-Ghole Road": { lat: 18.5362, lng: 73.8391 },
  "Kothrud-Bavdhan": { lat: 18.5074, lng: 73.8077 },
  "Hadapsar-Mundhwa": { lat: 18.5089, lng: 73.9259 },
  "Aundh-Baner": { lat: 18.5590, lng: 73.7868 },
  "Yerawada-Kalas": { lat: 18.5529, lng: 73.8961 },
  "South Region": { lat: 12.9907, lng: 80.2307 },
  "Central Region": { lat: 13.0418, lng: 80.2341 },
  "North Region": { lat: 13.1118, lng: 80.2526 },
  "Adyar": { lat: 13.0033, lng: 80.2555 },
  "Anna Nagar": { lat: 13.0850, lng: 80.2101 }
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
  "South Zone": ["JP Nagar Rd", "BTM Layout", "Jayanagar Rd"],
  "East Zone": ["Old Airport Rd", "MG Road", "CMH Road"],
  "West Zone": ["Magadi Rd", "Mysuru Rd", "Tumkur Rd"],
  "Mahadevapura": ["Whitefield Main", "Marathahalli ORR", "ITPL Main Rd"],
  "Yelahanka": ["Bellary Rd", "Doddaballapur Rd", "Kogilu Main"],
  "Bommanahalli": ["Hosur Rd", "Electronic City", "HSR Layout"],
  "Shivajinagar-Ghole Road": ["FC Road", "JM Road", "Senapati Bapat Rd"],
  "Kothrud-Bavdhan": ["Karve Rd", "Paud Rd", "NDA Rd"],
  "Hadapsar-Mundhwa": ["Magarpatta Rd", "Pune-Solapur Rd", "Mundhwa Rd"],
  "Aundh-Baner": ["Baner Rd", "Aundh Main", "Balewadi High St"],
  "Yerawada-Kalas": ["Nagar Rd", "Airport Rd", "Kalyaninagar Rd"],
  "South Region": ["OMR", "ECR", "Velachery Main"],
  "Central Region": ["Mount Road", "Poonamallee High Rd", "Nungambakkam High"],
  "North Region": ["TH Road", "Royapuram Main", "Ennore High Rd"],
  "Adyar": ["LB Road", "Sardar Patel Rd", "Besant Nagar Rd"],
  "Anna Nagar": ["2nd Avenue", "Shanthi Colony", "Blue Star"]
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
