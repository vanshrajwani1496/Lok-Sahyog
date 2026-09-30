import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Bus, Gauge, Hexagon, TriangleAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DetectionEvent } from "@/lib/types";
import { computeSafety } from "@/lib/scoring";

function KPICard({
  label,
  value,
  delta,
  deltaTone = "success",
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string | number;
  delta: string;
  deltaTone?: "success" | "warning" | "critical" | "muted";
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "panel p-4 transition-colors",
        highlight && "border-primary/45 bg-primary/[0.06]",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="label-xs">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-3 font-mono text-3xl leading-none font-semibold tabular-nums">{value}</div>
      <div
        className={cn(
          "mt-2 text-xs",
          deltaTone === "success" && "text-success",
          deltaTone === "warning" && "text-warning",
          deltaTone === "critical" && "text-critical",
          deltaTone === "muted" && "text-muted-foreground",
        )}
      >
        {delta}
      </div>
    </div>
  );
}

export function KPIGrid({ events }: { events: DetectionEvent[] }) {
  const { buses, zones } = useStore();
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const todayCount = events.filter(e => new Date(e.timestamp).getTime() >= startOfDay).length;

  const activeBuses = buses.filter((b) => b.status === "online").length;
  const openAlerts = events.filter((e) => e.status === "open").length;
  const highPriority = events.filter(
    (e) => e.status === "open" && (e.severity === "high" || e.severity === "critical"),
  ).length;

  const monitored = new Set(events.map(e => e.h3Index)).size;
  const safety = computeSafety(events, zones);

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      <KPICard label="Active Buses" value={activeBuses} delta="+2 from last hour" icon={Bus} />
      <KPICard
        label="Detections Today"
        value={todayCount}
        delta={"Total multi-hazard cases"}
        deltaTone={"success"}
        icon={TriangleAlert}
      />
      <KPICard
        label="Active Road Alerts"
        value={openAlerts}
        delta={`${highPriority} high priority`}
        deltaTone="critical"
        icon={AlertTriangle}
      />
      <KPICard label="Monitored Zones" value={monitored} delta="Active surveillance areas" deltaTone="muted" icon={Hexagon} />
      <KPICard
        label="City Safety Score"
        value={`${safety.overall}/100`}
        delta={safety.label}
        deltaTone={safety.overall >= 75 ? "success" : safety.overall >= 60 ? "warning" : "critical"}
        icon={Gauge}
      />
    </div>
  );
}
