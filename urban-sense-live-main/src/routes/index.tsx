import { useEffect, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, Radio } from "lucide-react";
import { KPIGrid } from "@/components/KPIGrid";
import { SafetyScore } from "@/components/SafetyScore";
import { LiveMap } from "@/components/LiveMap";
import { DetectionFeed } from "@/components/DetectionFeed";
import { ActionNeededTable } from "@/components/ActionNeededTable";
import { StatusDot } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { getAreaName, ZONES } from "@/lib/utils";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("urban_eye_token")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "City Mobility Intelligence — Urban Eye" },
      {
        name: "description",
        content:
          "Real-time road condition, traffic and safety intelligence from bus-mounted mobile sensing units, aggregated into zones.",
      },
      { property: "og:title", content: "City Mobility Intelligence — Urban Eye" },
      {
        property: "og:description",
        content: "Live pothole detection, zone risk and urban road safety scoring.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { syncLivePotholes, selectedZoneId, events, selectZone } = useStore();
  const activeZone = typeof window !== "undefined" ? localStorage.getItem("zone") : null;
  const userRole = typeof window !== "undefined" ? (localStorage.getItem("role") || localStorage.getItem("urban_eye_role")) : null;
  const allowedZones = userRole === "admin" || userRole === "zonal_commissioner"
    ? ["All Zones", ...ZONES]
    : [activeZone || "Khairatabad"];

  const [activeOverviewZone, setActiveOverviewZone] = useState<string>(
    userRole === "admin" || userRole === "zonal_commissioner" ? "All Zones" : (activeZone || "Khairatabad")
  );

  useEffect(() => {
    // Legacy H3 hex selection bypass
    if (selectedZoneId && selectedZoneId.length > 10) return;

    const syncBackendPotholes = async () => {
      try {
        const livePotholes = await api.potholes();
        if (livePotholes && livePotholes.length > 0) {
          syncLivePotholes(livePotholes);
        }
      } catch (err) {
        console.warn("FastAPI backend offline, waiting for connection...", err);
      }
    };

    syncBackendPotholes();
    const interval = setInterval(syncBackendPotholes, 3000);
    return () => clearInterval(interval);
  }, [syncLivePotholes, selectedZoneId]);

  const filteredEvents = activeOverviewZone === "All Zones"
    ? events
    : events.filter(e => getAreaName(e.h3Index) === activeOverviewZone);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium tracking-wide text-success uppercase">
            <StatusDot tone="success" pulse /> Live monitoring active
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">City Mobility Intelligence</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Real-time road condition, traffic and safety intelligence from mobile sensing units.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Zone</span>
            <select
              value={activeOverviewZone}
              onChange={(e) => setActiveOverviewZone(e.target.value)}
              className="mt-1 block w-40 rounded-md border border-border bg-surface px-3 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[34px]"
            >
              {allowedZones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <Link
            to="/live"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground h-[34px]"
          >
            Live Monitoring <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <KPIGrid events={filteredEvents} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LiveMap
          events={
            selectedZoneId
              ? events.filter((e) => e.h3Index === selectedZoneId)
              : filteredEvents
          }
        />
        <DetectionFeed
          events={
            selectedZoneId
              ? events.filter((e) => e.h3Index === selectedZoneId)
              : filteredEvents
          }
          title={activeOverviewZone === "All Zones" ? "City-Wide Det. Feed" : `${activeOverviewZone} Feed`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SafetyScore events={filteredEvents} />
        <ActionNeededTable events={filteredEvents} />
      </div>
    </div>
  );
}
