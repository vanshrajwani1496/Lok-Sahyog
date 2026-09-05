import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { severityTone, StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { TYPE_LABEL } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/incidents")({
  head: () => ({
    meta: [
      { title: "Incident Management — Lok-Sahyog" },
      {
        name: "description",
        content:
          "Searchable register of GPS-tagged road hazard incidents detected by the fleet, with severity, confidence and H3 zone context.",
      },
      { property: "og:title", content: "Incident Management — Lok-Sahyog" },
      {
        property: "og:description",
        content: "Track, acknowledge and resolve AI-detected road hazard incidents.",
      },
    ],
  }),
  component: IncidentsPage,
});

const STATUSES = ["all", "open", "acknowledged", "resolved"] as const;

function IncidentsPage() {
  const store = useStore();
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      store.events.filter(
        (e) =>
          (status === "all" || e.status === status) &&
          (query === "" ||
            e.id.toLowerCase().includes(query.toLowerCase()) ||
            e.busId.toLowerCase().includes(query.toLowerCase()) ||
            e.h3Index.includes(query)),
      ),
    [store.events, status, query],
  );

  return (
    <div>
      <PageHeader
        title="Incident Management"
        subtitle="Every detection is stored as a GPS-tagged, H3-indexed incident record."
      />

      <div className="panel mb-4 flex flex-wrap items-center gap-2 p-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs capitalize transition-colors",
              status === s
                ? "border-primary/50 bg-primary/12 text-primary"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search incident ID, bus or H3 index…"
          className="ml-auto w-64 rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-xs outline-none focus:border-primary/50"
        />
      </div>

      <section className="panel overflow-hidden">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="label-xs border-b border-border text-left">
                <th className="px-4 py-2 font-medium">Incident ID</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Bus</th>
                <th className="px-4 py-2 font-medium">Location</th>
                <th className="px-4 py-2 font-medium">Confidence</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => store.selectEvent(e.id)}
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-surface-2/60"
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{e.id}</td>
                  <td className="px-4 py-2.5">
                    {TYPE_LABEL[e.type]}
                    {e.simulated && (
                      <span className="ml-1.5 rounded border border-border px-1 py-px text-[9px] text-muted-foreground">
                        PLANNED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge tone={severityTone(e.severity)}>{e.severity}</StatusBadge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{e.busId}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {e.latitude}, {e.longitude}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {Math.round(e.confidence * 100)}%
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {new Date(e.timestamp).toLocaleTimeString("en-GB")}
                  </td>
                  <td className="px-4 py-2.5 text-xs uppercase">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-3 mb-4 text-[11px] text-muted-foreground">
        Click any row to open the incident drawer — you stay on this page.
      </p>

    </div>
  );
}
