import { CAPABILITIES } from "@/lib/mockData";
import type { ModuleStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ModuleStatus, string> = {
  active: "ACTIVE",
  ready: "READY FOR AI MODEL",
  pending: "MODEL PENDING",
  analytics: "ANALYTICS ACTIVE",
};

const STATUS_STYLE: Record<ModuleStatus, string> = {
  active: "text-success border-success/40 bg-success/10",
  ready: "text-info border-info/30 bg-info/8",
  pending: "text-muted-foreground border-border bg-surface-2/60",
  analytics: "text-warning border-warning/30 bg-warning/8",
};

export function DetectionCapabilities({
  compact = false,
  title = "Detection Capabilities",
}: {
  compact?: boolean;
  title?: string;
}) {
  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase">{title}</h2>
        <span className="text-[11px] text-muted-foreground">
          1 of {CAPABILITIES.length} models deployed
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Pothole detection is the currently implemented YOLO module. Remaining categories are
        architecture-ready integration slots — not active models.
      </p>
      <div
        className={cn(
          "mt-4 grid gap-2",
          compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-2",
        )}
      >
        {CAPABILITIES.map((c) => (
          <div
            key={c.key}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2/40 px-3 py-2",
              c.status === "active" && "border-success/35 bg-success/[0.06]",
            )}
          >
            <div className="min-w-0">
              <div className="truncate text-sm">{c.label}</div>
              <div className="truncate text-[11px] text-muted-foreground">{c.note}</div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
                STATUS_STYLE[c.status],
              )}
            >
              {c.status === "active" ? "● " : "○ "}
              {STATUS_LABEL[c.status]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
