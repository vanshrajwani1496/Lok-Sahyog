import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DataPipeline } from "@/components/DataPipeline";
import { Network, Cpu, Database, Cloud } from "lucide-react";

export const Route = createFileRoute("/architecture")({
    head: () => ({
        meta: [{ title: "System Architecture — Lok-Sahyog" }],
    }),
    component: ArchitecturePage,
});

function ArchitecturePage() {
    return (
        <div className="pb-10">
            <PageHeader
                title="System Architecture"
                subtitle="Edge-to-cloud mapping of inference pipelines."
            />

            {/* Existing visual component in the repository */}
            <DataPipeline />

            <div className="grid gap-4 md:grid-cols-4 mt-6">
                <div className="panel p-5 flex flex-col items-center justify-center text-center transition-colors hover:border-primary/50 cursor-default">
                    <Cpu className="size-8 text-primary mb-3" />
                    <div className="text-sm font-semibold uppercase tracking-wide">Edge YOLO Node</div>
                    <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">Local device executing embedded Python logic. Processes live RTMP streams through optimized checkpoints.</div>
                </div>
                <div className="panel p-5 flex flex-col items-center justify-center text-center transition-colors hover:border-info/50 cursor-default">
                    <Network className="size-8 text-info mb-3" />
                    <div className="text-sm font-semibold uppercase tracking-wide">API Gateway</div>
                    <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">Ingests massive asynchronous telemetry POST streams. Cleans, sanitizes, and buffers rapid incident blasts.</div>
                </div>
                <div className="panel p-5 flex flex-col items-center justify-center text-center transition-colors hover:border-warning/50 cursor-default">
                    <Database className="size-8 text-warning mb-3" />
                    <div className="text-sm font-semibold uppercase tracking-wide">H3 Spatial Indexing</div>
                    <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">Converts disorganized GPS lat/longs into structural grid cells for massive frontend performance boosts.</div>
                </div>
                <div className="panel p-5 flex flex-col items-center justify-center text-center transition-colors hover:border-success/50 cursor-default">
                    <Cloud className="size-8 text-success mb-3" />
                    <div className="text-sm font-semibold uppercase tracking-wide">React Dashboard</div>
                    <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">Highly responsive UI consuming clean data to render live hex layers and actionable KPI metrics in 60fps.</div>
                </div>
            </div>
        </div>
    );
}
