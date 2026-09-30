import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bus as BusIcon, Camera, Cpu, Gauge, Satellite, X, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, StatusDot } from "@/components/StatusBadge";
import { CameraFeed } from "@/components/CameraFeed";
import { LiveMap } from "@/components/LiveMap";
import { useStore } from "@/lib/store";
import { TYPE_LABEL } from "@/lib/mockData";
import type { Bus } from "@/lib/types";
import { cn, getAreaName } from "@/lib/utils";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Fleet Monitoring — Urban Eye" },
      {
        name: "description",
        content:
          "Status of every bus-mounted sensing unit: camera stream, GPS lock, on-board AI inference and detections contributed today.",
      },
      { property: "og:title", content: "Fleet Monitoring — Urban Eye" },
      {
        property: "og:description",
        content: "Live status of the bus sensing fleet feeding the control centre.",
      },
    ],
  }),
  component: FleetPage,
});

const TONE = { online: "success", warning: "warning", offline: "muted" } as const;

function BusCard({ bus, onOpen }: { bus: Bus; onOpen: () => void }) {
  const { events } = useStore();

  // Find critical behavioral faults like rash driving from bus feed
  const checkTime = new Date().getTime() - 86400000;
  let alertEvent = events.find(e =>
    e.busId === bus.id &&
    (e.type === "rash_driving" || e.type === "pedestrian_risk" || e.type === "incident_vehicle" || e.severity === "critical") &&
    new Date(e.timestamp).getTime() > checkTime
  );

  // Force one bus to be abnormal permanently for presentation demo
  if (bus.id === "TS09AB1234") {
    alertEvent = { type: "rash_driving" } as any;
  }

  return (
    <button
      onClick={onOpen}
      className={cn(
        "panel p-4 text-left transition-colors border-2",
        bus.status === "offline" && "opacity-60 hover:border-primary/40 border-transparent",
        alertEvent && "border-critical bg-critical/5 shadow-[0_0_15px_rgba(var(--critical),0.15)] hover:bg-critical/10 hover:border-critical",
        !alertEvent && bus.status !== "offline" && "hover:border-primary/40 border-transparent"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 font-mono text-base font-bold text-foreground">
            {alertEvent ? <span className="flex items-center text-critical"><AlertTriangle className="mr-1 size-5 fill-critical/20" />🔴</span> : (bus.status === "offline" ? "⚫" : "🟢")} {bus.id}
          </span>
          {alertEvent ? (
            <div className="text-sm font-bold text-critical ml-6 mt-1 flex flex-col">
              <span className="uppercase">Abnormal</span>
              <span className="text-xs font-semibold">{TYPE_LABEL[alertEvent.type]} detected</span>
            </div>
          ) : (
            <div className="text-xs font-semibold text-success ml-6 mt-1">
              {bus.status === "offline" ? "Offline" : "Normal"}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
        <span className="text-muted-foreground">Route</span>
        <span className="text-right font-mono">{bus.route}</span>
        <span className="text-muted-foreground">Speed</span>
        <span className="text-right font-mono">{bus.speed} km/h</span>
        <span className="text-muted-foreground">Detections</span>
        <span className="text-right font-mono">{bus.detections}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 border-t border-border/60 pt-3 text-[11px]">
        <span className="flex items-center gap-1.5">
          <StatusDot tone={bus.gps ? "success" : "muted"} /> GPS
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot tone={bus.camera ? "success" : "muted"} /> Camera
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot tone={bus.ai ? "info" : "muted"} /> AI {bus.fps ? `${bus.fps} FPS` : ""}
        </span>
      </div>
    </button>
  );
}

function FleetPage() {
  const { buses, events } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const bus = buses.find((b) => b.id === openId);
  const busEvents = events.filter((e) => e.busId === openId).slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Fleet Monitoring"
        subtitle="Public transport vehicles operating as mobile urban sensors."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {buses.map((b) => (
          <BusCard key={b.id} bus={b} onOpen={() => setOpenId(b.id)} />
        ))}
      </div>

      {bus && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono text-lg font-semibold">{bus.id}</h2>
              <p className="text-xs text-muted-foreground">
                Route {bus.route} · Driver {bus.driver}
              </p>
            </div>
            <button
              onClick={() => setOpenId(null)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" /> Close detail
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <CameraFeed busId={bus.id} compact />
            <div className="panel p-4">
              <h3 className="text-sm font-semibold tracking-wide uppercase">Unit Telemetry</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { icon: Gauge, label: "Speed", value: `${bus.speed} km/h` },
                  { icon: Satellite, label: "GPS", value: bus.gps ? "Locked" : "No fix" },
                  { icon: Camera, label: "Camera", value: bus.camera ? "Streaming" : "Offline" },
                  { icon: Cpu, label: "Inference", value: `${bus.fps} FPS` },
                ].map((t) => (
                  <div key={t.label} className="rounded-md border border-border bg-surface-2/40 p-3">
                    <div className="flex items-center gap-1.5">
                      <t.icon className="size-3.5 text-muted-foreground" />
                      <span className="label-xs">{t.label}</span>
                    </div>
                    <div className="mt-1 font-mono text-sm">{t.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="label-xs mb-2">Recent events</div>
                <div className="space-y-1.5">
                  {busEvents.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between rounded-md border border-border bg-surface-2/40 px-2.5 py-1.5 text-[11px]"
                    >
                      <span className="font-mono text-primary">{e.id}</span>
                      <span className="font-medium text-muted-foreground w-32 truncate" title={getAreaName(e.h3Index)}>
                        {getAreaName(e.h3Index)}
                      </span>
                      <span className="font-mono">{Math.round(e.confidence * 100)}%</span>
                    </div>
                  ))}
                  {busEvents.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">No detections yet today.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <LiveMap
            height={360}
            trailBusId={bus.id}
            title={`${bus.id} Route Trail`}
            subtitle="GPS breadcrumb trail over the detection zones."
          />
        </div>
      )}
    </div>
  );
}
