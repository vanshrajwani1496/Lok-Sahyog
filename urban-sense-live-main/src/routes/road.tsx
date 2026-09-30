import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { LiveMap } from "@/components/LiveMap";
import { DetectionFeed } from "@/components/DetectionFeed";
import { severityTone, StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { TYPE_LABEL } from "@/lib/mockData";
import type { DetectionType, Severity } from "@/lib/types";
import { cn, getAreaName } from "@/lib/utils";

export const Route = createFileRoute("/road")({
  head: () => ({
    meta: [
      { title: "Road Intelligence — Urban Eye" },
      {
        name: "description",
        content:
          "City-wide road condition monitoring: zone risk aggregation, pothole hotspots and filterable detection history.",
      },
      { property: "og:title", content: "Road Intelligence — Urban Eye" },
      {
        property: "og:description",
        content: "Zone risk aggregation and top problematic road zones.",
      },
    ],
  }),
  component: RoadPage,
});

const TYPE_FILTERS: Array<{ key: DetectionType | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "pothole", label: "Potholes" },
  { key: "road_damage", label: "Road Damage" },
  { key: "waterlogging", label: "Waterlogging" },
  { key: "traffic_sign", label: "Traffic Signs" },
  { key: "road_divider", label: "Dividers" },
];

const SEVERITIES: Array<Severity | "all"> = ["all", "low", "medium", "high", "critical"];
const TIMES = [
  { key: "1", label: "Today" },
  { key: "7", label: "7 Days" },
  { key: "30", label: "30 Days" },
];

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label-xs w-24 shrink-0">{label}</span>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs transition-colors",
            value === o.key
              ? "border-primary/50 bg-primary/12 text-primary"
              : "border-border bg-surface text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function RoadPage() {
  const store = useStore();
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [time, setTime] = useState("30");
  const [bus, setBus] = useState("all");

  const filtered = useMemo(() => {
    const cutoff = Date.now() - Number(time) * 86400000;
    return store.events.filter(
      (e) =>
        (type === "all" || e.type === type) &&
        (severity === "all" || e.severity === severity) &&
        (bus === "all" || e.busId === bus) &&
        new Date(e.timestamp).getTime() >= cutoff,
    );
  }, [store.events, type, severity, bus, time]);

  const unresolvedHazards = useMemo(() => {
    return filtered
      .filter((e) => e.status !== "resolved")
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }, [filtered]);

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate backend POST
    const pureId = id.replace("LIVE-", "");
    await fetch(`http://127.0.0.1:8000/api/v1/incidents/${pureId}/acknowledge`, { method: "POST" });
    // Optimistic UI update
    store.setEventStatus(id, "acknowledged");
  };

  const handleResolve = async (id: string, file: File | null = null, e: React.MouseEvent) => {
    e.stopPropagation();
    const pureId = id.replace("LIVE-", "");
    const formData = new FormData();
    if (file) formData.append("file", file);
    await fetch(`http://127.0.0.1:8000/api/v1/incidents/${pureId}/resolve`, {
      method: "POST", body: formData
    });
    // Optimistic UI update
    store.setEventStatus(id, "resolved");
  };

  const triggerUpload = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleResolve(id, file, e as any);
    };
    input.click();
  };

  return (
    <div>
      <PageHeader
        title="Road Intelligence"
        subtitle="City-wide road condition monitoring aggregated into zones."
      />

      <div className="panel mb-4 space-y-2.5 p-4">
        <FilterRow
          label="Detection"
          options={TYPE_FILTERS.map((t) => ({ key: t.key, label: t.label }))}
          value={type}
          onChange={setType}
        />
        <FilterRow
          label="Severity"
          options={SEVERITIES.map((s) => ({ key: s, label: s === "all" ? "All" : s }))}
          value={severity}
          onChange={setSeverity}
        />
        <FilterRow label="Time" options={TIMES} value={time} onChange={setTime} />
        <FilterRow
          label="Bus"
          options={[
            { key: "all", label: "All Buses" },
            ...store.buses.slice(0, 6).map((b) => ({ key: b.id, label: b.id })),
          ]}
          value={bus}
          onChange={setBus}
        />
        <div className="pt-1 text-xs text-muted-foreground">
          Showing <span className="font-mono text-foreground">{filtered.length}</span> detections
          across <span className="font-mono text-foreground">{unresolvedHazards.length}</span> unresolved hazards requiring action.
        </div>
      </div>

      <section className="panel mt-4 mb-4 overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Gov Action Pipeline (Unresolved Hazards)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="label-xs border-b border-border text-left">
                <th className="px-4 py-2 font-medium">Zone</th>
                <th className="px-4 py-2 font-medium">Fault Type</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {unresolvedHazards.map((z) => (
                <tr key={z.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/60 cursor-pointer" onClick={() => store.selectZone(z.h3Index)}>
                  <td className="px-4 py-2.5 text-xs font-semibold">{getAreaName(z.h3Index)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-widest">{TYPE_LABEL[z.type]}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={severityTone(z.severity)}>{z.severity}</StatusBadge>
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {z.status === "open" ? (
                      <button
                        onClick={(e) => handleAcknowledge(z.id, e)}
                        className="bg-primary/20 text-primary hover:bg-primary border-primary border hover:text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        ACKNOWLEDGE
                      </button>
                    ) : (
                      <button
                        onClick={(e) => (z.type === "pothole" || z.type === "road_damage" || z.type === "damaged_sign") ? triggerUpload(z.id, e) : handleResolve(z.id, null, e)}
                        className="bg-warning/20 text-warning hover:bg-warning border-warning border hover:text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        {(z.type === "pothole" || z.type === "road_damage" || z.type === "damaged_sign") ? "UPLOAD PROOF & RESOLVE" : "MARK RESOLVED"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {unresolvedHazards.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    All filtered hazards have been successfully resolved by field officers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LiveMap
          events={filtered}
          height={480}
          showBuses={false}
          title="Road Condition Map"
          subtitle="Filtered detections aggregated per zone."
        />
        <DetectionFeed height={480} events={filtered} />
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Detection types other than {TYPE_LABEL.pothole.toLowerCase()} are sample records for planned
        modules and are clearly marked in the live feed.
      </p>
    </div>
  );
}
