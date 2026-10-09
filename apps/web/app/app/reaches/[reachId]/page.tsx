import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForecastChart } from "@/components/ForecastChart";

export default function ReachDetailPage({ params }: { params: { reachId: string } }) {
  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Pasur River Segment A</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">DEMO REACH</Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Feature ID: SWOT_REACH_DEMO_001</span>
            <span>&bull;</span>
            <span>Region: Khulna Delta</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-4 py-2 rounded-md bg-secondary/10 text-secondary-foreground text-sm font-medium hover:bg-secondary/20 transition-colors">
             Export Report
           </button>
        </div>
      </div>

      {/* Main Tabs placeholder */}
      <div className="flex items-center gap-6 border-b border-border">
        <button className="px-1 py-3 text-sm font-medium text-primary border-b-2 border-primary">Overview & Charts</button>
        <button className="px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Data Quality</button>
        <button className="px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Source Provenance</button>
        <button className="px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Model Experiments</button>
      </div>

      {/* Main Chart Area */}
      <Card className="p-6 bg-card border-white/5 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Salinity Forecast (PINN v1.0)</h3>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
              <span className="text-muted-foreground">Observed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[#f59e0b] border-dashed rounded-full" />
              <span className="text-muted-foreground">Forecast</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[300px] flex items-center justify-center border border-border/50 rounded-lg bg-black/20">
          <ForecastChart reachId={params.reachId} />
        </div>
      </Card>
      
      {/* Observation Table */}
      <Card className="bg-card border-white/5 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Observations</h3>
          <span className="text-xs text-muted-foreground">Showing latest 10 records</span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp (UTC)</th>
                <th className="px-4 py-3 font-medium">Elevation (m)</th>
                <th className="px-4 py-3 font-medium">Width (m)</th>
                <th className="px-4 py-3 font-medium">Salinity (ppt)</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-foreground">2026-10-09 12:00:00</td>
                <td className="px-4 py-3">2.40</td>
                <td className="px-4 py-3">125.0</td>
                <td className="px-4 py-3 text-destructive">4.12</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-none">DEMO</Badge></td>
                <td className="px-4 py-3"><div className="w-2 h-2 rounded-full bg-success"></div></td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-foreground">2026-10-08 12:00:00</td>
                <td className="px-4 py-3">2.35</td>
                <td className="px-4 py-3">124.0</td>
                <td className="px-4 py-3 text-warning">3.80</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-none">DEMO</Badge></td>
                <td className="px-4 py-3"><div className="w-2 h-2 rounded-full bg-success"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
