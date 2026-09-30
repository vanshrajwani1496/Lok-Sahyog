import { useState, useMemo } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Radio, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CameraFeed } from "@/components/CameraFeed";
import { AIPerceptionPanel } from "@/components/AIPerceptionPanel";
import { DetectionFeed } from "@/components/DetectionFeed";
import { LiveMap } from "@/components/LiveMap";
import { useStore } from "@/lib/store";
import { getAreaName, getStreetName, ZONES } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("urban_eye_token")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Live Monitoring — Urban Eye" },
      {
        name: "description",
        content:
          "Real-time AI perception from connected urban sensing units: live bus camera, YOLO pothole detection and GPS-tagged events.",
      },
      { property: "og:title", content: "Live Monitoring — Urban Eye" },
      {
        property: "og:description",
        content: "Live bus camera, YOLO inference status and live geographic events.",
      },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const store = useStore();
  const [zone, setZone] = useState<string>(() => typeof window !== "undefined" ? localStorage.getItem("zone") || "all" : "all");
  const [bus, setBus] = useState<string>("all");
  const [street, setStreet] = useState<string>("all");

  const getZoneNameForH3 = (h3: string) => {
    return store.zones.find(z => z.h3Index === h3)?.name || getAreaName(h3);
  };

  const zones = useMemo(() => Array.from(new Set(store.zones.map(z => z.name || getAreaName(z.h3Index)))), [store.zones]);

  const busesInZone = useMemo(() => {
    if (zone === "all") return [];
    // Just mock picking buses for the selected zone for the demo.
    // In reality, we could filter buses whose 'lng/lat' fall in the zone,
    // or just grab buses that have events in the zone.
    const validBusIds = new Set(
      store.events
        .filter(e => getZoneNameForH3(e.h3Index) === zone)
        .map(e => e.busId)
    );
    return store.buses.filter(b => validBusIds.has(b.id));
  }, [zone, store.events, store.buses]);

  const streetsInZone = useMemo(() => {
    if (zone === "all") return [];
    return Array.from(new Set(
      store.events
        .filter(e => getZoneNameForH3(e.h3Index) === zone)
        .map(e => getStreetName(e.h3Index))
    ));
  }, [zone, store.events]);

  const filteredEvents = useMemo(() => {
    return store.events.filter(e => {
      if (zone !== "all" && getZoneNameForH3(e.h3Index) !== zone) return false;
      if (bus !== "all" && e.busId !== bus) return false;
      if (street !== "all" && getStreetName(e.h3Index) !== street) return false;
      return true;
    });
  }, [store.events, zone, bus, street]);

  const displayBus = bus !== "all" ? bus : busesInZone[0]?.id;

  return (
    <div>
      <PageHeader
        title="Live Monitoring"
        subtitle="Real-time AI perception from connected urban sensing units."
      />
      <div className="panel p-4 mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Filter Feed</span>
        </div>
        <select
          value={zone}
          onChange={(e) => {
            setZone(e.target.value);
            store.selectZone(e.target.value === "all" ? null : e.target.value);
            setBus("all");
            setStreet("all");
          }}
          className="rounded border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary/50"
        >
          <option value="all">Select Zone</option>
          {zones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>

        {zone !== "all" && (
          <>
            <select
              value={bus}
              onChange={(e) => setBus(e.target.value)}
              className="rounded border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary/50"
            >
              <option value="all">Select Bus</option>
              {store.buses.map(b => <option key={b.id} value={b.id}>{b.id}</option>)}
            </select>
            <select
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="rounded border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary/50"
            >
              <option value="all">Select Street</option>
              {streetsInZone.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <CameraFeed busId={displayBus} />
          <div className="space-y-4">
            <AIPerceptionPanel />
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <LiveMap height={420} events={filteredEvents} title="Detection Geography" subtitle="Events mapped to zones in real time." />
          <DetectionFeed height={420} events={filteredEvents} />
        </div>
      </div>
    </div>
  );
}
