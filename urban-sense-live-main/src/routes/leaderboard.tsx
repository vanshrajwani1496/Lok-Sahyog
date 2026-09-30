import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import { getAreaName } from "@/lib/utils";
import { Trophy, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
    component: LeaderboardPage,
});

const CITIES = [
    { id: "HYD", name: "Hyderabad (GHMC)", baseScore: 0 },
    { id: "BLR", name: "Bengaluru (BBMP)", baseScore: 68 },
    { id: "DEL", name: "New Delhi (NDMC)", baseScore: 45 },
    { id: "MUM", name: "Mumbai (BMC)", baseScore: 62 },
    { id: "PUN", name: "Pune (PMC)", baseScore: 71 },
];

function LeaderboardPage() {
    const store = useStore();
    const [tab, setTab] = useState<"city" | "national">("national");
    const localCityId = localStorage.getItem("city_id") || "HYD";
    const localCityName = CITIES.find(c => c.id === localCityId)?.name || "Hyderabad (GHMC)";

    // Calculate local City Zones Leaderboard
    const localLeaderboard = useMemo(() => {
        return store.zones
            .map((z) => {
                const zoneEvents = store.events.filter((e) => e.h3Index === z.h3Index);
                const resolved = zoneEvents.filter((e) => e.status === "resolved").length;
                const total = zoneEvents.length;
                const resRate = total > 0 ? (resolved / total) * 100 : 100;

                // Calculate a dynamic SLA score based on the raw road health and resolution rate
                const dynamicScore = Math.min(100, Math.round((z.roadHealth * 0.6) + (resRate * 0.4)));

                return {
                    id: z.h3Index,
                    name: z.name || getAreaName(z.h3Index),
                    score: dynamicScore,
                    resolved,
                    total,
                    risk: z.risk,
                };
            })
            .sort((a, b) => b.score - a.score);
    }, [store.zones, store.events]);

    // Calculate National Cities Leaderboard (injecting dynamic HYD score)
    const nationalLeaderboard = useMemo(() => {
        // Hyderabad's score is the average of its local zones
        const hydScore =
            localLeaderboard.length > 0
                ? Math.round(
                    localLeaderboard.reduce((acc, curr) => acc + curr.score, 0) /
                    localLeaderboard.length
                )
                : 75;

        return CITIES.map((c) => ({
            ...c,
            score: c.id === localCityId ? hydScore : c.baseScore,
            resolved: c.id === localCityId ? localLeaderboard.reduce((a, c) => a + c.resolved, 0) : Math.round(c.baseScore * 12),
            active: c.id === localCityId ? localLeaderboard.reduce((a, c) => a + (c.total - c.resolved), 0) : Math.round((100 - c.baseScore) * 3),
        })).sort((a, b) => b.score - a.score);
    }, [localLeaderboard]);

    return (
        <div className="pb-10">
            <PageHeader
                title="Civic Accountability Leaderboard"
                subtitle="Ranking municipal districts and national hubs by active safety metrics and hazard resolution velocities."
            />

            <div className="mb-6 flex gap-2 border-b border-border">
                <button
                    onClick={() => setTab("national")}
                    className={cn(
                        "px-4 py-3 text-sm font-semibold tracking-wide uppercase transition-colors relative",
                        tab === "national" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    National Cities Index
                    {tab === "national" && (
                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setTab("city")}
                    className={cn(
                        "px-4 py-3 text-sm font-semibold tracking-wide uppercase transition-colors relative",
                        tab === "city" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {localCityName} Districts
                    {tab === "city" && (
                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
                    )}
                </button>
            </div>

            <div className="panel p-0 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface-2/20 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-24 text-center">Rank</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">{tab === "national" ? "City" : "Local Zone"}</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Safety Score</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right hidden md:table-cell">Resolved Hazards</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right hidden md:table-cell">Active Hazards</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {(tab === "national" ? nationalLeaderboard : localLeaderboard).map((item, idx) => (
                            <tr
                                key={item.id}
                                className={cn(
                                    "hover:bg-surface-2/40 transition-colors group",
                                    item.id === "HYD" && tab === "national" ? "bg-primary/5" : ""
                                )}
                            >
                                <td className="px-6 py-4 relative">
                                    <div className="flex items-center justify-center">
                                        {idx === 0 && <Trophy className="text-[#FFD700] size-6" />}
                                        {idx === 1 && <Trophy className="text-[#C0C0C0] size-5" />}
                                        {idx === 2 && <Trophy className="text-[#CD7F32] size-5" />}
                                        {idx > 2 && <span className="font-mono text-muted-foreground text-lg">#{idx + 1}</span>}
                                    </div>
                                    {item.id === localCityId && tab === "national" && (
                                        <div className="absolute left-0 top-0 h-full w-[3px] bg-primary" />
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn("font-bold text-base", item.id === localCityId && tab === "national" ? "text-primary" : "")}>
                                        {item.name}
                                    </span>
                                    {item.id === localCityId && tab === "national" && (
                                        <span className="ml-3 rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                            Local Instance
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "font-mono text-xl font-bold",
                                            item.score > 80 ? "text-success" : item.score > 55 ? "text-warning" : "text-critical"
                                        )}>
                                            {item.score}/100
                                        </span>
                                        {item.score > 80 ? <ShieldCheck className="text-success size-4" /> : <AlertTriangle className="text-warning size-4" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right hidden md:table-cell font-mono text-muted-foreground">
                                    <div className="flex items-center justify-end gap-2">
                                        {item.resolved} <TrendingUp className="size-3 text-success" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right hidden md:table-cell font-mono text-muted-foreground">
                                    {(item as any).active ?? ((item as any).total - (item as any).resolved)}
                                </td>
                            </tr>
                        ))}
                        {(tab === "national" ? nationalLeaderboard : localLeaderboard).length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Not enough data to compute leaderboard rankings.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
