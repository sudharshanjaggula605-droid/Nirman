"use client";

import { useState } from "react";
import { OwnerSidebar } from "@/components/dashboard/owner-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <OwnerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title="Property Owner Portal" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
