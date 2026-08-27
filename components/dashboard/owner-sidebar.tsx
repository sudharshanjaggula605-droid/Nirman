"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  MessageSquare,
  CreditCard,
  Star,
  Folder,
  User,
  Settings,
  LogOut,
  HardHat,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const OWNER_NAV = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "My Projects", href: "/owner/projects", icon: Building2 },
  { label: "My Tenders", href: "/owner/tenders", icon: FileText },
  { label: "Received Bids", href: "/owner/bids", icon: Users },
  { label: "Messages", href: "/owner/messages", icon: MessageSquare },
  { label: "Payments", href: "/owner/payments", icon: CreditCard },
  { label: "Reviews", href: "/owner/reviews", icon: Star },
  { label: "Documents", href: "/owner/documents", icon: Folder },
  { label: "Profile", href: "/owner/profile", icon: User },
  { label: "Settings", href: "/owner/settings", icon: Settings },
];

interface OwnerSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function OwnerSidebar({ open, onClose }: OwnerSidebarProps) {
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
            <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
              Owner
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
          {OWNER_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/owner/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
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
