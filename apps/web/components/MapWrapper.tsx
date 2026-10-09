"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons due to Next.js static asset handling
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

export default function MapWrapper() {
  const [mounted, setMounted] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Fetch real sites from backend
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/v1/reaches`)
      .then(res => res.json())
      .then(data => setSites(data))
      .catch(err => console.error("Failed to fetch sites:", err));
  }, []);

  if (!mounted) return <div className="w-full h-full bg-[#050505] flex items-center justify-center text-muted-foreground">Loading interactive map...</div>;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[22.81, 89.56]} // Khulna region coordinates
        zoom={10} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {sites.map(site => {
          // Differentiate styling based on site type
          const isSwotNode = site.id.startsWith("swot");
          
          if (isSwotNode) {
            return (
              <CircleMarker key={site.id} center={[site.latitude, site.longitude]} radius={8} pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.6, weight: 2 }}>
                <Popup className="text-black">
                  <div className="flex flex-col space-y-1">
                    <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">{site.name}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{site.description}</span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
          
          return (
            <Marker key={site.id} position={[site.latitude, site.longitude]} icon={icon}>
              <Popup className="text-black">
                <div className="flex flex-col space-y-1">
                  <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">{site.name}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{site.description}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
