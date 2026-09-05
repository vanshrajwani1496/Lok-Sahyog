import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { StatusDot } from "./StatusBadge";
import { cn } from "@/lib/utils";

/**
 * Bus camera panel. Uses a native <video> element so the real MJPEG/WebRTC
 * stream from the phone (relayed by the edge laptop) can be dropped in via
 * `streamUrl` without touching the layout.
 */
export function CameraFeed({
  busId,
  streamUrl,
  compact = false,
}: {
  busId?: string;
  streamUrl?: string;
  compact?: boolean;
}) {
  const { buses, demoMode, lastEvent } = useStore();
  const bus = buses.find((b) => b.id === busId) ?? buses[0]!;
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    if (!lastEvent || !lastEvent.bbox) {
      if (!demoMode) return;
      setBox({
        x: 18 + Math.random() * 40,
        y: 42 + Math.random() * 26,
        w: 16 + Math.random() * 14,
        h: 12 + Math.random() * 10,
      });
    } else {
      const [nx1, ny1, nx2, ny2] = lastEvent.bbox;
      setBox({
        x: nx1 * 100,
        y: ny1 * 100,
        w: (nx2 - nx1) * 100,
        h: (ny2 - ny1) * 100,
      });
    }
    const t = setTimeout(() => setBox(null), 4200);
    return () => clearTimeout(t);
  }, [lastEvent, demoMode]);

  const confidence = lastEvent ? Math.round(lastEvent.confidence * 100) : 94;

  const [ipAddress, setIpAddress] = useState("192.168.0.103");
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase">Live Edge Camera</h2>
          <p className="font-mono text-xs text-muted-foreground">
            {bus.id} · RAW MJPEG FEED
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isStreaming ? (
            <>
              <input
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.x.x"
                className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs outline-none focus:border-primary/50 w-32"
              />
              <button
                onClick={() => setIsStreaming(true)}
                className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/30"
              >
                CONNECT
              </button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-success uppercase">
                <StatusDot tone="success" pulse /> Streaming
              </span>
              <button
                onClick={() => setIsStreaming(false)}
                className="rounded bg-critical/20 px-2 py-1 text-[10px] font-medium text-critical hover:bg-critical/30 ml-2"
              >
                DISCONNECT
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "relative w-full overflow-hidden bg-[oklch(0.13_0.01_250)]",
          compact ? "aspect-[16/10]" : "aspect-video",
        )}
      >
        {isStreaming ? (
          <img
            src={`http://${ipAddress}:8080/video`}
            className="size-full object-cover opacity-90"
            alt="Live IP Webcam Feed"
            onError={() => setIsStreaming(false)}
          />
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,oklch(0.32_0.01_250),oklch(0.14_0.01_250)_70%)]" />
            <div className="flex items-center justify-center size-full absolute inset-0">
              <span className="text-muted-foreground font-mono text-xs">NO ACTIVE STREAM CONNECTED</span>
            </div>
          </>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/40 scan-line" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded border border-border/60 bg-background/70 px-1.5 py-0.5 font-mono text-[10px]">
            CAM-01
          </span>
          <span className="flex items-center gap-1 rounded border border-critical/50 bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-critical">
            <StatusDot tone="critical" pulse /> LIVE
          </span>
        </div>

        <div className="absolute top-3 right-3 space-y-1 text-right font-mono text-[10px] text-foreground/85">
          {bus?.lat && bus?.lng ? (
            <>
              <div>GPS {bus.lat.toFixed(4)}° N</div>
              <div>{bus.lng.toFixed(4)}° E</div>
            </>
          ) : (
            <>
              <div>GPS -- N</div>
              <div>-- E</div>
            </>
          )}
          <div className="text-success">AI ACTIVE</div>
        </div>

        {box && (
          <div
            className="absolute rounded-sm border-2 border-critical/90 bg-critical/10 transition-all"
            style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
          >
            <span className="absolute -top-5 left-0 rounded-sm bg-critical px-1.5 py-px font-mono text-[10px] font-semibold text-destructive-foreground">
              POTHOLE {confidence}%
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded border border-border/60 bg-background/70 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          YOLOv8n · 640×640 · conf ≥ 0.60
        </div>
      </div>
    </section>
  );
}
