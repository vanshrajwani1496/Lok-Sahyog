import { useMemo, useState } from "react";
import { Crosshair, Layers, Minus, Plus } from "lucide-react";
import { hexPixel, hexPoints, shortH3 } from "@/lib/h3Utils";
import { useStore } from "@/lib/store";
import type { DetectionEvent, Zone } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StatusDot } from "./StatusBadge";

const RISK_FILL: Record<string, string> = {
  none: "fill-success/8 stroke-border",
  low: "fill-success/25 stroke-success/40",
  medium: "fill-warning/25 stroke-warning/45",
  high: "fill-[oklch(0.68_0.18_35)]/30 stroke-[oklch(0.68_0.18_35)]/60",
  critical: "fill-critical/40 stroke-critical/70",
};

const LEGEND = [
  { risk: "none", label: "Normal" },
  { risk: "low", label: "Low" },
  { risk: "medium", label: "Moderate" },
  { risk: "high", label: "High" },
  { risk: "critical", label: "Critical" },
];

const SIZE = 30;

export function LiveMap({
  events,
  height = 460,
  showBuses = true,
  trailBusId,
  title = "Live Urban Road Intelligence",
  subtitle = "H3-based spatial aggregation of AI detections.",
}: {
  events?: DetectionEvent[];
  height?: number;
  showBuses?: boolean;
  trailBusId?: string;
  title?: string;
  subtitle?: string;
}) {
  const store = useStore();
  const visible = events ?? store.events;
  const [zoom, setZoom] = useState(1);
  const [showHex, setShowHex] = useState(true);
  const [hover, setHover] = useState<Zone | null>(null);

  const zones = useMemo(() => {
    const ids = new Set(visible.map((e) => e.h3Index));
    return store.zones.map((z) =>
      ids.has(z.h3Index)
        ? z
        : { ...z, incidents: 0, risk: "none" as const, counts: {} as Record<string, number> },
    );
  }, [store.zones, visible]);

  const project = (lat: number, lng: number) => {
    const cellLat = 0.0032;
    const cellLng = 0.0034;
    const y = (lat - 17.3770) / cellLat;
    const x = (lng - 78.4730) / cellLng - y / 2;
    return hexPixel(x, y, SIZE);
  };

  // Dynamically map the viewport to lock directly over the active edge device location
  const centerLat = visible[0] ? visible[0].latitude : 17.3770;
  const centerLng = visible[0] ? visible[0].longitude : 78.4730;
  const bbox = `${centerLng - 0.038},${centerLat - 0.030},${centerLng + 0.038},${centerLat + 0.030}`;

  const focusPx = project(centerLat, centerLng);
  const vWidth = 2400;
  const vHeight = 1000;
  const minX = focusPx.x - vWidth / 2;
  const minY = focusPx.y - vHeight / 2;
  const w = vWidth;
  const h = vHeight;

  const positioned = zones.map((z) => ({ zone: z, ...hexPixel(z.q, z.r, SIZE) }));
  const trailBus = trailBusId ? store.buses.find((b) => b.id === trailBusId) : undefined;

  return (
    <section className="panel flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHex((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]",
              showHex ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground",
            )}
          >
            <Layers className="size-3.5" /> H3 Layer
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)))}
            className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))}
            className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <Crosshair className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden bg-[oklch(0.15_0.015_250)]"
        style={{ height }}
      >
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.28 0.02 250) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.28 0.02 250) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Native OpenStreetMap projection for dynamic physical coordinates */}
        <iframe
          className="absolute inset-0 size-full opacity-40 pointer-events-none saturate-0 transition-opacity duration-1000"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
          style={{ border: 0 }}
        />
        <svg
          viewBox={`${minX} ${minY} ${w} ${h}`}
          className="absolute inset-0 size-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* stylised arterial roads */}
          <g stroke="oklch(0.32 0.02 250)" strokeWidth="7" strokeLinecap="round" fill="none">
            <path d={`M${minX} ${minY + h * 0.32} L${minX + w} ${minY + h * 0.38}`} />
            <path d={`M${minX} ${minY + h * 0.72} L${minX + w} ${minY + h * 0.62}`} />
            <path d={`M${minX + w * 0.28} ${minY} L${minX + w * 0.34} ${minY + h}`} />
            <path d={`M${minX + w * 0.7} ${minY} L${minX + w * 0.62} ${minY + h}`} />
          </g>

          {showHex &&
            positioned.map(({ zone, x, y }) => (
              <polygon
                key={zone.h3Index}
                points={hexPoints(x, y, SIZE - 1.5)}
                className={cn(
                  "cursor-pointer transition-all duration-500",
                  RISK_FILL[zone.risk],
                  store.selectedZoneId === zone.h3Index && "stroke-primary stroke-2",
                )}
                strokeWidth={1}
                onMouseEnter={() => setHover(zone)}
                onMouseLeave={() => setHover(null)}
                onClick={() => store.selectZone(zone.h3Index)}
              />
            ))}

          {trailBus && (
            <polyline
              points={trailBus.trail
                .map(([la, ln]) => {
                  const p = project(la, ln);
                  return `${p.x},${p.y}`;
                })
                .join(" ")}
              className="flow-dash fill-none stroke-primary"
              strokeWidth={2.5}
            />
          )}

          {visible.slice(0, 120).map((e) => {
            const p = project(e.latitude, e.longitude);
            const tone =
              e.severity === "critical" || e.severity === "high"
                ? "fill-critical"
                : e.severity === "medium"
                  ? "fill-warning"
                  : "fill-info";
            return (
              <circle
                key={e.id}
                cx={p.x}
                cy={p.y}
                r={4}
                className={cn("cursor-pointer stroke-background", tone)}
                strokeWidth={1}
                onClick={() => store.selectEvent(e.id)}
              />
            );
          })}

          {showBuses &&
            store.buses
              .filter((b) => b.status !== "offline")
              .map((b) => {
                const p = project(b.lat, b.lng);
                return (
                  <g key={b.id} className="transition-all duration-1000">
                    <circle cx={p.x} cy={p.y} r={9} className="fill-primary/20" />
                    <rect
                      x={p.x - 4}
                      y={p.y - 4}
                      width={8}
                      height={8}
                      rx={1.5}
                      className="fill-primary stroke-background"
                      strokeWidth={1}
                    />
                  </g>
                );
              })}
        </svg>

        {hover && (
          <div className="pointer-events-none absolute top-3 left-3 rounded-md border border-border bg-popover/95 px-3 py-2 text-xs shadow-panel">
            <div className="font-mono text-[11px] text-primary">{shortH3(hover.h3Index)}</div>
            <div className="mt-1 text-muted-foreground">
              Risk <span className="text-foreground uppercase">{hover.risk}</span> · Detections{" "}
              <span className="text-foreground">{hover.incidents}</span> · Road health{" "}
              <span className="text-foreground">{hover.roadHealth}</span>
            </div>
          </div>
        )}

        <div className="absolute right-3 bottom-3 flex flex-wrap items-center gap-3 rounded-md border border-border bg-popover/90 px-3 py-2">
          {LEGEND.map((l) => (
            <span key={l.risk} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <svg viewBox="0 0 20 20" className="size-3.5">
                <polygon points={hexPoints(10, 10, 9)} className={RISK_FILL[l.risk]} strokeWidth={1} />
              </svg>
              {l.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <StatusDot tone="info" /> Bus
          </span>
        </div>
      </div>
    </section>
  );
}
