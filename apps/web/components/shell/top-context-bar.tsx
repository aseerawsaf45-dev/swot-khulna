"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function TopContextBar() {
  const [stats, setStats] = useState<{ status: string; total_monitoring_sites: number; total_hydro_observations: number } | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/v1/reaches/stats/summary`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border z-10 shrink-0">
      {/* Context info */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Region</span>
          <span className="text-sm font-medium text-foreground">Southwest Bangladesh (Khulna)</span>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {stats ? "Real & Harmonized Data" : "Live Ingestion Stream"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {stats ? `${stats.total_monitoring_sites} Active Sites • ${stats.total_hydro_observations} Telemetry Passes` : "SWOT & BWDB Network"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          {/* Search Placeholder */}
          <div className="w-64 h-9 rounded-full bg-card border border-border flex items-center px-4 transition-colors group-hover:border-primary/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-xs text-muted-foreground ml-3">Search reaches...</span>
          </div>
        </div>

        <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-white/5 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="text-xs font-semibold text-primary">SC</span>
        </div>
      </div>
    </header>
  );
}
