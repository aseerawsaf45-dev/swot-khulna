import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/components/UploadDropzone";

export default function DataHubPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Data Hub & Ingestion</h1>
        <p className="text-sm text-muted-foreground">Manage NASA SWOT integrations, field gauge CSV uploads, and source provenance.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Hydrocron Adapter Card */}
        <Card className="col-span-1 xl:col-span-2 bg-card border-white/5 p-6 flex flex-col space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21v-5h5" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold">PO.DAAC Hydrocron API</h3>
                <p className="text-xs text-muted-foreground">v1 Timeseries endpoint</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">HEALTHY</Badge>
          </div>

          <div className="flex flex-col space-y-4">
            <p className="text-sm">Pull SWOT KaRIn observation data for selected reaches. Limits apply to spatial boundaries and temporal ranges.</p>
            
            <div className="flex items-end gap-4">
              <div className="flex flex-col space-y-1.5 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reach ID</label>
                <input type="text" className="h-9 px-3 rounded-md bg-white/5 border border-border text-sm outline-none focus:border-primary/50" placeholder="e.g. SWOT_REACH_1234" />
              </div>
              <div className="flex flex-col space-y-1.5 flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Range</label>
                <input type="text" className="h-9 px-3 rounded-md bg-white/5 border border-border text-sm outline-none focus:border-primary/50" placeholder="Last 30 days" disabled />
              </div>
              <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Fetch Job
              </button>
            </div>
          </div>
        </Card>

        {/* CSV Upload Card */}
        <Card className="col-span-1 bg-card border-white/5 p-6 flex flex-col space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
             <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary-foreground">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold">Gauge CSV Upload</h3>
                <p className="text-xs text-muted-foreground">Manual local field data</p>
              </div>
          </div>

          <UploadDropzone />
        </Card>

      </div>
    </div>
  );
}
