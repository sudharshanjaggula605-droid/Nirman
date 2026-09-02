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

  const handleNavClick = (href: string) => {
    if (onClose) onClose();
    router.push(href);
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
      {/* Mobile Bottom Sheet Menu Popup */}
      <div className={`md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* Backdrop Overlay (z-[100010] to float above all fixed bottom navbars) */}
        <div
          onClick={onClose}
          className={`fixed inset-0 z-[100010] bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Bottom Sheet Container (z-[100020] ensures zero touch interference) */}
        <div
          className={`fixed inset-x-0 bottom-0 z-[100020] max-h-[85vh] w-full rounded-t-3xl border-t bg-card text-card-foreground shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Header & Drag Indicator */}
          <div className="pt-3 pb-2 px-6 flex flex-col items-center border-b relative">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30 mb-3" />
            <div className="flex w-full items-center justify-between">
              <Link
                href="/"
                onClick={() => handleNavClick("/")}
                className="flex items-center gap-2 font-bold text-base cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-700 text-white shadow-md">
                  <HardHat className="h-4 w-4" />
                </div>
                <span className="tracking-tight text-foreground">
                  {t("brand.nirman", "NIRMAN")}
                </span>
              </Link>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-muted-foreground hover:bg-accent cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-3 space-y-1 overflow-y-auto flex-1 max-h-[calc(85vh-140px)] overscroll-contain pb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/owner/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98] ${
                    isActive
                      ? "bg-orange-700 text-white shadow-md shadow-orange-700/20 font-bold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Bottom Sheet Footer Logout */}
          <div className="p-4 border-t bg-card">
            <button
              type="button"
              onClick={handleSignOutClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {t("nav.logout", "Logout")}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (Left side, sticky) */}
      <aside className="hidden md:flex md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 border-r bg-card text-card-foreground flex-col justify-between overflow-hidden">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header */}
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
