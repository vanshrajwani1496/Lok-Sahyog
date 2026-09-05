import { useStore } from "@/lib/store";
import { shortH3 } from "@/lib/h3Utils";
import { MapPin, AlertOctagon } from "lucide-react";

export function ActionNeededTable() {
    const store = useStore();
    // Find zones with massive incident clusters
    const criticalZones = store.zones.filter((z) => z.incidents >= 20);

    if (criticalZones.length === 0) return null;

    return (
        <div className="panel border-critical/50 bg-critical/5 p-4 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500">
            <div className="mb-3 flex items-center gap-2 text-critical">
                <AlertOctagon className="size-5 animate-pulse" />
                <h3 className="font-bold tracking-tight uppercase">Urgent Action Needed</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
                The following zones have exceeded standard safety thresholds (&gt;20 detections). Maintenance dispatch mandatory.
            </p>
            <div className="overflow-hidden rounded-md border border-critical/30">
                <table className="w-full text-[11px] text-left">
                    <thead className="bg-critical/10 text-critical font-medium">
                        <tr>
                            <th className="px-3 py-2">H3 Zone</th>
                            <th className="px-3 py-2">Hazards</th>
                            <th className="px-3 py-2">Risk Level</th>
                            <th className="px-3 py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-critical/20">
                        {criticalZones.map((z) => (
                            <tr key={z.h3Index} className="bg-background/40 hover:bg-critical/10">
                                <td className="px-3 py-2 font-mono text-primary">{shortH3(z.h3Index)}</td>
                                <td className="px-3 py-2 font-mono text-critical font-bold">{z.incidents} DETECTIONS</td>
                                <td className="px-3 py-2 uppercase">{z.risk}</td>
                                <td className="px-3 py-2">
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${z.center.lat},${z.center.lng}`, "_blank")}
                                        className="flex items-center gap-1 rounded bg-critical text-critical-foreground px-2 py-1 hover:bg-critical/80 transition-colors"
                                    >
                                        <MapPin className="size-3" /> DISPATCH
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
