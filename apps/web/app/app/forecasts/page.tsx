"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Forecast {
  id: string;
  site_id: string;
  target_time: string;
  target_variable: string;
  value: number;
  unit: string;
  validation_status: string;
}

interface Site {
  id: string;
  name: string;
  description: string;
}

export default function ForecastsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [allForecasts, setAllForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    
    Promise.all([
      fetch(`${API_URL}/api/v1/reaches`).then(res => res.ok ? res.json() : []).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/forecasts/all`).then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(async ([loadedSites, loadedForecasts]) => {
      setSites(loadedSites);
      
      let forecasts = loadedForecasts;
      if (forecasts.length === 0 && loadedSites.length > 0) {
        const manualForecasts: Forecast[] = [];
        for (const site of loadedSites) {
          try {
            const fRes = await fetch(`${API_URL}/api/v1/reaches/${site.id}/forecasts`);
            if (fRes.ok) {
              const f = await fRes.json();
              manualForecasts.push(...f);
            }
          } catch {
            // continue
          }
        }
        forecasts = manualForecasts;
      }
      setAllForecasts(forecasts);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Active Forecasts</h1>
        <p className="text-sm text-muted-foreground">Browse all spatial reaches currently being modeled by the PINN v1.2 engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {allForecasts.map((forecast) => {
          const site = sites.find(s => s.id === forecast.site_id);
          const isStale = forecast.validation_status !== "VALIDATED";
          // eslint-disable-next-line react-hooks/purity
          const horizonDays = Math.round((new Date(forecast.target_time).getTime() - Date.now()) / (1000 * 3600 * 24));
          
          return (
            <Link key={forecast.id} href={`/app/reaches/${forecast.site_id}`} className="block group">
              <Card className="bg-card border-white/5 p-5 flex flex-col space-y-4 hover:border-primary/50 transition-colors cursor-pointer h-full">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{site?.name || forecast.site_id}</h3>
                    <span className="text-xs text-muted-foreground font-mono mt-1">{forecast.site_id}</span>
                  </div>
                  <Badge variant="outline" className={isStale ? "bg-warning/10 text-warning border-warning/20" : "bg-primary/10 text-primary border-primary/20"}>
                    {isStale ? "STALE INPUTS" : "ACTIVE"}
                  </Badge>
                </div>
                
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Horizon</span>
                    <span className="font-medium">+{horizonDays > 0 ? horizonDays : 0} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Target Variable</span>
                    <span className="font-medium">{forecast.target_variable}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Current Risk</span>
                    <span className={forecast.value > 4 ? "font-medium text-destructive" : "font-medium text-success"}>
                      {forecast.value > 4 ? "High" : "Low"} ({forecast.value.toFixed(1)} {forecast.unit})
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
        
        {allForecasts.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground p-8">
            No active forecasts found. Is the backend running?
          </div>
        )}

      </div>
    </div>
  );
}
