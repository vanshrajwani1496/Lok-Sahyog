import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { chartAxis, chartTooltip, PIE_COLORS } from "@/components/chartTheme";
import { useMemo } from "react";
import { TYPE_LABEL } from "@/lib/mockData";

export const Route = createFileRoute("/analytics")({
    head: () => ({
        meta: [{ title: "Analytics — Urban Eye" }],
    }),
    component: AnalyticsPage,
});

function AnalyticsPage() {
    const store = useStore();
    const { events, zones, buses } = store;

    const potholeRatio = events.length > 0
        ? Math.round((events.filter(e => e.type === "pothole" || e.type === "road_damage").length / events.length) * 100)
        : 0;

    const ZONE_DATA = useMemo(() => {
        if (events.length === 0) return [];
        const zoneCounts: Record<string, number> = {};
        events.forEach(e => {
            const zName = zones.find(z => z.h3Index === e.h3Index)?.name || "Unknown Zone";
            zoneCounts[zName] = (zoneCounts[zName] || 0) + 1;
        });
        return Object.entries(zoneCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([zone, count]) => ({ zone, detections: count }));
    }, [events, zones]);

    const TYPE_DATA = useMemo(() => {
        if (events.length === 0) return [];
        const typeCounts: Record<string, number> = {};
        events.forEach(e => {
            const label = (TYPE_LABEL as any)[e.type] || e.type;
            typeCounts[label] = (typeCounts[label] || 0) + 1;
        });
        return Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));
    }, [events]);

    const DAILY_DATA = useMemo(() => {
        if (events.length === 0) return [{ day: "Mon", detections: 0 }];
        const dayCounts: Record<string, number> = {};
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        events.forEach(e => {
            const date = new Date(e.timestamp);
            const dayName = days[date.getDay()] as string;
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        });
        // Create an ordered array starting from Mon
        const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return orderedDays.map(day => ({
            day,
            detections: dayCounts[day] || 0
        }));
    }, [events]);

    const BUS_DATA = useMemo(() => {
        if (events.length === 0) return buses.slice(0, 5).map(b => ({ route: b.id, normal: 0, abnormal: 0 }));
        const busCounts: Record<string, { normal: number, abnormal: number }> = {};
        events.forEach(e => {
            const busId = e.busId || "Unknown Bus";
            if (!busCounts[busId]) busCounts[busId] = { normal: 0, abnormal: 0 };

            if (e.severity === "high" || e.severity === "critical") {
                busCounts[busId].abnormal += 1;
            } else {
                busCounts[busId].normal += 1; // Everything else (low risk / vehicle passes)
            }
        });
        return Object.entries(busCounts)
            .sort((a, b) => (b[1].abnormal + b[1].normal) - (a[1].abnormal + a[1].normal))
            .slice(0, 6)
            .map(([route, counts]) => ({ route, ...counts }));
    }, [events, buses]);

    return (
        <div className="pb-10">
            <PageHeader
                title="Urban Analytics"
                subtitle="City-wide aggregation of structural metrics and AI confidence trends."
            />
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="panel p-5">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Total Events Logged</div>
                    <div className="text-4xl font-bold font-mono text-primary mt-2">{events.length}</div>
                </div>
                <div className="panel p-5">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Critical Hotspots</div>
                    <div className="text-4xl font-bold font-mono text-critical mt-2">
                        {zones.filter(z => z.risk === "critical" || z.risk === "high").length}
                    </div>
                </div>
                <div className="panel p-5">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Road Faults</div>
                    <div className="text-4xl font-bold font-mono text-warning mt-2">{potholeRatio}%</div>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <section className="panel p-5 min-h-[300px]">
                    <h3 className="font-semibold text-sm uppercase tracking-wide mb-6">Detections by Zone</h3>
                    <div className="h-64 flex items-center justify-center">
                        {ZONE_DATA.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ZONE_DATA} margin={{ left: -20, right: 8, top: 10 }}>
                                    <CartesianGrid {...chartAxis.grid} />
                                    <XAxis dataKey="zone" {...chartAxis.axis} stroke="currentColor" />
                                    <YAxis {...chartAxis.axis} stroke="currentColor" />
                                    <RechartsTooltip {...chartTooltip} cursor={{ fill: "oklch(0.28 0.02 250 / 0.4)" }} />
                                    <Bar dataKey="detections" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <span className="text-sm font-semibold text-muted-foreground">Insufficient DataStream Pipeline</span>}
                    </div>
                </section>

                <section className="panel p-5 min-h-[300px]">
                    <h3 className="font-semibold text-sm uppercase tracking-wide mb-6">Detection Types</h3>
                    <div className="h-64 flex flex-col items-center justify-center">
                        {TYPE_DATA.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={TYPE_DATA} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="none">
                                            {TYPE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip {...chartTooltip} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                                    {TYPE_DATA.map((v, i) => (
                                        <span key={v.name} className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                            <span className="size-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            {v.name}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : <span className="text-sm font-semibold text-muted-foreground">Insufficient DataStream Pipeline</span>}
                    </div>
                </section>

                <section className="panel p-5 min-h-[300px]">
                    <h3 className="font-semibold text-sm uppercase tracking-wide mb-6">Daily Detections</h3>
                    <div className="h-64 flex items-center justify-center">
                        {events.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={DAILY_DATA} margin={{ left: -20, right: 8, top: 10 }}>
                                    <CartesianGrid {...chartAxis.grid} />
                                    <XAxis dataKey="day" {...chartAxis.axis} stroke="currentColor" />
                                    <YAxis {...chartAxis.axis} stroke="currentColor" />
                                    <RechartsTooltip {...chartTooltip} />
                                    <Line type="monotone" dataKey="detections" stroke="var(--color-chart-2)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <span className="text-sm font-semibold text-muted-foreground">Insufficient DataStream Pipeline</span>}
                    </div>
                </section>

                <section className="panel p-5 min-h-[300px]">
                    <h3 className="font-semibold text-sm uppercase tracking-wide mb-6">Bus Safety Alerts</h3>
                    <div className="h-64 flex flex-col items-center justify-center">
                        {events.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BUS_DATA} margin={{ left: -20, right: 8, top: 10 }}>
                                    <CartesianGrid {...chartAxis.grid} />
                                    <XAxis dataKey="route" {...chartAxis.axis} stroke="currentColor" />
                                    <YAxis {...chartAxis.axis} stroke="currentColor" />
                                    <RechartsTooltip {...chartTooltip} cursor={{ fill: "oklch(0.28 0.02 250 / 0.4)" }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    <Bar dataKey="normal" stackId="a" fill="var(--color-success)" name="Normal Events" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="abnormal" stackId="a" fill="var(--color-critical)" name="Abnormal Alerts" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <span className="m-auto text-sm font-semibold text-muted-foreground">Disconnected from physical Edge node</span>}
                    </div>
                </section>
            </div>
        </div>
    );
}
