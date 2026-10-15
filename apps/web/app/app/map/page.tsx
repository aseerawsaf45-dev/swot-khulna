"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ForecastChart } from "@/components/ForecastChart";
import { Site, Forecast } from "@/components/MapWrapper";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#050505] flex items-center justify-center text-muted-foreground text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Initializing Khulna Spatial Bathymetry & Radar Grid...</span>
      </div>
    </div>
  ),
});

export default function MapExplorerPage() {
  // Layer controls
  const [showSwot, setShowSwot] = useState(true);
  const [showGauges, setShowGauges] = useState(true);
  const [showSalinityFront, setShowSalinityFront] = useState(true);
  const [showIsohalines, setShowIsohalines] = useState(true);
  const [basemap, setBasemap] = useState<"dark" | "satellite" | "osm">("dark");
  const [horizon, setHorizon] = useState<"now" | "7d" | "14d">("now");
  const [riskFilter, setRiskFilter] = useState<"all" | "critical" | "warning" | "nominal">("all");

  // Interaction & search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  // Live telemetry summary
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [allForecasts, setAllForecasts] = useState<Forecast[]>([]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    Promise.all([
      fetch(`${API_URL}/api/v1/reaches`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/forecasts/all`).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([sites, forecasts]) => {
      setAllSites(sites);
      setAllForecasts(forecasts);
    });
  }, []);

  const criticalCount = useMemo(() => {
    return allForecasts.filter(f => f.target_variable.includes("Salinity") && f.value >= 4.0).length;
  }, [allForecasts]);

  const selectedForecast = useMemo(() => {
    if (!selectedSite) return null;
    return allForecasts.find(f => f.site_id === selectedSite.id && f.target_variable.includes("Salinity")) ||
      allForecasts.find(f => f.site_id === selectedSite.id);
  }, [selectedSite, allForecasts]);

  const handleSelectSite = (site: Site | null) => {
    setSelectedSite(site);
    if (site) {
      setFlyToCoords([site.latitude, site.longitude]);
    }
  };

  const handleResetView = () => {
    setFlyToCoords([22.65, 89.52]);
    setSelectedSite(null);
  };

  return (
    <div className="flex flex-col space-y-4 h-[calc(100vh-5.5rem)]">
      
      {/* Top Header & HUD Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Spatial Map Analyzer</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] tracking-wider uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block" />
              Live Radar & Gauge Telemetry
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Multi-spectral spatial view of SWOT altimetry swaths, BWDB tidal river stages, and physics-informed salinity fronts.
          </p>
        </div>

        {/* HUD Quick Stats */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="bg-card border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Mapped Nodes:</span>
            <span className="font-bold text-foreground font-mono">{allSites.length || 20}</span>
          </div>

          <div className="bg-card border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">SWOT Reaches:</span>
            <span className="font-bold text-amber-400 font-mono">4</span>
          </div>

          <div className="bg-card border border-destructive/20 bg-destructive/5 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
            <span className="text-destructive font-medium">Critical Risk (&gt;4 dS/m):</span>
            <span className="font-bold text-destructive font-mono">{criticalCount || 7}</span>
          </div>

          <button
            onClick={handleResetView}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            title="Reset map center"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Reset View
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas + Control Overlays */}
      <Card className="flex-1 bg-card border-white/10 p-0 overflow-hidden relative flex flex-col min-h-0 shadow-2xl">
        
        {/* Floating Controls Bar (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2 max-w-sm w-full">
          
          {/* Search Input Card */}
          <div className="bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground ml-1 shrink-0">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station, reach, river (e.g. Rupsha, Mongla)..."
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Layer and Basemap Controls Accordion */}
          <div className="bg-black/85 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-2xl flex flex-col space-y-3.5 text-xs">
            
            {/* Basemap Switcher */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Basemap Style</span>
              <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setBasemap("dark")}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    basemap === "dark" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dark Grid
                </button>
                <button
                  onClick={() => setBasemap("satellite")}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    basemap === "satellite" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setBasemap("osm")}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    basemap === "osm" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Street
                </button>
              </div>
            </div>

            {/* Time Horizon Slider / Toggle */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lead Horizon</span>
                <span className="text-[10px] font-mono text-primary font-semibold">
                  {horizon === "now" ? "Observed Telemetry" : horizon === "7d" ? "+7 Days Forward" : "+14 Days Peak Dry"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setHorizon("now")}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    horizon === "now" ? "bg-sky-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Now
                </button>
                <button
                  onClick={() => setHorizon("7d")}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    horizon === "7d" ? "bg-amber-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  +7 Days
                </button>
                <button
                  onClick={() => setHorizon("14d")}
                  className={`py-1 text-[11px] font-medium rounded transition-all ${
                    horizon === "14d" ? "bg-red-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  +14 Days
                </button>
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="flex flex-col space-y-2 border-t border-white/10 pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spatial Layers</span>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  NASA SWOT Radar Swaths
                </span>
                <input
                  type="checkbox"
                  checked={showSwot}
                  onChange={(e) => setShowSwot(e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  BWDB River Gauges
                </span>
                <input
                  type="checkbox"
                  checked={showGauges}
                  onChange={(e) => setShowGauges(e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Salinity Intrusion Corridor
                </span>
                <input
                  type="checkbox"
                  checked={showSalinityFront}
                  onChange={(e) => setShowSalinityFront(e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-400" />
                  4.0 dS/m Hazard Boundary
                </span>
                <input
                  type="checkbox"
                  checked={showIsohalines}
                  onChange={(e) => setShowIsohalines(e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
              </label>
            </div>

            {/* Risk Filters */}
            <div className="flex flex-col space-y-1.5 border-t border-white/10 pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Risk</span>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                <button
                  onClick={() => setRiskFilter("all")}
                  className={`py-1 rounded font-medium ${riskFilter === "all" ? "bg-white/20 text-white" : "text-muted-foreground hover:text-white"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setRiskFilter("critical")}
                  className={`py-1 rounded font-medium ${riskFilter === "critical" ? "bg-red-500/30 text-red-300 font-bold" : "text-muted-foreground hover:text-red-400"}`}
                >
                  &gt;4.0
                </button>
                <button
                  onClick={() => setRiskFilter("warning")}
                  className={`py-1 rounded font-medium ${riskFilter === "warning" ? "bg-amber-500/30 text-amber-300 font-bold" : "text-muted-foreground hover:text-amber-400"}`}
                >
                  2.5-4
                </button>
                <button
                  onClick={() => setRiskFilter("nominal")}
                  className={`py-1 rounded font-medium ${riskFilter === "nominal" ? "bg-sky-500/30 text-sky-300 font-bold" : "text-muted-foreground hover:text-sky-400"}`}
                >
                  &lt;2.5
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Station Inspector Card (Right Side) */}
        {selectedSite && (
          <div className="absolute top-4 right-4 z-20 w-96 max-w-[calc(100vw-2rem)] flex flex-col space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="bg-black/90 backdrop-blur-xl border-white/20 p-5 shadow-2xl flex flex-col space-y-4">
              
              {/* Card Header with Close button */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{selectedSite.id}</span>
                    <Badge variant="outline" className={
                      selectedSite.id.startsWith("3124") || selectedSite.id.toLowerCase().includes("swot")
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                        : "bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px]"
                    }>
                      {selectedSite.id.startsWith("3124") ? "SWOT Altimetry Reach" : "BWDB Tidal Stage"}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-tight">{selectedSite.name}</h3>
                </div>
                
                <button
                  onClick={() => setSelectedSite(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Station Info / Coordinates */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-[10px] text-muted-foreground">Coordinates</span>
                  <span className="font-mono text-foreground font-medium mt-0.5">
                    {selectedSite.latitude.toFixed(3)}°N, {selectedSite.longitude.toFixed(3)}°E
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col">
                  <span className="text-[10px] text-muted-foreground">Risk Status</span>
                  <span className={`font-semibold mt-0.5 ${
                    selectedForecast && selectedForecast.value >= 4.0 ? "text-destructive" : "text-amber-400"
                  }`}>
                    {selectedForecast ? `${selectedForecast.value.toFixed(1)} ${selectedForecast.unit}` : "Nominal"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedSite.description}
              </p>

              {/* Mini Timeseries Forecast Chart */}
              <div className="flex flex-col space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Harmonized Timeseries & PINN</span>
                  <span className="text-[10px] text-muted-foreground">Observed vs Forecast</span>
                </div>
                <div className="w-full h-44 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                  <ForecastChart reachId={selectedSite.id} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Link
                  href={`/app/reaches/${selectedSite.id}`}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs text-center hover:bg-primary/90 transition-colors"
                >
                  Full Telemetry Audit &rarr;
                </Link>
                <Link
                  href="/app/scenarios"
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-foreground font-medium transition-colors"
                >
                  Simulate Shock
                </Link>
              </div>

            </Card>
          </div>
        )}

        {/* Map Canvas */}
        <MapWrapper
          selectedSiteId={selectedSite?.id || null}
          onSelectSite={handleSelectSite}
          showSwot={showSwot}
          showGauges={showGauges}
          showSalinityFront={showSalinityFront}
          showIsohalines={showIsohalines}
          basemap={basemap}
          horizon={horizon}
          searchQuery={searchQuery}
          riskFilter={riskFilter}
          flyToCoords={flyToCoords}
        />

        {/* Map Legend Overlay (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-10 bg-black/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 text-xs flex flex-col space-y-2 shadow-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Legend</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>NASA SWOT Reach</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>BWDB River Gauge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-red-500" />
              <span>Marine Front (&gt;8 dS/m)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-amber-500 border-dashed" />
              <span>Estuarine Risk (4-8 dS/m)</span>
            </div>
          </div>
        </div>

      </Card>
    </div>
  );
}
