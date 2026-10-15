import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ExperimentsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Model Experiments</h1>
        <p className="text-sm text-muted-foreground">Historical training runs, hyperparameter sweeps, and ablation studies for the PINN.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        
        <Card className="bg-card border-white/5 p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Experiment #042: Fourier Mapping Baseline</h3>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">COMPLETED</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Tested impact of high-frequency tidal embeddings on reconstruction loss.</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="text-sm font-semibold text-primary">MAE: 0.435 dS/m (Verified)</span>
            <span className="text-xs text-muted-foreground">Duration: 4h 12m</span>
          </div>
        </Card>

        <Card className="bg-card border-white/5 p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 opacity-70">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Experiment #041: Default PINN</h3>
              <Badge variant="outline" className="bg-muted text-muted-foreground border-none">COMPLETED</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Standard PINN without Fourier features.</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="text-sm font-semibold text-muted-foreground">MAE: 0.812 dS/m</span>
            <span className="text-xs text-muted-foreground">Duration: 3h 45m</span>
          </div>
        </Card>

        <Card className="bg-card border-white/5 p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 opacity-70">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Experiment #040: Persistence Baseline</h3>
              <Badge variant="outline" className="bg-muted text-muted-foreground border-none">COMPLETED</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Naive historical copy-forward baseline.</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="text-sm font-semibold text-muted-foreground">MAE: 0.660 dS/m</span>
            <span className="text-xs text-muted-foreground">Duration: 0h 1m</span>
          </div>
        </Card>

      </div>
    </div>
  );
}
