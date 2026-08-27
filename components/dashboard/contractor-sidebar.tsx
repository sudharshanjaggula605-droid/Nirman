"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Building2,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Briefcase,
  Star,
  User,
  Settings,
  LogOut,
  HardHat,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CONTRACTOR_NAV = [
  { label: "Dashboard", href: "/contractor/dashboard", icon: LayoutDashboard },
  { label: "Find Tenders", href: "/contractor/tenders", icon: Search },
  { label: "My Bids", href: "/contractor/bids", icon: FileText },
  { label: "Active Projects", href: "/contractor/projects", icon: Building2 },
  { label: "Completed Projects", href: "/contractor/projects?status=completed", icon: CheckCircle },
  { label: "Messages", href: "/contractor/messages", icon: MessageSquare },
  { label: "Payments", href: "/contractor/payments", icon: CreditCard },
  { label: "Portfolio", href: "/contractor/portfolio", icon: Briefcase },
  { label: "Reviews", href: "/contractor/reviews", icon: Star },
  { label: "Profile", href: "/contractor/profile", icon: User },
  { label: "Settings", href: "/contractor/settings", icon: Settings },
];

interface ContractorSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function ContractorSidebar({ open, onClose }: ContractorSidebarProps) {
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
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-card text-card-foreground transition-transform duration-300 md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      } flex flex-col justify-between`}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Sidebar Header - Clickable Logo & Text redirecting to Home / Landing Page */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link
            href="/"
            title="Return to Main NIRMAN Landing Page"
            className="flex items-center gap-2 font-bold text-lg group hover:opacity-85 transition-all cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <HardHat className="h-4 w-4" />
            </div>
            <span className="tracking-tight text-foreground group-hover:text-orange-600 transition-colors">NIRMAN</span>
            <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Contractor
            </span>
          </Link>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1 rounded-md text-muted-foreground hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4 space-y-1 flex-1">
          {CONTRACTOR_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/contractor/dashboard" && pathname.startsWith(item.href.split("?")[0]));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
