"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

export interface Forecast {
  id: string;
  site_id: string;
  target_time: string;
  target_variable: string;
  value: number;
  unit: string;
  validation_status: string;
}

export interface MapWrapperProps {
  selectedSiteId?: string | null;
  onSelectSite?: (site: Site | null) => void;
  showSwot?: boolean;
  showGauges?: boolean;
  showSalinityFront?: boolean;
  showIsohalines?: boolean;
  basemap?: "dark" | "satellite" | "osm";
  horizon?: "now" | "7d" | "14d";
  searchQuery?: string;
  riskFilter?: "all" | "critical" | "warning" | "nominal";
  flyToCoords?: [number, number] | null;
}

// Controller for programmatic smooth map pans/zooms
function MapController({ coords, zoom }: { coords: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, zoom, { duration: 1.2 });
    }
  }, [coords, zoom, map]);
  return null;
}

// Custom modern SVG icons
const createGaugeIcon = (risk: string, isSelected: boolean) => {
  const color = risk === "CRITICAL" ? "#ef4444" : risk === "WARNING" ? "#f59e0b" : "#0ea5e9";
  const glow = isSelected ? `box-shadow: 0 0 0 6px ${color}40, 0 0 20px ${color}; transform: scale(1.15);` : "";
  
  return L.divIcon({
    className: "custom-gauge-icon",
    html: `
      <div style="width:30px;height:30px;border-radius:50%;background:#090d16;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;color:${color};${glow}transition:all 0.3s ease;cursor:pointer;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
};

const createSwotIcon = (risk: string, isSelected: boolean) => {
  const color = risk === "CRITICAL" ? "#ef4444" : risk === "WARNING" ? "#f59e0b" : "#fbbf24";
  const glow = isSelected ? `box-shadow: 0 0 0 6px ${color}40, 0 0 20px ${color}; transform: scale(1.15);` : "";
  
  return L.divIcon({
    className: "custom-swot-icon",
    html: `
      <div style="width:34px;height:34px;border-radius:10px;background:#090d16;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;color:${color};${glow}transition:all 0.3s ease;cursor:pointer;">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

// Basemap URLs
const BASEMAP_TILES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

// Southwest Bangladesh River Corridors
const PASSUR_SALINITY_CORRIDOR: [number, number][] = [
  [21.75, 89.60],
  [21.95, 89.62],
  [22.20, 89.61],
  [22.464, 89.60], // Mongla Port
  [22.65, 89.58],
  [22.808, 89.58], // Khulna Rupsha
  [23.00, 89.55]
];

const SHIBSA_CORRIDOR: [number, number][] = [
  [21.78, 89.35],
  [22.10, 89.38],
  [22.45, 89.32],
  [22.55, 89.52]
];

const GORAI_FRESHWATER_CORRIDOR: [number, number][] = [
  [23.54, 89.516],
  [23.25, 89.53],
  [23.00, 89.55]
];

export default function MapWrapper({
  selectedSiteId,
  onSelectSite,
  showSwot = true,
  showGauges = true,
  showSalinityFront = true,
  showIsohalines = true,
  basemap = "dark",
  horizon = "now",
  searchQuery = "",
  riskFilter = "all",
  flyToCoords = null,
}: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);

  useEffect(() => {
    setMounted(true);
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    Promise.all([
      fetch(`${API_URL}/api/v1/reaches`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_URL}/api/v1/reaches/forecasts/all`).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([loadedSites, loadedForecasts]) => {
      setSites(loadedSites);
      setForecasts(loadedForecasts);
    });
  }, []);

  // Map forecast values onto sites for risk computation
  const forecastMap = useMemo(() => {
    const map: Record<string, Forecast> = {};
    for (const f of forecasts) {
      if (!map[f.site_id] || f.target_variable.includes("Salinity")) {
        map[f.site_id] = f;
      }
    }
    return map;
  }, [forecasts]);

  // Filter sites based on search, layer toggles, and risk
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const isSwot = site.id.startsWith("3124") || site.id.toLowerCase().includes("swot");
      
      // Layer type filter
      if (isSwot && !showSwot) return false;
      if (!isSwot && !showGauges) return false;

      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = site.name.toLowerCase().includes(q);
        const matchesId = site.id.toLowerCase().includes(q);
        const matchesDesc = site.description.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc) return false;
      }

      // Risk category filter
      const forecast = forecastMap[site.id];
      const val = forecast?.value || 0;
      const isSalinity = forecast?.target_variable?.includes("Salinity") ?? false;
      
      if (riskFilter === "critical") {
        if (!isSalinity || val < 4.0) return false;
      } else if (riskFilter === "warning") {
        if (!isSalinity || val < 2.5 || val >= 4.0) return false;
      } else if (riskFilter === "nominal") {
        if (isSalinity && val >= 2.5) return false;
      }

      return true;
    });
  }, [sites, showSwot, showGauges, searchQuery, riskFilter, forecastMap]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#050505] flex items-center justify-center text-muted-foreground text-sm">
        Initializing Spatial Radar & Bathymetry...
      </div>
    );
  }

  const currentTile = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[22.65, 89.52]}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#05070d" }}
      >
        <MapController coords={flyToCoords} zoom={12} />

        <TileLayer
          attribution={currentTile.attribution}
          url={currentTile.url}
          maxZoom={18}
        />

        {/* Salinity Intrusion River Corridors */}
        {showSalinityFront && (
          <>
            {/* Marine / Estuarine Ingress Corridor (High Salinity >8.0 dS/m) */}
            <Polyline
              positions={PASSUR_SALINITY_CORRIDOR.slice(0, 4)}
              pathOptions={{
                color: "#ef4444",
                weight: 6,
                opacity: 0.85,
                lineCap: "round",
                dashArray: horizon === "14d" ? "10, 8" : undefined,
              }}
            />

            {/* Estuarine Transition Zone (4.0 - 8.0 dS/m Risk Front) */}
            <Polyline
              positions={PASSUR_SALINITY_CORRIDOR.slice(3, 6)}
              pathOptions={{
                color: "#f59e0b",
                weight: 5,
                opacity: 0.85,
                lineCap: "round",
                dashArray: "8, 6",
              }}
            />

            {/* Shibsa Western Ingress Corridor */}
            <Polyline
              positions={SHIBSA_CORRIDOR}
              pathOptions={{
                color: "#f59e0b",
                weight: 4,
                opacity: 0.75,
                lineCap: "round",
              }}
            />

            {/* Gorai Freshwater Dilution Inflow (<2.0 dS/m) */}
            <Polyline
              positions={GORAI_FRESHWATER_CORRIDOR}
              pathOptions={{
                color: "#0ea5e9",
                weight: 5,
                opacity: 0.8,
                lineCap: "round",
              }}
            />
          </>
        )}

        {/* Agricultural Threshold Isohalines (4.0 dS/m Hazard Boundary) */}
        {showIsohalines && (
          <Circle
            center={[22.55, 89.52]}
            radius={18000}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.04,
              weight: 1.5,
              dashArray: "4, 6",
            }}
          />
        )}

        {/* Station and Reach Markers */}
        {filteredSites.map((site) => {
          const isSwot = site.id.startsWith("3124") || site.id.toLowerCase().includes("swot");
          const isSelected = selectedSiteId === site.id;
          const forecast = forecastMap[site.id];

          // Determine risk level based on forecast and lead time horizon
          let risk = "NOMINAL";
          if (forecast && forecast.target_variable.includes("Salinity")) {
            const adjustedVal = horizon === "14d" ? forecast.value * 1.15 : forecast.value;
            if (adjustedVal >= 4.0) risk = "CRITICAL";
            else if (adjustedVal >= 2.5) risk = "WARNING";
          }

          const markerIcon = isSwot
            ? createSwotIcon(risk, isSelected)
            : createGaugeIcon(risk, isSelected);

          return (
            <Marker
              key={site.id}
              position={[site.latitude, site.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectSite) onSelectSite(site);
                },
              }}
            >
              <Popup className="custom-leaflet-popup text-black">
                <div className="flex flex-col space-y-2 p-1 min-w-[200px]">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-[10px] tracking-wider uppercase text-slate-500">
                      {isSwot ? "NASA SWOT Reach" : "BWDB Station"}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        risk === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : risk === "WARNING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {risk}
                    </span>
                  </div>

                  <span className="font-bold text-sm text-slate-900 leading-tight">
                    {site.name}
                  </span>
                  
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {site.description}
                  </p>

                  {forecast && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>PINN Projection</span>
                        <span>{forecast.target_variable}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {forecast.value.toFixed(1)} {forecast.unit}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onSelectSite && onSelectSite(site)}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                    >
                      Inspect Telemetry &rarr;
                    </button>
                    <a
                      href={`/app/reaches/${site.id}`}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Full Audit
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
