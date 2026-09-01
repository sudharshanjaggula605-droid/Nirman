"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldCheck,
  FileText,
  Building2,
  Gavel,
  HelpCircle,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  X,
  MessageSquare,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Direct User Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Support Requests", href: "/admin/support", icon: HelpCircle },
  { label: "Owner Approvals", href: "/admin/owners", icon: ShieldCheck },
  { label: "Contractor Approvals", href: "/admin/contractors", icon: UserCheck },
  { label: "Users Management", href: "/admin/users", icon: Users },
  { label: "Tender Management", href: "/admin/tenders", icon: FileText },
  { label: "Project Management", href: "/admin/projects", icon: Building2 },
  { label: "Bids Monitoring", href: "/admin/bids", icon: Gavel },
  { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-slate-950 text-slate-100 shadow-2xl transition-transform duration-300 md:static md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between`}
      >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Sidebar Header - Clickable Logo & Text redirecting to Home / Landing Page */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link
            href="/"
            title="Return to Main NIRMAN Landing Page"
            className="flex items-center gap-2 font-bold text-lg group hover:opacity-85 transition-all cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <Shield className="h-4 w-4" />
            </div>
            <span className="tracking-tight text-white group-hover:text-amber-400 transition-colors">NIRMAN</span>
            <span className="text-[10px] uppercase font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
              Admin
            </span>
          </Link>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1 rounded-md text-slate-400 hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4 space-y-1 flex-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
