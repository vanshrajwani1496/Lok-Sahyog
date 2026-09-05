import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "critical" | "info" | "muted";

const DOT: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical",
  info: "bg-info",
  muted: "bg-muted-foreground",
};

const TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
  info: "text-info",
  muted: "text-muted-foreground",
};

export function StatusDot({
  tone = "success",
  pulse = false,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        DOT[tone],
        pulse && "pulse-dot",
        className,
      )}
    />
  );
}

export function StatusBadge({
  tone = "success",
  children,
  pulse = false,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-border/70 bg-surface-2/60 px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        TEXT[tone],
        className,
      )}
    >
      <StatusDot tone={tone} pulse={pulse} />
      {children}
    </span>
  );
}

export function MetaStat({
  label,
  value,
  tone = "success",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="label-xs">{label}</span>
      <span className={cn("flex items-center gap-1.5 text-xs font-medium", TEXT[tone])}>
        <StatusDot tone={tone} pulse />
        {value}
      </span>
    </div>
  );
}

export const severityTone = (s: string): Tone =>
  s === "critical" ? "critical" : s === "high" ? "critical" : s === "medium" ? "warning" : "info";
