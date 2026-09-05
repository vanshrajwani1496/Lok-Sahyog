import { ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { shortH3 } from "@/lib/h3Utils";
import { TYPE_LABEL } from "@/lib/mockData";
import { StatusDot } from "./StatusBadge";
import { cn } from "@/lib/utils";

export function DataPipeline() {
  const { lastEvent, demoMode, events } = useStore();
  const e = lastEvent ?? events[0];

  const stages = [
    { title: "Phone Camera", value: "CONNECTED", mono: false },
    { title: "Video Stream", value: "RECEIVING", mono: false },
    { title: "YOLO Engine", value: "PROCESSING", mono: false },
    { title: "GPS", value: e ? `${e.latitude}, ${e.longitude}` : "—", mono: true },
    { title: "H3 Cell", value: e ? shortH3(e.h3Index) : "—", mono: true },
    {
      title: "Event",
      value: e ? `${TYPE_LABEL[e.type].toUpperCase()} ${Math.round(e.confidence * 100)}%` : "IDLE",
      mono: true,
    },
    { title: "Control Centre", value: "UPDATED", mono: false },
  ];

  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Live Data Pipeline</h2>
        <span className="text-[11px] text-muted-foreground">
          phone → edge laptop → FastAPI → control centre
        </span>
      </div>
      <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {stages.map((s, i) => (
          <div key={s.title} className="flex items-center gap-1">
            <div
              className={cn(
                "min-w-[132px] rounded-md border border-border bg-surface-2/40 px-3 py-2",
                demoMode && "border-primary/30",
              )}
            >
              <div className="flex items-center gap-1.5">
                <StatusDot tone={i === 6 ? "info" : "success"} pulse={demoMode} />
                <span className="label-xs">{s.title}</span>
              </div>
              <div
                className={cn(
                  "mt-1 truncate text-xs",
                  s.mono ? "font-mono text-foreground" : "text-success",
                )}
              >
                {s.value}
              </div>
            </div>
            {i < stages.length - 1 && (
              <ChevronRight
                className={cn("size-4 shrink-0 text-muted-foreground", demoMode && "text-primary")}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
