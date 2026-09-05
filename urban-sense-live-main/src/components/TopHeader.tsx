import { useEffect, useState } from "react";
import { Settings, UserRound, Moon, Sun } from "lucide-react";
import { MetaStat, StatusDot } from "./StatusBadge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { demoMode, toggleDemoMode, buses } = useStore();
  const [time, setTime] = useState<string>("--:--:--");
  const [isDark, setIsDark] = useState(false);
  const streaming = buses.find((b) => b.camera)?.id ?? "BUS-042";

  useEffect(() => {
    // Check initial state
    setIsDark(document.documentElement.classList.contains("dark"));

    const tick = () => setTime(new Date().toLocaleTimeString("en-GB"));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/60 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <div className="text-sm font-semibold tracking-wide">Lok-Sahyog</div>
          <div className="text-[11px] text-muted-foreground">National Operations Platform</div>
        </div>
        <span className="hidden items-center gap-2 rounded border border-success/30 bg-success/10 px-2 py-1 text-[11px] font-medium tracking-wide text-success uppercase sm:inline-flex">
          <StatusDot tone="success" pulse /> Live System
        </span>
        {demoMode && (
          <span className="inline-flex items-center gap-2 rounded border border-warning/40 bg-warning/10 px-2 py-1 text-[11px] font-medium tracking-wide text-warning uppercase">
            <StatusDot tone="warning" pulse /> Demo Mode Active
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden items-center gap-5 xl:flex">
          <MetaStat label="GPS" value="CONNECTED" />
          <MetaStat label="AI Engine" value="RUNNING" tone="info" />
          <MetaStat label={streaming} value="STREAMING" tone="info" />
        </div>
        <span className="hidden font-mono text-xs text-muted-foreground md:inline">{time}</span>
        <button
          type="button"
          onClick={toggleDemoMode}
          className={cn(
            "rounded-md border px-2.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors",
            demoMode
              ? "border-warning/50 bg-warning/15 text-warning"
              : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          Demo Mode
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              document.documentElement.classList.toggle("dark");
              setIsDark(!isDark);
            }}
            className="grid size-8 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button className="grid size-8 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground">
            <Settings className="size-4" />
          </button>
          <button className="grid size-8 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground">
            <UserRound className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
