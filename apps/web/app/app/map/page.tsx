"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ForecastChart } from "@/components/ForecastChart";
import { Site, Forecast } from "@/components/MapWrapper";
import {
  Layers,
  MapPin,
  Search,
  Filter,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  CheckCircle2,
} from "lucide-react";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#05070d] flex items-center justify-center text-muted-foreground text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-muted-foreground">Initializing Delta Spatial Bathymetry...</span>
      </div>
    </div>
  ),
});

// Quick Regional Hotspot Jump Coordinates
const HOTSPOTS = [
  { name: "Khulna Core", coords: [22.808, 89.580] as [number, number], desc: "Urban Water Intake & SW241" },
  { name: "Mongla Port", coords: [22.464, 89.600] as [number, number], desc: "High Salinity Front & SW244" },
  { name: "Shibsa Estuary", coords: [22.550, 89.520] as [number, number], desc: "Western Mangrove Tidal Belt" },
  { name: "Gorai Inflow", coords: [23.540, 89.516] as [number, number], desc: "Freshwater Boundary Reach" },
];

export default function MapExplorerPage() {
  // Layer & Display States
  const [showSwot, setShowSwot] = useState(true);
  const [showGauges, setShowGauges] = useState(true);
  const [showSalinityFront, setShowSalinityFront] = useState(true);
  const [showIsohalines, setShowIsohalines] = useState(true);
  const [basemap, setBasemap] = useState<"dark" | "satellite" | "osm">("dark");
  const [horizon, setHorizon] = useState<"now" | "7d" | "14d">("now");
  const [riskFilter, setRiskFilter] = useState<"all" | "critical" | "warning" | "nominal">("all");
  const [currentMode, setCurrentMode] = useState<"all" | "salinity" | "gauges" | "swot">("all");

  // Workbench & Drawer states
  const [activePanel, setActivePanel] = useState<"directory" | "layers" | "guide" | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  // Data
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

  const forecastMap = useMemo(() => {
    const map: Record<string, Forecast> = {};
    for (const f of allForecasts) {
      if (!map[f.site_id] || f.target_variable.includes("Salinity")) {
        map[f.site_id] = f;
      }
    }
    return map;
  }, [allForecasts]);

  const criticalCount = useMemo(() => {
    return allForecasts.filter(f => f.target_variable.includes("Salinity") && f.value >= 4.0).length;
  }, [allForecasts]);

  const warningCount = useMemo(() => {
    return allForecasts.filter(f => f.target_variable.includes("Salinity") && f.value >= 2.5 && f.value < 4.0).length;
  }, [allForecasts]);

  const selectedForecast = useMemo(() => {
    if (!selectedSite) return null;
    return forecastMap[selectedSite.id] || null;
  }, [selectedSite, forecastMap]);

  // Filtered station directory
  const filteredDirectory = useMemo(() => {
    return allSites.filter(site => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!site.name.toLowerCase().includes(q) && !site.id.toLowerCase().includes(q) && !site.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      const forecast = forecastMap[site.id];
      const val = forecast?.value || 0;
      const isSalinity = forecast?.target_variable?.includes("Salinity");
      if (riskFilter === "critical" && (!isSalinity || val < 4.0)) return false;
      if (riskFilter === "warning" && (!isSalinity || val < 2.5 || val >= 4.0)) return false;
      if (riskFilter === "nominal" && isSalinity && val >= 2.5) return false;
      return true;
    });
  }, [allSites, searchQuery, riskFilter, forecastMap]);

  // Mode Preset Quick Switcher
  const handleModePreset = (mode: "all" | "salinity" | "gauges" | "swot") => {
    setCurrentMode(mode);
    if (mode === "all") {
      setShowSwot(true);
      setShowGauges(true);
      setShowSalinityFront(true);
      setShowIsohalines(true);
      setRiskFilter("all");
    } else if (mode === "salinity") {
      setShowSwot(true);
      setShowGauges(true);
      setShowSalinityFront(true);
      setShowIsohalines(true);
      setRiskFilter("critical");
    } else if (mode === "gauges") {
      setShowSwot(false);
      setShowGauges(true);
      setShowSalinityFront(false);
      setShowIsohalines(false);
      setRiskFilter("all");
    } else if (mode === "swot") {
      setShowSwot(true);
      setShowGauges(false);
      setShowSalinityFront(true);
      setShowIsohalines(false);
      setRiskFilter("all");
    }
  };

  const handleSelectSite = (site: Site | null) => {
    setSelectedSite(site);
    if (site) {
      setFlyToCoords([site.latitude, site.longitude]);
      // On narrow screen, close left panel to let user view station details clearly
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setActivePanel(null);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2 h-[calc(100dvh-4.25rem)] select-none">
      
      {/* 1. Top Intelligent Control Dock (Clean & Uncluttered) */}
      <div className="bg-[#08131f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 shadow-xl shrink-0">
        
        {/* Left: Mode Quick Selectors & Hotspot Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shrink-0">
            <button
              onClick={() => handleModePreset("all")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentMode === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => handleModePreset("salinity")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                currentMode === "salinity" ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Salinity Hazard
            </button>
            <button
              onClick={() => handleModePreset("gauges")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                currentMode === "gauges" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              River Gauges
            </button>
            <button
              onClick={() => handleModePreset("swot")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                currentMode === "swot" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SWOT Passes
            </button>
          </div>

          <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block shrink-0" />

          {/* Quick Jump Hotspot Pills */}
          <div className="flex items-center gap-1 shrink-0">
            {HOTSPOTS.map((hotspot) => (
              <button
                key={hotspot.name}
                onClick={() => setFlyToCoords(hotspot.coords)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 shrink-0"
                title={hotspot.desc}
              >
                <MapPin className="w-3 h-3 text-primary" />
                <span>{hotspot.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Workspace Toggle Buttons */}
        <div className="flex items-center gap-1.5 justify-end shrink-0">
          <button
            onClick={() => setActivePanel(activePanel === "directory" ? null : "directory")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              activePanel === "directory"
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-foreground"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stations</span>
            <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-mono">
              {allSites.length || 20}
            </span>
          </button>

          <button
            onClick={() => setActivePanel(activePanel === "layers" ? null : "layers")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              activePanel === "layers"
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers & Style</span>
          </button>

          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`p-1.5 rounded-xl text-xs border transition-colors ${
              showLegend ? "bg-white/20 text-white border-white/30" : "bg-white/5 text-muted-foreground hover:text-white border-white/10"
            }`}
            title="Toggle Map Legend"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 2. Main Map Canvas Container (Full Interactive Experience) */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative flex flex-col min-h-0 shadow-2xl bg-[#05070d]">
        
        {/* Leaflet Map Canvas */}
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

        {/* 3. Studio Workbench (Left Dock on Desktop / Bottom Sheet on Mobile) */}
        {activePanel && (
          <div className="absolute inset-x-2 bottom-2 md:bottom-3 md:top-3 md:left-3 md:right-auto z-30 max-h-[75vh] md:max-h-none md:h-auto md:w-96 flex flex-col animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-left-4 duration-300">
            <div className="h-full bg-[#08131f]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl flex flex-col overflow-hidden rounded-2xl">
              
              {/* Drawer Tab Headers */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setActivePanel("directory")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activePanel === "directory" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Directory ({filteredDirectory.length})
                  </button>
                  <button
                    onClick={() => setActivePanel("layers")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activePanel === "layers" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Layers
                  </button>
                  <button
                    onClick={() => setActivePanel("guide")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activePanel === "guide" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Guide
                  </button>
                </div>

                <button
                  onClick={() => setActivePanel(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* PANEL 1: STATIONS DIRECTORY */}
              {activePanel === "directory" && (
                <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reach, river or station..."
                      className="w-full h-8 pl-8 pr-7 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                    />
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Risk Filter Chips */}
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <button
                      onClick={() => setRiskFilter("all")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "all" ? "bg-white/20 text-white font-bold" : "bg-white/5 text-muted-foreground hover:text-white"
                      }`}
                    >
                      All ({allSites.length})
                    </button>
                    <button
                      onClick={() => setRiskFilter("critical")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "critical" ? "bg-rose-500/25 text-rose-300 font-bold border border-rose-500/40" : "bg-white/5 text-rose-400 hover:bg-rose-500/10"
                      }`}
                    >
                      &gt;4.0 ({criticalCount})
                    </button>
                    <button
                      onClick={() => setRiskFilter("warning")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "warning" ? "bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40" : "bg-white/5 text-amber-400 hover:bg-amber-500/10"
                      }`}
                    >
                      Elevated ({warningCount})
                    </button>
                    <button
                      onClick={() => setRiskFilter("nominal")}
                      className={`py-1 rounded-lg font-medium text-center transition-all ${
                        riskFilter === "nominal" ? "bg-sky-500/25 text-sky-300 font-bold border border-sky-500/40" : "bg-white/5 text-sky-400 hover:bg-sky-500/10"
                      }`}
                    >
                      Nominal
                    </button>
                  </div>

                  {/* Station List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {filteredDirectory.map((site) => {
                      const isSwot = site.id.startsWith("3124") || site.id.toLowerCase().includes("swot");
                      const forecast = forecastMap[site.id];
                      const isSelected = selectedSite?.id === site.id;
                      const isCrit = forecast && forecast.target_variable.includes("Salinity") && forecast.value >= 4.0;
                      const isWarn = forecast && forecast.target_variable.includes("Salinity") && forecast.value >= 2.5 && forecast.value < 4.0;

                      return (
                        <div
                          key={site.id}
                          onClick={() => handleSelectSite(site)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                            isSelected
                              ? "bg-primary/15 border-primary shadow-lg shadow-primary/10"
                              : "bg-white/5 hover:bg-white/10 border-white/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-foreground truncate max-w-[190px]">
                              {site.name}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              isCrit ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : isWarn ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            }`}>
                              {forecast ? `${forecast.value.toFixed(1)} ${forecast.unit}` : isSwot ? "SWOT Pass" : "Live Gauge"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="font-mono text-muted-foreground">{site.id}</span>
                            <span>{site.latitude.toFixed(2)}°N, {site.longitude.toFixed(2)}°E</span>
                          </div>
                        </div>
                      );
                    })}

                    {filteredDirectory.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        No stations match the selected filter.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PANEL 2: LAYERS & BASEMAP */}
              {activePanel === "layers" && (
                <div className="flex-1 overflow-y-auto pt-3 space-y-4 pr-1 scrollbar-thin">
                  
                  {/* Basemaps */}
                  <div className="flex flex-col space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cartographic Style</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setBasemap("dark")}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          basemap === "dark" ? "border-primary bg-primary/10 text-foreground" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="w-full h-7 rounded-lg bg-[#05070d] border border-white/10 flex items-center justify-center text-xs">🌙</div>
                        <span className="text-[10px] font-semibold">Dark Canvas</span>
                      </button>

                      <button
                        onClick={() => setBasemap("satellite")}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          basemap === "satellite" ? "border-primary bg-primary/10 text-foreground" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="w-full h-7 rounded-lg bg-[#14281d] border border-white/10 flex items-center justify-center text-xs">🛰️</div>
                        <span className="text-[10px] font-semibold">Satellite</span>
                      </button>

                      <button
                        onClick={() => setBasemap("osm")}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          basemap === "osm" ? "border-primary bg-primary/10 text-foreground" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="w-full h-7 rounded-lg bg-[#2b3342] border border-white/10 flex items-center justify-center text-xs">🗺️</div>
                        <span className="text-[10px] font-semibold">Topographic</span>
                      </button>
                    </div>
                  </div>

                  {/* Lead Time Horizon */}
                  <div className="flex flex-col space-y-2 border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Forecast Horizon</span>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {horizon === "now" ? "Observed Telemetry" : horizon === "7d" ? "+7 Days Forward" : "+14 Days Peak Ingress"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => setHorizon("now")}
                        className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                          horizon === "now" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        Now
                      </button>
                      <button
                        onClick={() => setHorizon("7d")}
                        className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                          horizon === "7d" ? "bg-amber-500 text-black font-bold shadow" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        +7 Days
                      </button>
                      <button
                        onClick={() => setHorizon("14d")}
                        className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                          horizon === "14d" ? "bg-rose-500 text-white font-bold shadow" : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        +14 Days
                      </button>
                    </div>
                  </div>

                  {/* Spatial Layers */}
                  <div className="flex flex-col space-y-2 border-t border-white/10 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spatial Data Overlays</span>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                        NASA SWOT Radar Passes
                      </span>
                      <input
                        type="checkbox"
                        checked={showSwot}
                        onChange={(e) => setShowSwot(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                        BWDB River Stage Gauges
                      </span>
                      <input
                        type="checkbox"
                        checked={showGauges}
                        onChange={(e) => setShowGauges(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        Salinity Intrusion Corridor
                      </span>
                      <input
                        type="checkbox"
                        checked={showSalinityFront}
                        onChange={(e) => setShowSalinityFront(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-400" />
                        4.0 dS/m Hazard Isohaline
                      </span>
                      <input
                        type="checkbox"
                        checked={showIsohalines}
                        onChange={(e) => setShowIsohalines(e.target.checked)}
                        className="accent-primary cursor-pointer w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* PANEL 3: ESTUARY GUIDE */}
              {activePanel === "guide" && (
                <div className="flex-1 overflow-y-auto pt-3 space-y-3 text-xs text-muted-foreground pr-1 scrollbar-thin">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground">
                    <span className="font-bold text-xs text-primary block mb-1">Khulna Delta Problem</span>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      During dry months (Jan - May), upstream Gorai discharge drops by 40-70%, allowing marine tidal salinity from the Bay of Bengal to penetrate 80km inland through Passur and Shibsa rivers.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-foreground text-xs block">Key Critical Thresholds:</span>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="font-bold text-sky-400 font-mono">1.0 dS/m</span>
                      <span>Drinking water safety limit for municipal supply.</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="font-bold text-amber-400 font-mono">4.0 dS/m</span>
                      <span>Boro rice agricultural crop damage threshold.</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px]">
                      <span className="font-bold text-rose-400 font-mono">8.0 dS/m</span>
                      <span>Extreme hypersaline boundary; disrupts all freshwater ecosystems.</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 4. Slide-Over Station Inspector Drawer (Right on Desktop / Bottom Sheet on Mobile) */}
        {selectedSite && (
          <div className="absolute inset-x-2 bottom-2 md:bottom-3 md:top-3 md:right-3 md:left-auto z-30 max-h-[80vh] md:max-h-none md:h-auto md:w-96 flex flex-col animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-300">
            <div className="h-full bg-[#08131f]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl flex flex-col justify-between overflow-y-auto rounded-2xl scrollbar-thin">
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-3">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{selectedSite.id}</span>
                      <Badge variant="outline" className={
                        selectedSite.id.startsWith("3124") || selectedSite.id.toLowerCase().includes("swot")
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px]"
                      }>
                        {selectedSite.id.startsWith("3124") ? "NASA SWOT Reach" : "BWDB Tidal Stage"}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-foreground leading-tight">{selectedSite.name}</h3>
                  </div>
                  
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Modeled Salinity</span>
                    <span className={`text-lg font-bold font-mono mt-0.5 ${
                      selectedForecast && selectedForecast.value >= 4.0 ? "text-rose-400" : "text-amber-400"
                    }`}>
                      {selectedForecast ? `${selectedForecast.value.toFixed(1)} ${selectedForecast.unit}` : "Nominal"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedForecast && selectedForecast.value >= 4.0 ? "⚠️ Boro Rice Hazard" : "Within Safe Limits"}
                    </span>
                  </div>

                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Coordinates</span>
                    <span className="font-mono text-foreground font-semibold mt-1 text-xs">
                      {selectedSite.latitude.toFixed(3)}°N
                    </span>
                    <span className="font-mono text-muted-foreground text-[10px]">
                      {selectedSite.longitude.toFixed(3)}°E
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedSite.description}
                </p>

                {/* Timeseries Forecast Chart */}
                <div className="flex flex-col space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Observed vs PINN Forecast</span>
                    <span className="text-[10px] font-mono text-emerald-400">Validated Telemetry</span>
                  </div>
                  <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <ForecastChart reachId={selectedSite.id} showBadge={false} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-3 shrink-0">
                <Link
                  href={`/app/reaches/${selectedSite.id}`}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs text-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <span>Full Reach Audit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/app/scenarios"
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-foreground font-medium transition-colors"
                >
                  Simulate Shock
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* 5. Minimalist Legend Overlay (Bottom Right) */}
        {showLegend && (
          <div className="absolute bottom-3 right-3 z-20 bg-[#08131f]/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/15 text-xs flex flex-col space-y-2 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Map Symbology</span>
              <button onClick={() => setShowLegend(false)} className="text-muted-foreground hover:text-white text-xs">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-400 border border-amber-300" />
                <span>NASA SWOT Reach</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400 border border-sky-300" />
                <span>BWDB River Gauge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded bg-rose-500" />
                <span>Marine Ingress (&gt;8 dS/m)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded bg-amber-500 border-dashed" />
                <span>Estuary Front (4-8 dS/m)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
