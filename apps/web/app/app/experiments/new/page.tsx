import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NewExperimentPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Configure Model Experiment</h1>
        <p className="text-sm text-muted-foreground">Define parameters for a new Physics-Informed Neural Network (PINN) run.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wizard Form */}
        <Card className="col-span-1 lg:col-span-2 bg-card border-white/5 p-6 flex flex-col space-y-8">
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold border-b border-border pb-2">1. Target Variable</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 p-4 border border-primary bg-primary/5 rounded-lg cursor-pointer">
                <input type="radio" name="target" className="accent-primary" defaultChecked />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Salinity (EC)</span>
                  <span className="text-xs text-muted-foreground">Predict dS/m intrusion</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-border bg-white/5 rounded-lg cursor-pointer opacity-70">
                <input type="radio" name="target" className="accent-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Water Surface Elevation</span>
                  <span className="text-xs text-muted-foreground">Predict tidal heights</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold border-b border-border pb-2">2. Architecture</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Model Type</label>
                <select className="h-9 px-3 rounded-md bg-white/5 border border-border text-sm outline-none focus:border-primary/50">
                  <option>Fourier-PINN (Proposed)</option>
                  <option>Standard PINN</option>
                  <option>Statistical Baseline</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Forecast Horizon</label>
                <select className="h-9 px-3 rounded-md bg-white/5 border border-border text-sm outline-none focus:border-primary/50">
                  <option>7 Days</option>
                  <option>14 Days</option>
                  <option>30 Days</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
             <button className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all opacity-50 cursor-not-allowed">
               Start Training Job
             </button>
          </div>
        </Card>

        {/* Eligibility Panel */}
        <Card className="col-span-1 bg-card border-white/5 p-6 flex flex-col space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Eligibility Pre-flight</h3>
          
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm font-semibold text-destructive">Forecast Blocked</span>
            </div>
            <p className="text-xs text-muted-foreground">The selected target cannot be trained due to missing prerequisite observations.</p>
          </div>

          <div className="flex flex-col space-y-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Khulna Delta Region</span>
              <Badge variant="outline" className="bg-success/10 text-success border-none">Valid</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reach SWORD Geometry</span>
              <Badge variant="outline" className="bg-success/10 text-success border-none">Valid</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gauge Telemetry (30d)</span>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-none">Missing</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Chemistry Target (Salinity)</span>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-none">Missing</Badge>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Scientific Integrity Lock
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}
