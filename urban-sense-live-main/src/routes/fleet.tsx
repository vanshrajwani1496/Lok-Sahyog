import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bus as BusIcon, Camera, Cpu, Gauge, Satellite, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, StatusDot } from "@/components/StatusBadge";
import { CameraFeed } from "@/components/CameraFeed";
import { LiveMap } from "@/components/LiveMap";
import { useStore } from "@/lib/store";
import type { Bus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Fleet Monitoring — Lok-Sahyog" },
      {
        name: "description",
        content:
          "Status of every bus-mounted sensing unit: camera stream, GPS lock, on-board AI inference and detections contributed today.",
      },
      { property: "og:title", content: "Fleet Monitoring — Lok-Sahyog" },
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
  return (
    <button
      onClick={onOpen}
      className={cn(
        "panel p-4 text-left transition-colors hover:border-primary/40",
        bus.status === "offline" && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-sm font-semibold">
          <BusIcon className="size-4 text-primary" />
          {bus.id}
        </span>
        <StatusBadge tone={TONE[bus.status]} pulse={bus.status === "online"}>
          {bus.status}
        </StatusBadge>
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
                      <span className="font-mono text-muted-foreground">
                        {e.h3Index.slice(0, 9)}…
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
            subtitle="GPS breadcrumb trail over the H3 detection grid."
          />
        </div>
      )}
    </div>
  );
}
