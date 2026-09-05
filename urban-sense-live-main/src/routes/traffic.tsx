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
import { BOTTLENECKS, VEHICLE_CLASSES, VEHICLE_DENSITY_HOURLY } from "@/lib/mockData";
import { useStore } from "@/lib/store";
import { chartAxis, chartTooltip, PIE_COLORS } from "@/components/chartTheme";

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
  Severe: "critical",
  High: "critical",
  Medium: "warning",
  Low: "success",
} as const;

function TrafficPage() {
  const { safety } = useStore();

  return (
    <div>
      <PageHeader
        title="Traffic Intelligence"
        subtitle="Congestion analytics derived from fleet telemetry and detection density. Heuristic analytics — no dedicated congestion model deployed yet."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Traffic Flow Score" value={`${safety.traffic}/100`} sub="Composite component" />
        <Stat label="Vehicles Detected" value="24,831" sub="Last 24 hours" />
        <Stat label="Active Bottlenecks" value="8" sub="3 severe" />
        <Stat label="Avg Vehicle Density" value="Medium" sub="Peak 18:00–19:00" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LiveMap
          height={400}
          showBuses
          title="Traffic Density Map"
          subtitle="Per-zone congestion classification across monitored H3 cells."
        />
        <section className="panel p-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Vehicle Classification</h2>
          <div className="mt-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VEHICLE_CLASSES}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="none"
                >
                  {VEHICLE_CLASSES.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {VEHICLE_CLASSES.map((v, i) => (
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

      <section className="panel mt-4 p-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Vehicle Density by Hour</h2>
        <div className="mt-3 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={VEHICLE_DENSITY_HOURLY} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid {...chartAxis.grid} />
              <XAxis dataKey="hour" {...chartAxis.axis} />
              <YAxis {...chartAxis.axis} />
              <Tooltip {...chartTooltip} cursor={{ fill: "oklch(0.28 0.02 250 / 0.4)" }} />
              <Bar dataKey="density" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Traffic Bottlenecks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="label-xs border-b border-border text-left">
                <th className="px-4 py-2 font-medium">Route</th>
                <th className="px-4 py-2 font-medium">Location</th>
                <th className="px-4 py-2 font-medium">Density</th>
                <th className="px-4 py-2 font-medium">Delay</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {BOTTLENECKS.map((b, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{b.route}</td>
                  <td className="px-4 py-2.5">{b.location}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={DENSITY_TONE[b.density as keyof typeof DENSITY_TONE]}>
                      {b.density}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{b.delay}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
