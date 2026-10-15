"use client";

import { useState } from "react";
import { SidebarNav, MobileNavDrawer } from "./sidebar-nav";
import { TopContextBar } from "./top-context-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#05070d] text-foreground dark">
      {/* Desktop Sidebar */}
      <SidebarNav />

      {/* Mobile Drawer */}
      <MobileNavDrawer 
        open={mobileNavOpen} 
        onClose={() => setMobileNavOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopContextBar onToggleMobileNav={() => setMobileNavOpen(true)} />
        
        {/* Page Canvas */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 min-h-0">
          <div className="mx-auto max-w-[1600px] w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


