import { useStore } from "@/lib/store";
import { TYPE_LABEL } from "@/lib/mockData";
import { StatusDot } from "./StatusBadge";

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : "text-xs"}>{value}</span>
    </div>
  );
}

export function AIPerceptionPanel() {
  const { events, lastEvent, demoMode, todayCount } = useStore();
  const current = lastEvent ?? events[0];

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase">AI Perception Engine</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-success uppercase">
          <StatusDot tone="success" pulse /> Running
        </span>
      </div>
      <div className="mt-2">
        <Row label="Model" value="YOLOv8n · pothole.pt" />
        <Row label="Inference" value={demoMode ? "32 FPS" : "30 FPS"} />
        <Row label="Confidence threshold" value="60%" />
        <Row label="Frames processed" value={(18420 + events.length * 37).toLocaleString()} />
        <Row label="Detections today" value={String(todayCount)} />
        <Row
          label="Current detection"
          value={
            current
              ? `${TYPE_LABEL[current.type].toUpperCase()} — ${Math.round(current.confidence * 100)}%`
              : "IDLE"
          }
        />
      </div>
    </section>
  );
}
