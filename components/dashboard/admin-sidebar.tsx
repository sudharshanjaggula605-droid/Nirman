"use client";

import { useState } from "react";
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
  X,
  MessageSquare,
  User,
  Award,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NirmanLogo } from "@/components/nirman-logo";
import { LogoutModal } from "@/components/dashboard/logout-modal";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Bid Awards / Connections", href: "/admin/connections", icon: Award },
  { label: "Payments & Fees", href: "/admin/payments", icon: CreditCard },
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
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleSignOutClick = () => {
    if (onClose) onClose();
    setLogoutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
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
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full border-r border-slate-800 bg-slate-950 text-slate-100 shadow-2xl transition-transform duration-300 md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between overflow-hidden`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header - Logo & Brand name only (Unwanted 'Admin' label removed) */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
            <Link
              href="/"
              title="Return to Main NIRMAN Landing Page"
              className="flex items-center gap-2 font-bold text-lg group hover:opacity-85 transition-all cursor-pointer"
            >
              <NirmanLogo size="sm" className="group-hover:scale-105 transition-transform" />
              <span className="tracking-tight text-white group-hover:text-amber-400 transition-colors">NIRMAN</span>
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
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
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
              type="button"
              onClick={handleSignOutClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
}
