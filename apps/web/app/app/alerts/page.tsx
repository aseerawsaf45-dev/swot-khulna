import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AlertsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Active Alerts</h1>
        <p className="text-sm text-muted-foreground">System-generated warnings for threshold breaches and data source failures.</p>
      </div>

      <Card className="bg-card border-white/5 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Severity</th>
                <th className="px-5 py-4 font-medium">Timestamp</th>
                <th className="px-5 py-4 font-medium">Entity / Reach</th>
                <th className="px-5 py-4 font-medium">Message</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              
              <tr className="hover:bg-destructive/5 transition-colors bg-destructive/5 border-l-2 border-l-destructive">
                <td className="px-5 py-4"><Badge variant="outline" className="bg-destructive/10 text-destructive border-none">CRITICAL</Badge></td>
                <td className="px-5 py-4 text-muted-foreground">2 hrs ago</td>
                <td className="px-5 py-4 font-mono text-xs">SWOT_REACH_DEMO_001</td>
                <td className="px-5 py-4 font-medium">Salinity forecasted to cross 4.0 dS/m agriculture threshold in 48 hours.</td>
                <td className="px-5 py-4"><span className="text-xs font-semibold text-destructive">UNRESOLVED</span></td>
              </tr>
              
              <tr className="hover:bg-warning/5 transition-colors">
                <td className="px-5 py-4"><Badge variant="outline" className="bg-warning/10 text-warning border-none">WARNING</Badge></td>
                <td className="px-5 py-4 text-muted-foreground">14 days ago</td>
                <td className="px-5 py-4 font-mono text-xs">SYSTEM</td>
                <td className="px-5 py-4 text-muted-foreground">NASA SWOT KaRIn pass has not provided new observations.</td>
                <td className="px-5 py-4"><span className="text-xs font-semibold text-warning">ACTIVE</span></td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors opacity-50">
                <td className="px-5 py-4"><Badge variant="outline" className="bg-muted text-muted-foreground border-none">INFO</Badge></td>
                <td className="px-5 py-4 text-muted-foreground">16 days ago</td>
                <td className="px-5 py-4 font-mono text-xs">SWOT_REACH_DEMO_002</td>
                <td className="px-5 py-4 text-muted-foreground">New model version (PINN v1.2) deployed successfully.</td>
                <td className="px-5 py-4"><span className="text-xs font-semibold text-muted-foreground">RESOLVED</span></td>
              </tr>

            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
