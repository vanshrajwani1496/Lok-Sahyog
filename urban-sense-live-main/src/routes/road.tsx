import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { LiveMap } from "@/components/LiveMap";
import { DetectionFeed } from "@/components/DetectionFeed";
import { severityTone, StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { TYPE_LABEL } from "@/lib/mockData";
import type { DetectionType, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/road")({
  head: () => ({
    meta: [
      { title: "Road Intelligence — Lok-Sahyog" },
      {
        name: "description",
        content:
          "City-wide road condition monitoring: H3 zone risk aggregation, pothole hotspots and filterable detection history.",
      },
      { property: "og:title", content: "Road Intelligence — Lok-Sahyog" },
      {
        property: "og:description",
        content: "H3 zone risk aggregation and top problematic road zones.",
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

  const topZones = useMemo(() => {
    const map = new Map<string, { count: number; potholes: number; last: string }>();
    for (const e of filtered) {
      const cur = map.get(e.h3Index) ?? { count: 0, potholes: 0, last: e.timestamp };
      cur.count += 1;
      if (e.type === "pothole") cur.potholes += 1;
      if (e.timestamp > cur.last) cur.last = e.timestamp;
      map.set(e.h3Index, cur);
    }
    return [...map.entries()]
      .map(([h3Index, v]) => ({
        h3Index,
        ...v,
        risk: store.zones.find((z) => z.h3Index === h3Index)?.risk ?? "low",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filtered, store.zones]);

  return (
    <div>
      <PageHeader
        title="Road Intelligence"
        subtitle="City-wide road condition monitoring aggregated into H3 spatial cells."
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
          across <span className="font-mono text-foreground">{topZones.length}</span> affected zones.
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LiveMap
          events={filtered}
          height={480}
          showBuses={false}
          title="Road Condition Map"
          subtitle="Filtered detections aggregated per H3 cell."
        />
        <DetectionFeed height={480} events={filtered} />
      </div>

      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Top Problematic Zones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="label-xs border-b border-border text-left">
                <th className="px-4 py-2 font-medium">H3 Zone</th>
                <th className="px-4 py-2 font-medium">Incidents</th>
                <th className="px-4 py-2 font-medium">Potholes</th>
                <th className="px-4 py-2 font-medium">Risk</th>
                <th className="px-4 py-2 font-medium">Last Detection</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {topZones.map((z) => (
                <tr key={z.h3Index} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{z.h3Index}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{z.count}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">{z.potholes}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={severityTone(z.risk)}>{z.risk}</StatusBadge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {new Date(z.last).toLocaleTimeString("en-GB")}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => store.selectZone(z.h3Index)}
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
                    >
                      View Zone
                    </button>
                  </td>
                </tr>
              ))}
              {topZones.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No zones match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Detection types other than {TYPE_LABEL.pothole.toLowerCase()} are sample records for planned
        modules and are clearly marked in the live feed.
      </p>
    </div>
  );
}
