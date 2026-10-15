"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

type ForecastChartProps = {
  reachId: string;
};

export function ForecastChart({ reachId }: ForecastChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const [obsRes, foreRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/reaches/${reachId}/observations`),
          fetch(`${API_URL}/api/v1/reaches/${reachId}/forecasts`)
        ]);

        const obs = obsRes.ok ? await obsRes.json() : [];
        const fore = foreRes.ok ? await foreRes.json() : [];

        // Combine and format for recharts
        const combinedMap: Record<string, any> = {};

        obs.forEach((o: any) => {
          const dateStr = new Date(o.timestamp).toISOString();
          if (!combinedMap[dateStr]) combinedMap[dateStr] = { date: dateStr, displayDate: new Date(o.timestamp).toLocaleDateString() };
          combinedMap[dateStr].observed = o.value;
        });

        fore.forEach((f: any) => {
          const dateStr = new Date(f.target_time).toISOString();
          if (!combinedMap[dateStr]) combinedMap[dateStr] = { date: dateStr, displayDate: new Date(f.target_time).toLocaleDateString() };
          combinedMap[dateStr].forecast = f.value;
        });

        const combinedArr = Object.values(combinedMap).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setData(combinedArr);
      } catch (err) {
        console.error("ForecastChart fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [reachId]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading chart data...</div>;

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 left-2 z-10 bg-black/60 text-[10px] uppercase tracking-widest text-emerald-400 px-2 py-1 rounded-sm border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Real Telemetry & PINN Forward Horizon
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            stroke="#666" 
            fontSize={12} 
            tickMargin={10} 
            minTickGap={30} 
          />
          <YAxis 
            stroke="#666" 
            fontSize={12} 
            tickFormatter={(val) => `${val} ppt`}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
            itemStyle={{ fontSize: '14px' }}
            labelStyle={{ color: '#888', marginBottom: '8px', fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="observed"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="Observed Salinity"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            name="Forecast Salinity (PINN)"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
