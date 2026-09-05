import { useEffect, useState } from "react";
import { api, PotholeIncident } from "../lib/api";

export function useLivePotholes() {
  const [potholes, setPotholes] = useState<PotholeIncident[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.potholes();
      if (data) setPotholes(data);
    };

    loadData();
    const interval = setInterval(loadData, 3000); // Refreshes every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return potholes;
}