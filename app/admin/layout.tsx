"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title="NIRMAN Governance Control Center" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-900">{children}</main>
      </div>
    </div>
  );
}
