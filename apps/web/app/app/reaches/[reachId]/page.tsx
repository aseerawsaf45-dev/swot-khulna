"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForecastChart } from "@/components/ForecastChart";

interface ReachInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

interface Observation {
  id: string;
  site_id: string;
  timestamp: string;
  source_variable: string;
  value: number;
  original_unit: string;
  quality_flag?: string;
}

function ReachDetailContent() {
  const routeParams = useParams();
  const reachId = typeof routeParams?.reachId === "string" ? routeParams.reachId : "";
  const [reach, setReach] = useState<ReachInfo | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reachId) return;
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    Promise.all([
      fetch(`${API_URL}/api/v1/reaches/${reachId}`).then(res => res.ok ? res.json() : null).catch(() => null),
      fetch(`${API_URL}/api/v1/reaches/${reachId}/observations`).then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(([loadedReach, loadedObs]) => {
      setReach(loadedReach);
      setObservations(loadedObs);
      setLoading(false);
    });
  }, [reachId]);

  const isSwot = reachId.startsWith("3124") || reachId.toLowerCase().includes("swot");

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {reach?.name || reachId}
            </h1>
            <Badge variant="outline" className={isSwot ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-primary/10 text-primary border-primary/20"}>
              {isSwot ? "NASA SWOT SATELLITE REACH" : "BWDB GROUND GAUGE"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-mono text-xs">ID: {reachId}</span>
            <span>&bull;</span>
            <span>{reach ? `Coordinates: ${reach.latitude.toFixed(3)}°N, ${reach.longitude.toFixed(3)}°E` : "Khulna Delta"}</span>
            <span>&bull;</span>
            <span className="text-xs">{reach?.description || "Active Hydrological Monitoring Station"}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
             Export Data
           </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        <button className="px-1 py-3 text-sm font-medium text-primary border-b-2 border-primary">Overview & Timeseries</button>
        <button className="px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Telemetry Audit</button>
        <button className="px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Source Provenance</button>
        <button className="px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">PINN Model Residuals</button>
      </div>

      {/* Main Chart Area */}
      <Card className="p-6 bg-card border-white/5 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Salinity & Elevation Timeseries (Harmonized + PINN Forecast)</h3>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
              <span className="text-muted-foreground">Observed Telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[#f59e0b] border-dashed rounded-full" />
              <span className="text-muted-foreground">PINN Forecast</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[320px] flex items-center justify-center border border-border/50 rounded-lg bg-black/20">
          <ForecastChart reachId={reachId} />
        </div>
      </Card>
      
      {/* Observation Table */}
      <Card className="bg-card border-white/5 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Ingested Observations & Ground Truth</h3>
            <span className="text-xs text-muted-foreground">Showing {observations.slice(0, 15).length} latest records for this reach</span>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-white/5 font-mono text-muted-foreground">
            Total Telemetry Passes: {observations.length}
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp (UTC)</th>
                <th className="px-4 py-3 font-medium">Variable</th>
                <th className="px-4 py-3 font-medium">Observed Value</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Source Dataset</th>
                <th className="px-4 py-3 font-medium">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {observations.slice(0, 15).map((obs) => {
                const isSalinity = obs.source_variable.toLowerCase().includes("ec") || obs.source_variable.toLowerCase().includes("salinity");
                const isElevation = obs.source_variable.toLowerCase().includes("level") || obs.source_variable.toLowerCase().includes("wse");

                return (
                  <tr key={obs.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(obs.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans font-medium text-foreground">
                      {obs.source_variable}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${
                      isSalinity && obs.value >= 4.0 ? "text-destructive" : isElevation ? "text-primary" : "text-foreground"
                    }`}>
                      {obs.value.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{obs.original_unit}</td>
                    <td className="px-4 py-3 font-sans">
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {isSwot ? "PO.DAAC Hydrocron" : "BWDB Tidal Stage"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-sans text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px]">Validated</span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {observations.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground font-sans">
                    No individual observations found for this site ID. (Ensure backend server is running on port 8000).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}

export default function ReachDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground text-sm">Loading reach telemetry & satellite passes...</div>}>
      <ReachDetailContent />
    </Suspense>
  );
}
