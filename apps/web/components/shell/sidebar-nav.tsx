"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Overview", href: "/app/overview", icon: "LayoutDashboard" },
  { name: "Map Explorer", href: "/app/map", icon: "Map" },
  { name: "Forecasts", href: "/app/forecasts", icon: "LineChart" },
  { name: "Experiments", href: "/app/experiments/new", icon: "FlaskConical" },
  { name: "Scenarios", href: "/app/scenarios", icon: "GitCompare" },
  { name: "Data Hub", href: "/app/data", icon: "Database" },
  { name: "Models & Validation", href: "/app/models", icon: "BrainCircuit" },
  { name: "Alerts", href: "/app/alerts", icon: "Bell" },
  { name: "Reports", href: "/app/reports", icon: "FileText" },
];

import React, { Suspense } from "react";

function SidebarNavInner() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] hidden md:flex flex-col h-full bg-card border-r border-border shrink-0 z-10 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M2 12h4l3-9 5 18 3-9h5" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-foreground text-sm uppercase">SWOT / Khulna</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-secondary hover:text-foreground hover:bg-white/5"
              }`}
            >
              <div className={`w-1 h-4 rounded-full bg-primary transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings / Footer */}
      <div className="p-4 border-t border-border">
        <Link 
          href="/app/settings" 
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-secondary hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export function SidebarNav() {
  return (
    <Suspense fallback={<div className="w-[260px] hidden md:flex h-full bg-card border-r border-border shrink-0" />}>
      <SidebarNavInner />
    </Suspense>
  );
}

