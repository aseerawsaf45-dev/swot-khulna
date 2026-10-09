"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050505] flex items-center justify-center text-muted-foreground">Loading interactive map...</div>
});

export default function MapExplorerPage() {
  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-2rem)]">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Map Explorer</h1>
        <p className="text-sm text-muted-foreground">Spatial view of all hydrological nodes, SWOT swaths, and predicted salt intrusion fronts.</p>
      </div>

      <Card className="flex-1 bg-card border-white/5 p-0 overflow-hidden relative flex flex-col min-h-0">
        <div className="absolute top-4 left-14 z-20 flex flex-col space-y-2">
          <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 flex flex-col space-y-3 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Controls</span>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" id="layer-swot" defaultChecked className="accent-primary" />
              <label htmlFor="layer-swot" className="text-sm">SWOT Pass Swaths</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="layer-gauges" defaultChecked className="accent-primary" />
              <label htmlFor="layer-gauges" className="text-sm">Local Gauges</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="layer-forecast" defaultChecked className="accent-primary" />
              <label htmlFor="layer-forecast" className="text-sm">Salinity Front Forecast</label>
            </div>
          </div>
        </div>

        {/* Real Leaflet Map */}
        <MapWrapper />

      </Card>
    </div>
  );
}
