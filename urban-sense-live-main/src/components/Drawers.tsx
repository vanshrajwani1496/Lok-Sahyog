import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { TYPE_LABEL } from "@/lib/mockData";
import { severityTone, StatusBadge } from "./StatusBadge";
import { cn, getAreaName } from "@/lib/utils";

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-background/60 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 flex h-screen w-full max-w-[24rem] flex-col border-l border-border bg-surface shadow-panel transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-xs">{value}</span>
    </div>
  );
}

const btn =
  "flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary text-center";

export function EventDrawer() {
  const store = useStore();
  const event = store.events.find((e) => e.id === store.selectedEventId);
  return (
    <Drawer
      open={!!event}
      onClose={() => store.selectEvent(null)}
      title={event ? `${TYPE_LABEL[event.type]} Detection` : "Detection"}
    >
      {event && (
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-primary">{event.id}</span>
            <StatusBadge tone={severityTone(event.severity)}>{event.severity}</StatusBadge>
          </div>
          <div className="mt-4">
            <Field label="Confidence" value={`${Math.round(event.confidence * 100)}%`} />
            <Field label="Bus" value={event.busId} />
            <Field label="Zone" value={getAreaName(event.h3Index)} />
            <Field
              label="Detected"
              value={new Date(event.timestamp).toLocaleTimeString("en-GB")}
            />
            <Field label="Status" value={event.status.toUpperCase()} />
          </div>
          {event.simulated && (
            <p className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-[11px] text-warning">
              Sample event for a planned detection module. No AI model is deployed for this category
              yet.
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button className={btn} onClick={() => store.selectZone(event.h3Index)}>
              View Zone
            </button>
            <Link to="/incidents" className={btn} onClick={() => store.selectEvent(null)}>
              View Incident
            </Link>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className={btn}
              onClick={() => store.setEventStatus(event.id, "acknowledged")}
            >
              Acknowledge
            </button>
            <button className={btn} onClick={() => store.setEventStatus(event.id, "resolved")}>
              Resolve
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export function ZoneDrawer() {
  const store = useStore();
  const zone = store.zones.find((z) => z.h3Index === store.selectedZoneId);
  return (
    <Drawer
      open={!!zone}
      onClose={() => store.selectZone(null)}
      title="Zone Intelligence"
    >
      {zone && (
        <div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs text-primary">{getAreaName(zone.h3Index)}</span>
            <StatusBadge tone={severityTone(zone.risk)}>{zone.risk}</StatusBadge>
          </div>
          <div className="mt-4">
            <Field label="Road health" value={`${zone.roadHealth}/100`} />
            <Field label="Total detections" value={String(zone.incidents)} />
            <Field label="Potholes" value={String(zone.counts["pothole"] ?? 0)} />
            <Field label="Road damage" value={String(zone.counts["road_damage"] ?? 0)} />
            <Field label="Traffic" value={zone.traffic.toUpperCase()} />
            <Field
              label="Last detection"
              value={
                zone.lastDetection
                  ? new Date(zone.lastDetection).toLocaleTimeString("en-GB")
                  : "—"
              }
            />
          </div>
          {zone.incidents > 20 && (
            <p className="mt-3 rounded-md border border-critical/30 bg-critical/10 px-3 py-2 text-[11px] font-bold tracking-wide text-critical animate-pulse">
              ACTION NEEDED: Extensively corroborated structural failure. Immediate maintenance required!
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Link to="/road" className={btn} onClick={() => store.selectZone(null)}>
              View Details
            </Link>
            <button className={btn} onClick={() => store.markZoneMaintenance(zone.h3Index)}>
              Mark for Maintenance
            </button>
          </div>

          <div className="mt-5">
            <div className="label-xs mb-2">Recent detections in zone</div>
            <div className="space-y-1.5">
              {store.events
                .filter((e) => e.h3Index === zone.h3Index)
                .slice(0, 6)
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => store.selectEvent(e.id)}
                    className="flex w-full items-center justify-between rounded-md border border-border bg-surface-2/50 px-2.5 py-1.5 text-left text-[11px] hover:border-primary/40"
                  >
                    <span>{TYPE_LABEL[e.type]}</span>
                    <span className="font-mono text-primary">
                      {Math.round(e.confidence * 100)}%
                    </span>
                  </button>
                ))}
              {store.events.filter((e) => e.h3Index === zone.h3Index).length === 0 && (
                <p className="text-[11px] text-muted-foreground">No detections recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
