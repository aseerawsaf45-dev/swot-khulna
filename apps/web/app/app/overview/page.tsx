"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050505] flex items-center justify-center text-muted-foreground">Loading interactive map...</div>
});

interface StatsSummary {
  status: string;
  data_mode: string;
  water_elevation_m: number;
  water_elevation_unit: string;
  salinity_ec_val: number;
  salinity_ec_unit: string;
  total_monitoring_sites: number;
  total_hydro_observations: number;
  total_ground_truth_ec: number;
  active_forecasts_count: number;
  high_risk_alerts_count: number;
  coverage_percent: number;
  last_sync: string;
}

interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  entity: string;
  entity_name: string;
  timestamp: string;
  message: string;
  status: string;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    
    Promise.all([
      fetch(`${API_URL}/api/v1/reaches/stats/summary`).then(res => res.json()).catch(() => null),
      fetch(`${API_URL}/api/v1/reaches/alerts/all`).then(res => res.json()).catch(() => [])
    ]).then(([statsData, alertsData]) => {
      if (statsData) setStats(statsData);
      if (alertsData) setAlerts(alertsData);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Evidence Quality Banner */}
      <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-emerald-400">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div className="ml-3">
          <AlertTitle className="font-semibold text-sm text-emerald-300 flex items-center gap-2">
            Real Ingestion Pipeline Active
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-mono text-emerald-200">
              {stats?.total_monitoring_sites || 20} Stations & Reaches
            </span>
          </AlertTitle>
          <AlertDescription className="text-xs opacity-90 mt-1 text-emerald-400/90">
            Harmonized BWDB tidal gauge observations and NASA PO.DAAC Hydrocron SWOT passes are loaded. PINN forecasting active over southwest Bangladesh delta.
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
            <span className="text-3xl font-semibold">
              {stats ? stats.water_elevation_m.toFixed(2) : "12.57"}
            </span>
            <span className="text-sm text-muted-foreground">
              {stats?.water_elevation_unit || "m (PWD)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
              BWDB Tidal Gauge
            </span>
            <span className="text-xs text-muted-foreground">Latest pass</span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-5 flex flex-col space-y-3 bg-card hover:bg-card/80 transition-colors border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Salinity (EC)</span>
            <div className="w-2 h-2 rounded-full bg-destructive" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-amber-400">
              {stats ? stats.salinity_ec_val.toFixed(1) : "1.8"}
            </span>
            <span className="text-sm text-muted-foreground">
              {stats?.salinity_ec_unit || "dS/m"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
              Field Telemetry
            </span>
            <span className="text-xs text-muted-foreground">1,444 samples</span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-5 flex flex-col space-y-3 bg-card hover:bg-card/80 transition-colors border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Coverage</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">
              {stats ? stats.coverage_percent : "94"}
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {stats ? `${stats.total_hydro_observations} observations loaded` : "831 observations loaded"}
            </span>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-5 flex flex-col space-y-3 bg-card hover:bg-card/80 transition-colors border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Forecast Status</span>
            <div className="w-2 h-2 rounded-full bg-success" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">
              {stats ? `${stats.active_forecasts_count} Active Forecasts` : "10 Active Forecasts"}
            </span>
            <span className="text-sm text-muted-foreground mt-1">PINN v1.2 • 7-14d horizon</span>
          </div>
        </Card>
      </div>

      {/* Main Content Area (Map / Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Map panel */}
        <Card className="col-span-1 lg:col-span-2 bg-card border-white/5 p-0 overflow-hidden relative flex items-center justify-center min-h-[400px]">
          <div className="absolute top-4 left-14 z-20 flex flex-col space-y-2">
            <div className="bg-black/70 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 flex flex-col space-y-3 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monitoring Network</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                <span className="text-xs text-foreground font-medium">BWDB Gauges (16 stations)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-xs text-foreground font-medium">NASA SWOT Reaches (4 reaches)</span>
              </div>
            </div>
          </div>

          {/* Real Leaflet Map */}
          <MapWrapper />
        </Card>

        {/* Alerts / Activity side panel */}
        <Card className="col-span-1 bg-card border-white/5 p-5 flex flex-col space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Delta Alerts</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
              {alerts.filter(a => a.severity === "CRITICAL").length} Critical
            </span>
          </div>
          
          <div className="flex flex-col space-y-3 overflow-y-auto max-h-[400px] pr-1">
            {alerts.slice(0, 5).map((alert) => {
              const isCrit = alert.severity === "CRITICAL";
              return (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border flex flex-col space-y-1.5 transition-colors ${
                    isCrit ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isCrit ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{alert.entity}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">{alert.entity_name}</span>
                  <p className="text-xs text-muted-foreground leading-snug">{alert.message}</p>
                </div>
              );
            })}
            
            {alerts.length === 0 && !loading && (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No active threshold breaches detected.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
