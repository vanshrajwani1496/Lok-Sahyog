import { useStore } from "@/lib/store";
import { MapPin, AlertOctagon } from "lucide-react";
import { getAreaName, getStreetName } from "@/lib/utils";
import { TYPE_LABEL } from "@/lib/mockData";

export function ActionNeededTable({ events }: { events: import("@/lib/types").DetectionEvent[] }) {
    const store = useStore();

    const escalatedEvents = events.filter(e => {
        if (e.status === "resolved") return false;
        const eventTime = new Date(e.timestamp).getTime();
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        // Unacknowledged for 1 week OR Unresolved for 1 month
        const breachedAck = (e.status === "open" && (now - eventTime) > oneWeek);
        const breachedRes = (e.status === "acknowledged" && (now - eventTime) > oneMonth);

        return breachedAck || breachedRes || e.escalated;
    });

    if (escalatedEvents.length === 0) return null;

    return (
        <div className="panel border-critical/50 bg-critical/5 p-4 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500">
            <div className="mb-3 flex items-center gap-2 text-critical">
                <AlertOctagon className="size-5 animate-pulse" />
                <h3 className="font-bold tracking-tight uppercase">Urgent Action Needed (SLA Breached)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
                The following hazards have exceeded maximum statutory SLA deadlines (7 Days Unacknowledged / 30 Days Unresolved).
            </p>
            <div className="overflow-hidden rounded-md border border-critical/30">
                <table className="w-full text-xs text-left">
                    <thead className="bg-critical/10 text-critical font-medium">
                        <tr>
                            <th className="px-3 py-2 font-medium">Location</th>
                            <th className="px-3 py-2 font-medium">Zone</th>
                            <th className="px-3 py-2 font-medium">Hazard Type</th>
                            <th className="px-3 py-2 font-medium">Logged Date</th>
                            <th className="px-3 py-2 font-medium">Reason</th>
                            <th className="px-3 py-2 font-medium">Map</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-critical/20">
                        {escalatedEvents.map((e) => {
                            const eventTime = new Date(e.timestamp).getTime();
                            const now = Date.now();
                            const oneMonth = 30 * 24 * 60 * 60 * 1000;
                            const reason = (now - eventTime) > oneMonth ? ">30 Day Delay" : ">7 Day Delay";

                            return (
                                <tr key={e.id} className="bg-background/40 hover:bg-critical/10">
                                    <td className="px-3 py-2 font-medium">{getStreetName(e.h3Index)}</td>
                                    <td className="px-3 py-2">{getAreaName(e.h3Index)}</td>
                                    <td className="px-3 py-2">{TYPE_LABEL[e.type]}</td>
                                    <td className="px-3 py-2 font-mono">{new Date(e.timestamp).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 uppercase font-bold text-critical">{reason}</td>
                                    <td className="px-3 py-2 text-right">
                                        <a
                                            href={`https://www.google.com/maps?q=${e.latitude},${e.longitude}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2 py-1 text-[10px] font-bold tracking-wide uppercase bg-critical/20 hover:bg-critical/30 text-critical border border-critical/30 rounded inline-flex items-center gap-1 transition-colors"
                                        >
                                            <MapPin className="size-3" /> Pin
                                        </a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
