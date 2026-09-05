import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Radio } from "lucide-react";
import { KPIGrid } from "@/components/KPIGrid";
import { SafetyScore } from "@/components/SafetyScore";
import { LiveMap } from "@/components/LiveMap";
import { DetectionFeed } from "@/components/DetectionFeed";
import { DataPipeline } from "@/components/DataPipeline";
import { ActionNeededTable } from "@/components/ActionNeededTable";
import { StatusDot } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "City Mobility Intelligence — Lok-Sahyog" },
      {
        name: "description",
        content:
          "Real-time road condition, traffic and safety intelligence from bus-mounted mobile sensing units, aggregated into H3 zones.",
      },
      { property: "og:title", content: "City Mobility Intelligence — Lok-Sahyog" },
      {
        property: "og:description",
        content: "Live pothole detection, H3 zone risk and urban road safety scoring.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { syncLivePotholes } = useStore();

  useEffect(() => {
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
  }, [syncLivePotholes]);

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
        <div className="flex items-center gap-2">

          <Link
            to="/live"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Live Monitoring <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <KPIGrid />
      <DataPipeline />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LiveMap />
        <DetectionFeed />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SafetyScore />
        <ActionNeededTable />
      </div>
    </div>
  );
}
