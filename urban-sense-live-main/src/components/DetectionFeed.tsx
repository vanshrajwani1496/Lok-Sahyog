import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { TYPE_LABEL } from "@/lib/mockData";
import { shortH3 } from "@/lib/h3Utils";
import type { DetectionEvent } from "@/lib/types";
import { StatusDot } from "./StatusBadge";
import { cn, getAreaName, getStreetName } from "@/lib/utils";
import { MapPin } from "lucide-react";

export function relativeTime(ts: string, now: number) {
  const diff = Math.max(0, Math.floor((now - new Date(ts).getTime()) / 1000));
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

const DOT: Record<string, string> = {
  critical: "bg-critical",
  high: "bg-critical",
  medium: "bg-warning",
  low: "bg-info",
};

export function DetectionFeed({
  height = 460,
  events,
  title,
}: {
  height?: number;
  events?: DetectionEvent[];
  title?: string;
}) {
  const store = useStore();
  const [selectedBus, setSelectedBus] = useState<string>("all");

  const uniqueBuses = useMemo(() => {
    const ids = Array.from(new Set(store.events.map(e => e.busId)));
    if (!ids.includes("ME (Demo Camera)")) ids.unshift("ME (Demo Camera)");
    return ids;
  }, [store.events]);

  const list = useMemo(() => {
    let source = events ?? store.events;
    if (!events && store.selectedZoneId) {
      source = source.filter(e => e.h3Index === store.selectedZoneId);
    }
    if (selectedBus === "all") return source;
    return source.filter(e => e.busId === selectedBus);
  }, [events, store.events, selectedBus, store.selectedZoneId]);

  const groupedEvents = useMemo(() => {
    const map = new Map<string, DetectionEvent[]>();
    for (const e of list) {
      const key = `${e.h3Index}-${e.type}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries())
      .map(([h3, group]) => ({ h3, group, latest: group[0]! }))
      .sort((a, b) => +new Date(b.latest.timestamp) - +new Date(a.latest.timestamp))
      .slice(0, 40);
  }, [list]);
  const [now, setNow] = useState(() => Date.now());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (h3: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(h3)) next.delete(h3);
      else next.add(h3);
      return next;
    });
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="panel flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          {title ? title : (store.selectedZoneId ? `Detections in ${getAreaName(store.selectedZoneId)}` : "Live Detections")}
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-success uppercase">
          <StatusDot tone="success" pulse /> Live
        </span>
        <select
          value={selectedBus}
          onChange={(e) => setSelectedBus(e.target.value)}
          className="text-[10px] ml-3 bg-surface border border-border rounded px-2 py-1 outline-none text-muted-foreground"
        >
          <option value="all">All Active Routes</option>
          {uniqueBuses.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="divide-y divide-border overflow-y-auto" style={{ height }}>
        {groupedEvents.map(({ h3, group, latest }) => (
          <button
            key={latest.id}
            onClick={() => store.selectEvent(latest.id)}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/60",
              store.selectedEventId === latest.id && "bg-surface-2/80",
            )}
          >
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[latest.severity])} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {TYPE_LABEL[latest.type].toUpperCase()}
                  {group.length > 1 && (
                    <div className="mt-1 inline-flex rounded border border-critical/40 bg-critical/10 px-1 py-px text-[9.5px] font-bold tracking-wide text-critical uppercase">
                      URGENT ACTION NEEDED
                    </div>
                  )}
                </span>
                <span className="font-mono text-xs text-primary">
                  {group.length > 1 ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-primary/10 px-1.5 py-0.5 rounded font-bold">
                        AVG {Math.round((group.reduce((acc, curr) => acc + curr.confidence, 0) / group.length) * 100)}% ({group.length}x)
                      </span>
                    </div>
                  ) : (
                    `${Math.round(latest.confidence * 100)}%`
                  )}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-[11px] text-muted-foreground">
                  <div><span className="font-semibold text-foreground">Location:</span> {getStreetName(latest.h3Index)}</div>
                  <div><span className="font-semibold text-foreground">Zone:</span> {getAreaName(latest.h3Index)}</div>
                  <div><span className="font-semibold text-foreground">Time:</span> {new Date(latest.timestamp).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</div>
                  <div><span className="font-semibold text-foreground">Status:</span> <span className="capitalize">{latest.status}</span></div>
                </div>

                {(latest.trackId || latest.evidence) && (
                  <div className="mt-2 flex flex-col gap-1 border-t border-border/50 pt-2">
                    {latest.trackId !== undefined && (
                      <div className="text-[10px] text-muted-foreground">
                        <span className="font-semibold">TRACKING ID:</span> REF-{latest.trackId}
                      </div>
                    )}
                    {latest.evidence && (
                      <div className="text-[10px] bg-primary/5 p-1.5 rounded border border-primary/20 text-primary flex items-center">
                        <div className="font-black uppercase tracking-widest mr-2 text-[9px]">EVIDENCE:</div>
                        <div>
                          {latest.evidence.vehicle_count && `${latest.evidence.vehicle_count} vehicles present within bounding volume`}
                          {latest.evidence.displacement && `Displacement factor: ${latest.evidence.displacement.toFixed(3)} (Stagnant trajectory)`}
                          {latest.evidence.nearby_vehicle_count && `${latest.evidence.nearby_vehicle_count} localized kinetic intersections tracked`}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div />
                  <div className="flex items-center gap-2">
                    {group.length > 1 && (
                      <button
                        onClick={(e) => toggleExpand(h3, e)}
                        className="flex items-center gap-1 rounded bg-surface-2 border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expanded.has(h3) ? "HIDE DETAILS" : "VIEW SCORES"}
                      </button>
                    )}
                    <button
                      onClick={(err) => {
                        err.stopPropagation();
                        window.open(`https://www.google.com/maps/search/?api=1&query=${latest.latitude},${latest.longitude}`, "_blank");
                      }}
                      className="flex items-center gap-1 rounded bg-surface-2 border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      <MapPin className="size-3" /> MAP
                    </button>
                  </div>
                </div>
              </div>
              {/* Expandable Feed for Individual Scores */}
              {expanded.has(h3) && group.length > 1 && (
                <div className="mt-3 flex flex-col gap-1.5 border-t border-border/50 pt-2">
                  {group.map((e, idx) => (
                    <div key={e.id} className="flex items-center justify-between rounded border border-border/50 bg-background/50 px-2 py-1">
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        #{group.length - idx} · {relativeTime(e.timestamp, now)}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        {Math.round(e.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
        {groupedEvents.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No detections recorded in this zone.
          </div>
        )}
      </div>
    </section>
  );
}
