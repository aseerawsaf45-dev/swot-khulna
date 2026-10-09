"use client";

import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050505] flex items-center justify-center text-muted-foreground">Loading interactive map...</div>
});

export default function OverviewPage() {
  return (
    <div className="flex flex-col space-y-6">
      
      {/* Evidence Quality Banner */}
      <Alert className="bg-warning/10 border-warning/30 text-warning">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div className="ml-3">
          <AlertTitle className="font-semibold text-sm">Delayed NASA SWOT Observations</AlertTitle>
          <AlertDescription className="text-xs opacity-80 mt-1">
            NASA SWOT KaRIn pass has not provided new observations in this region for 14 days. Interpolated values rely heavily on local river gauges and field telemetry.
          </AlertDescription>
        </div>
      </Alert>

      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Regional Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor high-level telemetry and prediction confidence across the delta.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <Card className="p-5 flex flex-col space-y-3 bg-card hover:bg-card/80 transition-colors border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Water Elevation</span>
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">2.4</span>
            <span className="text-sm text-muted-foreground">m (PWD)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">Local Gauge</span>
            <span className="text-xs text-muted-foreground">12 hrs ago</span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-5 flex flex-col space-y-3 bg-card hover:bg-card/80 transition-colors border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Salinity (EC)</span>
            <div className="w-2 h-2 rounded-full bg-destructive" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-destructive">4.2</span>
            <span className="text-sm text-muted-foreground">dS/m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-foreground bg-secondary/20 px-2 py-0.5 rounded-full font-medium">Field Sample</span>
            <span className="text-xs text-muted-foreground">4 hrs ago</span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-5 flex flex-col space-y-3 bg-card hover:bg-card/80 transition-colors border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Coverage</span>
            <div className="w-2 h-2 rounded-full bg-warning" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">68</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Missing 4 gauge inputs</span>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-5 flex flex-col space-y-3 bg-card hover:bg-card/80 transition-colors border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Forecast Status</span>
            <div className="w-2 h-2 rounded-full bg-success" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">PINN v1.2 Active</span>
            <span className="text-sm text-muted-foreground mt-1">+14 days horizon</span>
          </div>
        </Card>
      </div>

      {/* Main Content Area (Map / Charts Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Map panel */}
        <Card className="col-span-1 lg:col-span-2 bg-card border-white/5 p-0 overflow-hidden relative flex items-center justify-center min-h-[400px]">
          <div className="absolute top-4 left-14 z-20 flex flex-col space-y-2">
            <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 flex flex-col space-y-3 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Map Layers</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                <span className="text-xs text-foreground">Local Gauges (Live)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning opacity-50" />
                <span className="text-xs text-foreground">SWOT Nodes (Stale)</span>
              </div>
            </div>
          </div>

          {/* Real Leaflet Map */}
          <MapWrapper />
        </Card>

        {/* Alerts / Activity side panel */}
        <Card className="col-span-1 bg-card border-white/5 p-5 flex flex-col space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Alerts</h3>
          
          <div className="flex flex-col space-y-3">
            <div className="p-3 rounded-lg border border-border bg-white/5 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-destructive">HIGH SALINITY RISK</span>
                <span className="text-[10px] text-muted-foreground">2 hrs ago</span>
              </div>
              <span className="text-sm">Reach P-14 forecasted to cross 4.0 dS/m threshold in 48 hours.</span>
            </div>
            
            <div className="p-3 rounded-lg border border-border bg-white/5 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-warning">GAUGE OFFLINE</span>
                <span className="text-[10px] text-muted-foreground">6 hrs ago</span>
              </div>
              <span className="text-sm">Mongla port telemetry interrupted.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
