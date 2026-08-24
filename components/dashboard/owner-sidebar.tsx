"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Building2,
  PlusCircle,
  FileText,
  Users,
  Clock,
  Flag,
  CreditCard,
  Folder,
  MessageSquare,
  Bell,
  BarChart3,
  User,
  Settings,
  LogOut,
  HardHat,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const OWNER_NAV = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "My Properties", href: "/owner/properties", icon: Home },
  { label: "Projects", href: "/owner/projects", icon: Building2 },
  { label: "Create Project", href: "/owner/projects/new", icon: PlusCircle },
  { label: "Tenders", href: "/owner/tenders", icon: FileText },
  { label: "Contractor Bids", href: "/owner/bids", icon: Users },
  { label: "Active Projects", href: "/owner/projects/active", icon: Clock },
  { label: "Milestones", href: "/owner/milestones", icon: Flag },
  { label: "Payments", href: "/owner/payments", icon: CreditCard },
  { label: "Documents", href: "/owner/documents", icon: Folder },
  { label: "Messages", href: "/owner/messages", icon: MessageSquare },
  { label: "Notifications", href: "/owner/notifications", icon: Bell },
  { label: "Reports", href: "/owner/reports", icon: BarChart3 },
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
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link href="/owner/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md">
              <HardHat className="h-4 w-4" />
            </div>
            <span className="tracking-tight text-foreground">NIRMAN</span>
            <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
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
