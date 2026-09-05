import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CameraFeed } from "@/components/CameraFeed";
import { AIPerceptionPanel } from "@/components/AIPerceptionPanel";
import { DataPipeline } from "@/components/DataPipeline";
import { DetectionFeed } from "@/components/DetectionFeed";
import { LiveMap } from "@/components/LiveMap";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Monitoring — Lok-Sahyog" },
      {
        name: "description",
        content:
          "Real-time AI perception from connected urban sensing units: live bus camera, YOLO pothole detection and GPS-tagged events.",
      },
      { property: "og:title", content: "Live Monitoring — Lok-Sahyog" },
      {
        property: "og:description",
        content: "Live bus camera, YOLO inference status and the phone-to-control-centre pipeline.",
      },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  return (
    <div>
      <PageHeader
        title="Live Monitoring"
        subtitle="Real-time AI perception from connected urban sensing units."
      />
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <CameraFeed />
          <div className="space-y-4">
            <AIPerceptionPanel />
          </div>
        </div>
        <DataPipeline />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <LiveMap height={420} title="Detection Geography" subtitle="Events mapped to H3 cells in real time." />
          <DetectionFeed height={420} />
        </div>
      </div>
    </div>
  );
}
