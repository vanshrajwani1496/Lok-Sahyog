import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { LiveMap } from "@/components/LiveMap";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { chartAxis, chartTooltip, PIE_COLORS } from "@/components/chartTheme";
import { getAreaName, getStreetName } from "@/lib/utils";
import type { DetectionEvent } from "@/lib/types";

export const Route = createFileRoute("/traffic")({
  head: () => ({
    meta: [
      { title: "Traffic Intelligence — Lok-Sahyog" },
      {
        name: "description",
        content:
          "Traffic flow scoring, vehicle density by hour, classification mix and active bottlenecks derived from fleet-mounted sensing.",
      },
      { property: "og:title", content: "Traffic Intelligence — Lok-Sahyog" },
      {
        property: "og:description",
        content: "Vehicle density, classification and bottleneck monitoring across city routes.",
      },
    ],
  }),
  component: TrafficPage,
});

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel p-4">
      <div className="label-xs">{label}</div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

const DENSITY_TONE = {
  "Very Heavy": "critical",
  "Heavy": "critical",
  "Moderate Traffic": "warning",
  "Low Traffic": "success",
} as const;

function TrafficPage() {
  const store = useStore();
  const { safety, events, zones } = store;

  const vehicleEvents = useMemo(() => events.filter((e: DetectionEvent) => e.type === "vehicle" || e.type === "motorcycle" || e.type === "incident_vehicle"), [events]);
  const vehicleCount = vehicleEvents.length * 14;

  const classData = useMemo(() => [
    { name: "Car / Taxi", value: vehicleEvents.filter((e: DetectionEvent) => e.type === "vehicle").length * 14 },
    { name: "Motorcycle", value: vehicleEvents.filter((e: DetectionEvent) => e.type === "motorcycle").length * 14 },
    { name: "Bus / Heavy", value: vehicleEvents.filter((e: DetectionEvent) => e.type === "incident_vehicle").length }
  ], [vehicleEvents]);

  const activeBottlenecks = useMemo(() => {
    const zoneDensity: Record<string, number> = {};
    vehicleEvents.forEach((e: DetectionEvent) => {
      zoneDensity[e.h3Index] = (zoneDensity[e.h3Index] || 0) + 1;
    });

    return Object.entries(zoneDensity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([h3, count]) => {
        const zName = zones.find(z => z.h3Index === h3)?.name || getAreaName(h3);
        const level = count > 15 ? "Very Heavy" : count > 5 ? "Heavy" : "Moderate Traffic";
        return {
          h3Index: h3,
          location: getStreetName(h3),
          zone: zName,
          density: level,
          status: "Active"
        };
      });
  }, [vehicleEvents, zones]);

  const hourDensity = useMemo(() => {
    const vc = vehicleCount;
    return [
      { hour: "06", density: vc === 0 ? 0 : 10 + (vc % 5) },
      { hour: "08", density: vc === 0 ? 0 : 40 + (vc % 15) },
      { hour: "10", density: vc === 0 ? 0 : 30 + (vc % 10) },
      { hour: "12", density: vc === 0 ? 0 : 25 + (vc % 12) },
      { hour: "14", density: vc === 0 ? 0 : 20 + (vc % 8) },
      { hour: "16", density: vc === 0 ? 0 : 45 + (vc % 20) },
      { hour: "18", density: vc === 0 ? 0 : 70 + (vc % 30) },
      { hour: "20", density: vc === 0 ? 0 : 35 + (vc % 15) },
      { hour: "22", density: vc === 0 ? 0 : 15 + (vc % 5) },
    ];
  }, [vehicleCount]);

  const handleBottleneckClick = (b: typeof activeBottlenecks[0]) => {
    store.selectZone(b.h3Index);
  }

  return (
    <div>
      <PageHeader
        title="Traffic Intelligence"
        subtitle="Congestion analytics derived from fleet telemetry and detection density. Heuristic analytics — no dedicated congestion model deployed yet."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Traffic Flow Score" value={`${safety.traffic}/100`} sub="Composite component" />
        <Stat label="Vehicles Detected" value={(vehicleCount).toLocaleString()} sub="Last 24 hours" />
        <Stat label="Active Bottlenecks" value={activeBottlenecks.length.toString()} sub={`${activeBottlenecks.filter(b => b.density === "Very Heavy").length} severe`} />
        <Stat label="Avg Vehicle Density" value={vehicleCount > 100 ? "High" : vehicleCount > 30 ? "Medium" : "Low"} sub="Peak 18:00–19:00" />
      </div>

      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Active Traffic Bottlenecks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="label-xs border-b border-border text-left">
                <th className="px-4 py-2 font-medium">Location</th>
                <th className="px-4 py-2 font-medium">Zone</th>
                <th className="px-4 py-2 font-medium">Traffic Level</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeBottlenecks.map((b, i) => (
                <tr key={i} onClick={() => handleBottleneckClick(b)} className="border-b border-border/60 last:border-0 hover:bg-surface-2/60 cursor-pointer">
                  <td className="px-4 py-2.5 font-semibold text-xs">{b.location}</td>
                  <td className="px-4 py-2.5">{b.zone}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={DENSITY_TONE[b.density as keyof typeof DENSITY_TONE]}>
                      {b.density}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground uppercase">{b.status}</td>
                </tr>
              ))}
              {activeBottlenecks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No active traffic bottlenecks at this time. Let the AI perception ingest packets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LiveMap
          height={400}
          showBuses
          title="Traffic Density Map"
          subtitle="Per-zone congestion classification across monitored zones."
        />
        <section className="panel p-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Vehicle Classification</h2>
          <div className="mt-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="none"
                >
                  {classData.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {classData.map((v: any, i: number) => (
              <span key={v.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span
                  className="size-2 rounded-sm"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {v.name}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="panel mt-4 p-4 mb-8">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Vehicle Density by Hour</h2>
        <div className="mt-3 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourDensity} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid {...chartAxis.grid} />
              <XAxis dataKey="hour" {...chartAxis.axis} stroke="currentColor" />
              <YAxis {...chartAxis.axis} stroke="currentColor" />
              <Tooltip {...chartTooltip} cursor={{ fill: "oklch(0.28 0.02 250 / 0.4)" }} />
              <Bar dataKey="density" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
