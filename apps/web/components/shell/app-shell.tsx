import { SidebarNav } from "./sidebar-nav";
import { TopContextBar } from "./top-context-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground dark">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopContextBar />
        
        {/* Page Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px] w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
