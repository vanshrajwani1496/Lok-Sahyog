import { useStore } from "@/lib/store";
import { WEIGHTS, computeSafety } from "@/lib/scoring";
import { cn } from "@/lib/utils";

function Bar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const tone = value >= 80 ? "bg-success" : value >= 65 ? "bg-warning" : "bg-critical";
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">
          {label} <span className="text-[10px] opacity-60">· {Math.round(weight * 100)}%</span>
        </span>
        <span className="font-mono tabular-nums">{value}/100</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("h-full rounded-full transition-all duration-700", tone)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

import type { DetectionEvent } from "@/lib/types";

export function SafetyScore({ events }: { events?: DetectionEvent[] }) {
  const store = useStore();

  // Conditionally intercept the mathematical safety calculation if a localized prop filter is active
  const safety = events ? computeSafety(events, store.zones) : store.safety;

  const s = safety.overall;
  const circumference = 2 * Math.PI * 52;
  const stroke = s >= 80 ? "text-success" : s >= 65 ? "text-warning" : "text-critical";
  const delta = events ? 0 : s - store.prevSafety; // Hide delta if we are looking at segmented non-global states

  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">URBAN ROAD SAFETY SCORE</h2>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            Prototype composite metric reflecting detected road hazards, traffic density and
            pedestrian-risk events across monitored H3 zones.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative grid size-[132px] shrink-0 place-items-center">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r="52" className="stroke-surface-2" strokeWidth="9" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className={cn("transition-all duration-700", stroke)}
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - s / 100)}
            />
          </svg>
          <div className="absolute text-center">
            <div className="font-mono text-3xl font-semibold tabular-nums">{s}</div>
            <div className="label-xs">/ 100</div>
            <div className={cn("mt-0.5 text-[11px] font-semibold", stroke)}>{safety.label}</div>
          </div>
        </div>

        <div className="grid flex-1 gap-3">
          <Bar label="Road Condition" value={safety.road} weight={WEIGHTS.road} />
          <Bar label="Traffic Flow" value={safety.traffic} weight={WEIGHTS.traffic} />
          <Bar label="Pedestrian Safety" value={safety.pedestrian} weight={WEIGHTS.pedestrian} />
          <Bar label="Infrastructure" value={safety.infrastructure} weight={WEIGHTS.infrastructure} />
        </div>
      </div>

      {delta !== 0 && (
        <div className="mt-4 rounded-md border border-border bg-surface-2/50 px-3 py-2 font-mono text-xs">
          <span className="text-muted-foreground">Score impact of latest detection: </span>
          <span className={delta < 0 ? "text-critical" : "text-success"}>
            {store.prevSafety} → {s} ({delta > 0 ? "+" : ""}
            {delta})
          </span>
        </div>
      )}
    </section>
  );
}
