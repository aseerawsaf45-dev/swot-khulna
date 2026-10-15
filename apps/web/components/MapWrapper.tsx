"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  Tooltip,
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
  onSelectCorridor?: (corridorName: string) => void;
}

// Controller for programmatic smooth map pans/zooms
function MapController({ coords, zoom }: { coords: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [coords, zoom, map]);
  return null;
}

// High-information beacon SVG divIcons with live value pills
const createBeaconIcon = (
  type: "swot" | "gauge",
  risk: string,
  isSelected: boolean,
  displayValue: string
) => {
  const isCrit = risk === "CRITICAL";
  const isWarn = risk === "WARNING";
  const color = isCrit ? "#f43f5e" : isWarn ? "#f59e0b" : type === "swot" ? "#57d6d0" : "#38bdf8";
  const badgeBg = isCrit 
    ? "rgba(244, 63, 94, 0.25)" 
    : isWarn 
    ? "rgba(245, 158, 11, 0.25)" 
    : "rgba(8, 19, 31, 0.85)";
  const glow = isSelected 
    ? `box-shadow: 0 0 0 6px ${color}40, 0 0 25px ${color}; transform: scale(1.15);` 
    : isCrit
    ? `box-shadow: 0 0 0 3px ${color}30, 0 0 16px ${color}80;`
    : "";
  
  const iconSvg = type === "swot" 
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/><circle cx="12" cy="12" r="4"/></svg>`
    : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`;

  return L.divIcon({
    className: "custom-beacon-icon",
    html: `
      <div style="position:relative;display:flex;align-items:center;cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.7));">
        <div style="width:28px;height:28px;border-radius:${type === 'swot' ? '8px' : '50%'};background:#08131f;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;color:${color};${glow}transition:all 0.25s ease;shrink:0;">
          ${iconSvg}
        </div>
        ${displayValue ? `
          <div style="margin-left:5px;padding:1.5px 6px;border-radius:6px;background:${badgeBg};border:1px solid ${color}60;color:${isCrit ? '#fda4af' : isWarn ? '#fde68a' : '#f1f6f8'};font-family:monospace;font-size:10px;font-weight:700;white-space:nowrap;backdrop-filter:blur(6px);box-shadow:0 2px 6px rgba(0,0,0,0.5);">
            ${displayValue}
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [85, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  });
};

// Premium Basemap URLs (100% Free, Official GIS, Zero Watermarks)
const BASEMAP_TILES = {
  dark: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ref: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
  },
  satellite: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ref: null,
    attribution: "Tiles &copy; Esri &mdash; NASA, USGS, ESA, GeoEye"
  },
  osm: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    ref: null,
    attribution: "Tiles &copy; Esri &mdash; OpenStreetMap, USGS, METI"
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
  onSelectCorridor,
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
      <div className="w-full h-full bg-[#05070d] flex items-center justify-center text-muted-foreground text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono">Synchronizing Radar & Bathymetry...</span>
        </div>
      </div>
    );
  }

  const currentTileConfig = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;

  return (
    <div className="w-full h-full relative z-0">
      <style>{`
        .leaflet-container {
          background-color: #05070d !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #08131f !important;
          color: #f1f6f8 !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7) !important;
          border-radius: 16px !important;
        }
        .leaflet-popup-content {
          margin: 12px 14px !important;
          line-height: 1.4 !important;
        }
        .leaflet-popup-close-button {
          color: #718795 !important;
          padding: 8px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #f1f6f8 !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .leaflet-bar a {
          background-color: #08131f !important;
          color: #f1f6f8 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-bar a:hover {
          background-color: #122538 !important;
          color: #57d6d0 !important;
        }
        .leaflet-tooltip {
          background: #08131f !important;
          color: #f1f6f8 !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          border-radius: 8px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 5px 9px !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #08131f !important;
        }
      `}</style>

      <MapContainer
        center={[22.65, 89.52]}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#05070d" }}
      >
        <MapController coords={flyToCoords} zoom={12} />

        {/* Base Layer */}
        <TileLayer
          attribution={currentTileConfig.attribution}
          url={currentTileConfig.base}
          maxZoom={18}
        />

        {/* Optional Reference Labels (for dark mode) */}
        {currentTileConfig.ref && (
          <TileLayer
            attribution=""
            url={currentTileConfig.ref}
            maxZoom={18}
            opacity={0.8}
          />
        )}

        {/* Salinity Intrusion River Corridors with Rich Interactive Tooltips */}
        {showSalinityFront && (
          <>
            {/* Marine / Estuarine Ingress Corridor (High Salinity >8.0 dS/m) */}
            <Polyline
              positions={PASSUR_SALINITY_CORRIDOR.slice(0, 4)}
              pathOptions={{
                color: "#f43f5e",
                weight: 6,
                opacity: 0.9,
                lineCap: "round",
                dashArray: horizon === "14d" ? "10, 8" : undefined,
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Passur"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-rose-400">Passur Marine Ingress Corridor</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Bay of Bengal → Mongla Port (&gt;8.0 dS/m)</span>
                </div>
              </Tooltip>
            </Polyline>

            {/* Estuarine Transition Zone (4.0 - 8.0 dS/m Risk Front) */}
            <Polyline
              positions={PASSUR_SALINITY_CORRIDOR.slice(3, 6)}
              pathOptions={{
                color: "#f59e0b",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                dashArray: "8, 6",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Passur"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-amber-400">Estuary Risk Front (4.0 - 8.0 dS/m)</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Mongla → Khulna Core Polders</span>
                </div>
              </Tooltip>
            </Polyline>

            {/* Shibsa Western Ingress Corridor */}
            <Polyline
              positions={SHIBSA_CORRIDOR}
              pathOptions={{
                color: "#f59e0b",
                weight: 4,
                opacity: 0.8,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Shibsa"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-amber-400">Shibsa Mangrove Corridor</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Western Tidal Channel (4.2 dS/m)</span>
                </div>
              </Tooltip>
            </Polyline>

            {/* Gorai Freshwater Dilution Inflow (<2.0 dS/m) */}
            <Polyline
              positions={GORAI_FRESHWATER_CORRIDOR}
              pathOptions={{
                color: "#38bdf8",
                weight: 5,
                opacity: 0.85,
                lineCap: "round",
              }}
              eventHandlers={{
                click: () => onSelectCorridor && onSelectCorridor("Gorai"),
              }}
            >
              <Tooltip sticky>
                <div className="flex flex-col space-y-0.5">
                  <span className="font-bold text-sky-400">Gorai Freshwater Buffer (&lt;2.0 dS/m)</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Ganges Dilution Outflow to Delta</span>
                </div>
              </Tooltip>
            </Polyline>
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
              fillOpacity: 0.05,
              weight: 1.5,
              dashArray: "4, 6",
            }}
          >
            <Tooltip sticky>
              <div className="flex flex-col space-y-0.5">
                <span className="font-bold text-amber-400 font-mono">4.0 dS/m Agricultural Hazard Ring</span>
                <span className="text-[10px] text-muted-foreground">Boro rice crops inside this zone face yield loss</span>
              </div>
            </Tooltip>
          </Circle>
        )}

        {/* Station and Reach Markers with Live Pill Badges */}
        {filteredSites.map((site) => {
          const isSwot = site.id.startsWith("3124") || site.id.toLowerCase().includes("swot");
          const isSelected = selectedSiteId === site.id;
          const forecast = forecastMap[site.id];

          // Determine risk level based on forecast and lead time horizon
          let risk = "NOMINAL";
          let displayVal = "";
          if (forecast) {
            const isSalinity = forecast.target_variable.includes("Salinity");
            const adjustedVal = horizon === "14d" ? forecast.value * 1.15 : forecast.value;
            
            if (isSalinity) {
              if (adjustedVal >= 4.0) risk = "CRITICAL";
              else if (adjustedVal >= 2.5) risk = "WARNING";
              displayVal = `${adjustedVal.toFixed(1)} ${forecast.unit}`;
            } else {
              displayVal = `${adjustedVal.toFixed(1)} ${forecast.unit}`;
            }
          } else if (isSwot) {
            displayVal = "SWOT Pass";
          } else {
            displayVal = "Gauge";
          }

          const markerIcon = createBeaconIcon(
            isSwot ? "swot" : "gauge",
            risk,
            isSelected,
            displayVal
          );

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
              <Popup className="custom-leaflet-popup">
                <div className="flex flex-col space-y-2 p-0.5 min-w-[220px] text-foreground">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="font-bold text-[10px] tracking-wider uppercase text-muted-foreground font-mono">
                      {isSwot ? "NASA SWOT Reach" : "BWDB Station"}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        risk === "CRITICAL"
                          ? "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                          : risk === "WARNING"
                          ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {risk}
                    </span>
                  </div>

                  <span className="font-bold text-sm text-white leading-tight">
                    {site.name}
                  </span>
                  
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {site.description}
                  </p>

                  {forecast && (
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col space-y-1 text-xs">
                      <div className="flex justify-between text-muted-foreground text-[10px] font-mono">
                        <span>PINN Projection</span>
                        <span>{forecast.target_variable}</span>
                      </div>
                      <span className="font-bold text-white text-sm font-mono">
                        {forecast.value.toFixed(1)} {forecast.unit}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onSelectSite && onSelectSite(site)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Inspect Details &rarr;
                    </button>
                    <a
                      href={`/app/reaches/${site.id}`}
                      className="text-[10px] text-muted-foreground hover:text-white"
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
