"use client";

import { useState } from "react";
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
import { useLanguage } from "@/lib/i18n/language-context";
import { LogoutModal } from "@/components/dashboard/logout-modal";

export function OwnerSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
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

  const navItems = [
    { label: t("nav.dashboard", "Dashboard"), href: "/owner/dashboard", icon: LayoutDashboard },
    { label: t("nav.my_projects", "My Projects"), href: "/owner/projects", icon: Building2 },
    { label: t("nav.my_tenders", "My Tenders"), href: "/owner/tenders", icon: FileText },
    { label: t("nav.received_bids", "Received Bids"), href: "/owner/bids", icon: Users },
    { label: t("nav.messages", "Messages"), href: "/owner/messages", icon: MessageSquare },
    { label: t("nav.payments", "Payments"), href: "/owner/payments", icon: CreditCard },
    { label: t("nav.reviews", "Reviews"), href: "/owner/reviews", icon: Star },
    { label: t("nav.documents", "Documents"), href: "/owner/documents", icon: Folder },
    { label: t("nav.settings", "Settings"), href: "/owner/settings", icon: Settings },
  ];

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card text-card-foreground shadow-2xl transition-transform duration-300 md:static md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header - Logo & Brand name only (Unwanted 'Owner' label removed) */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link
              href="/"
              title="Return to Main NIRMAN Landing Page"
              className="flex items-center gap-2 font-bold text-lg group hover:opacity-85 transition-all cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-700 text-white shadow-md group-hover:scale-105 transition-transform">
                <HardHat className="h-4 w-4" />
              </div>
              <span className="tracking-tight text-foreground group-hover:text-orange-600 transition-colors">
                {t("brand.nirman", "NIRMAN")}
              </span>
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1 rounded-md text-muted-foreground hover:bg-accent"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-4 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/owner/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-orange-700 text-white shadow-md shadow-orange-700/20 font-bold"
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
              type="button"
              onClick={handleSignOutClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {t("nav.logout", "Logout")}
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
