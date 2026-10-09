import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import fs from "fs";
import path from "path";

export default async function ModelsPage() {
  let manifest: any = null;
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'evaluation_manifest.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    manifest = JSON.parse(fileContents);
  } catch (error) {
    console.error("Evaluation manifest not found.");
  }

  const isReal = manifest ? !manifest.is_synthetic : false;
  
  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Models & Validation</h1>
        <p className="text-sm text-muted-foreground">Inspect evaluation metrics, baselines, and test performance for deployed predictive artifacts.</p>
      </div>

      {/* Model Context Header */}
      <Card className="bg-card border-white/5 p-6 flex flex-col space-y-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">PINN v1.2 (Active)</h2>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">DEPLOYED</Badge>
              {manifest && (
                <Badge variant="outline" className={isReal ? "bg-primary/10 text-primary border-primary/20" : "bg-warning/10 text-warning border-warning/20"}>
                  {isReal ? "REAL DATA" : "SYNTHETIC FALLBACK"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Physics-Informed Neural Network with Fourier feature mapping for resolving high-frequency tidal dynamics. Trained on NASA SWOT KaRIn passes alongside continuous local gauge constraints.
            </p>
          </div>
          <div className="text-right flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Provenance Artifact</span>
            <span className="text-sm font-mono text-foreground">{manifest ? `sha256:${manifest.pinn_checksum.substring(0, 8)}...` : 'Unknown'}</span>
          </div>
        </div>

        {/* Temporal Test Splits */}
        {manifest && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Samples</span>
              <span className="text-sm">{manifest.samples} records</span>
              <span className="text-xs text-muted-foreground">Historical Coverage</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Training Samples</span>
              <span className="text-sm">{manifest.train_samples} records</span>
              <span className="text-xs text-muted-foreground">80% Split (Chronological)</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Held-Out Test Samples</span>
              <span className="text-sm">{manifest.test_samples} records</span>
              <span className="text-xs text-muted-foreground">20% Split (Chronological)</span>
            </div>
          </div>
        )}
      </Card>

      {!manifest ? (
         <Card className="p-8 text-center bg-card border-white/5 border-dashed">
            <p className="text-muted-foreground mb-4">No evaluation manifest found. The model metrics have not been generated.</p>
            <p className="text-sm text-muted-foreground">Run <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">python -m ml.evaluation.evaluate</code> to generate.</p>
         </Card>
      ) : (
        <>
          {/* Evaluation Results */}
          <Card className="bg-card border-white/5 overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-black/10">
              <h3 className="text-sm font-semibold">Held-Out Baseline Comparison (Salinity EC)</h3>
              <span className="text-xs text-muted-foreground">Evaluated on strictly chronologically held-out data</span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-border">
                  <tr>
                    <th className="px-5 py-4 font-medium">Method</th>
                    <th className="px-5 py-4 font-medium">Test MAE</th>
                    <th className="px-5 py-4 font-medium">Test RMSE</th>
                    <th className="px-5 py-4 font-medium">Evaluation Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 text-foreground font-medium">Persistence (Naive)</td>
                    <td className="px-5 py-4">{manifest.baseline_mae.toFixed(4)} dS/m</td>
                    <td className="px-5 py-4">{manifest.baseline_rmse.toFixed(4)} dS/m</td>
                    <td className="px-5 py-4 text-muted-foreground">Same held-out dates</td>
                  </tr>
                  <tr className="hover:bg-primary/5 transition-colors bg-primary/5 border-l-2 border-l-primary">
                    <td className="px-5 py-4 text-primary font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      PINN (Proposed)
                    </td>
                    <td className="px-5 py-4 font-semibold">{manifest.pinn_mae.toFixed(4)} dS/m</td>
                    <td className="px-5 py-4 font-semibold">{manifest.pinn_rmse.toFixed(4)} dS/m</td>
                    <td className="px-5 py-4 text-muted-foreground">Same held-out targets</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 flex flex-col space-y-4 bg-card border-white/5">
              <h3 className="text-sm font-semibold border-b border-border pb-2">Error Characteristics</h3>
              <div className="flex flex-col space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Performance vs Baseline</span>
                  <span className={manifest.pinn_wins ? "font-medium text-success" : "font-medium text-destructive"}>
                    {manifest.pinn_wins ? "PINN Wins" : "Baseline Wins"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data Authenticity</span>
                  <span className={isReal ? "font-medium text-success" : "font-medium text-warning"}>
                    {isReal ? "Verified Field Data" : "Synthetic Fallback"}
                  </span>
                </div>
              </div>
            </Card>
            
            <Card className="p-5 flex flex-col space-y-4 bg-card border-white/5">
              <h3 className="text-sm font-semibold border-b border-border pb-2">Operational Limits</h3>
              <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  Extrapolation beyond 14 days causes exponential uncertainty growth.
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  Model abstains when field telemetry is stale for &gt;72h during monsoon season.
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-warning font-bold">•</span>
                  High-frequency tidal aliasing persists in SWOT-only predictions.
                </p>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
