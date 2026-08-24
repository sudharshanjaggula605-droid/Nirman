"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Home,
  FileText,
  Gavel,
  ShieldCheck,
  CreditCard,
  Folder,
  BarChart3,
  Bell,
  AlertOctagon,
  History,
  Settings,
  LogOut,
  Shield,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Approvals & Verifications", href: "/admin/approvals", icon: ShieldCheck },
  { label: "Property Owners", href: "/admin/users/owners", icon: Users },
  { label: "Contractors", href: "/admin/users/contractors", icon: UserCheck },
  { label: "Properties", href: "/admin/properties", icon: Home },
  { label: "Projects", href: "/admin/projects", icon: Building2 },
  { label: "Tenders", href: "/admin/tenders", icon: FileText },
  { label: "Bids", href: "/admin/bids", icon: Gavel },
  { label: "Contracts", href: "/admin/contracts", icon: Shield },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Documents", href: "/admin/documents", icon: Folder },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Complaints", href: "/admin/complaints", icon: AlertOctagon },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
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
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-slate-950 text-slate-100 transition-transform duration-300 md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      } flex flex-col justify-between`}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white shadow-md">
              <Shield className="h-4 w-4" />
            </div>
            <span className="tracking-tight text-white">NIRMAN</span>
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
  );
}
