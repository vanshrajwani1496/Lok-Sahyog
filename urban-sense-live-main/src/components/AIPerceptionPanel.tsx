import { useStore } from "@/lib/store";
import { getStreetName, getAreaName } from "@/lib/utils";
import { StatusDot } from "./StatusBadge";

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : "text-xs font-medium"}>{value}</span>
    </div>
  );
}

export function AIPerceptionPanel() {
  const { events, lastEvent, todayCount } = useStore();
  const current = lastEvent ?? events[0];

  const activeNodes = new Set(events.map(e => e.busId)).size || 1;
  const activeZones = new Set(events.map(e => getAreaName(e.h3Index))).size || 1;
  const criticalCount = events.filter(e => e.severity === "critical").length;

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Operational DataStream</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-success uppercase">
          <StatusDot tone="success" pulse /> Syncing
        </span>
      </div>
      <div className="mt-2">
        <Row label="Active Edge Nodes" value={`${activeNodes} Online`} mono={false} />
        <Row label="Zonal Coverage" value={`${activeZones} Municipal Zones`} mono={false} />
        <Row label="Critical Safety Risks" value={`${criticalCount} Unresolved`} />
        <Row label="Average Dispatch Latency" value="1.2s" />
        <Row label="Detections Logged (24h)" value={String(todayCount)} />
        <Row
          label="Active Scanning Target"
          value={
            current
              ? getStreetName(current.h3Index)
              : "Awaiting Feed..."
          }
          mono={false}
        />
      </div>
    </section>
  );
}
