import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ScenariosPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Scenario Comparison</h1>
        <p className="text-sm text-muted-foreground">Compare baseline forecasts against "what-if" conditional scenarios. Assumptions are explicitly marked.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scenario 1: Baseline */}
        <Card className="bg-card border-white/5 p-6 flex flex-col space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-base font-semibold">Baseline: Persistence Current</h3>
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-none">Control</Badge>
          </div>
          
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assumptions</h4>
            <div className="p-3 rounded-lg bg-white/5 border border-border text-sm flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Upstream Discharge (Gorai)</span>
                <span>Historical Average</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tidal Amplitude</span>
                <span>Observed Harmonic</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[250px] border border-border/50 rounded-lg bg-black/20 flex items-center justify-center">
             <span className="text-sm text-muted-foreground">[Baseline Chart]</span>
          </div>
        </Card>

        {/* Scenario 2: What-if */}
        <Card className="bg-card border-primary/20 p-6 flex flex-col space-y-6 shadow-[0_0_20px_rgba(87,214,208,0.05)]">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-base font-semibold text-primary">Conditional Scenario A</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Synthetic Projection</Badge>
          </div>
          
          <div className="flex flex-col space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary/70">Modified Assumptions</h4>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Upstream Discharge (Gorai)</span>
                <span className="text-primary font-medium">-40% (Dry Season Shock)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tidal Amplitude</span>
                <span>Observed Harmonic (Unchanged)</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[250px] border border-border/50 rounded-lg bg-black/20 flex items-center justify-center">
             <span className="text-sm text-primary/60">[Conditional Chart - Elevated Salinity]</span>
          </div>
        </Card>

      </div>
    </div>
  );
}
