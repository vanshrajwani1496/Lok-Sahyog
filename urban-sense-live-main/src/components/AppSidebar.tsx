import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bus,
  LayoutDashboard,
  Network,
  Route as RouteIcon,
  ShieldAlert,
  TrafficCone,
} from "lucide-react";
import { StatusDot } from "./StatusBadge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/live", label: "Live Monitoring", icon: Activity },
  { to: "/road", label: "Road Intelligence", icon: RouteIcon },
  { to: "/traffic", label: "Traffic Intelligence", icon: TrafficCone },
  { to: "/incidents", label: "Incidents", icon: ShieldAlert },
  { to: "/fleet", label: "Fleet", icon: Bus },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/architecture", label: "System Architecture", icon: Network },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="sticky top-0 hidden h-screen w-[15rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 backdrop-blur-xl lg:flex xl:w-[16rem]">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="grid size-8 place-items-center rounded-md border border-primary/30 bg-primary/12 p-1">
          <Activity className="size-5 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">Lok-Sahyog</div>
          <div className="text-[11px] text-muted-foreground">National Operations Platform</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto py-4 pr-3">
        <div className="label-xs px-4 pb-2">Control Centre</div>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex items-center gap-2.5 rounded-r-lg py-2 pr-3 pl-4 text-sm transition-colors",
                active
                  ? "nav-active font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r bg-primary transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="label-xs">System Status</div>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-success">
          <StatusDot tone="success" pulse />
          ALL SYSTEMS OPERATIONAL
        </div>
        <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
          <div className="flex justify-between">
            <span>API</span>
            <span className="font-mono">FastAPI · v0.4</span>
          </div>
          <div className="flex justify-between">
            <span>Spatial index</span>
            <span className="font-mono">H3 · res 9</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar/70 backdrop-blur-xl px-3 py-2 lg:hidden">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs",
              active ? "nav-active font-medium" : "text-muted-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
