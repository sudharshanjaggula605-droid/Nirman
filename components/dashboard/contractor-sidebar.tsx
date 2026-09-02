"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
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

function ContractorSidebarInner({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  const statusParam = searchParams.get("status");
  const isCompletedProjectsPage =
    pathname === "/contractor/projects/completed" ||
    (pathname === "/contractor/projects" && statusParam === "completed");
  const isActiveProjectsPage =
    (pathname === "/contractor/projects/active" || pathname === "/contractor/projects") &&
    !isCompletedProjectsPage;

  const navItems = [
    { label: t("nav.dashboard", "Dashboard"), href: "/contractor/dashboard", icon: LayoutDashboard },
    { label: t("nav.find_tenders", "Find Tenders"), href: "/contractor/tenders", icon: Search },
    { label: t("nav.my_bids", "My Bids"), href: "/contractor/bids", icon: FileText },
    {
      label: t("nav.active_projects", "Active Projects"),
      href: "/contractor/projects",
      icon: Building2,
      isActive: isActiveProjectsPage,
    },
    {
      label: t("nav.completed_projects", "Completed Projects"),
      href: "/contractor/projects/completed",
      icon: CheckCircle,
      isActive: isCompletedProjectsPage,
    },
    { label: t("nav.messages", "Messages"), href: "/contractor/messages", icon: MessageSquare },
    { label: t("nav.payments", "Payments"), href: "/contractor/payments", icon: CreditCard },
    { label: t("nav.portfolio", "Portfolio"), href: "/contractor/portfolio", icon: Briefcase },
    { label: t("nav.reviews", "Reviews"), href: "/contractor/reviews", icon: Star },
    { label: t("nav.documents", "Documents"), href: "/contractor/documents", icon: Folder },
    { label: t("nav.settings", "Settings"), href: "/contractor/settings", icon: Settings },
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
              const active =
                item.isActive !== undefined
                  ? item.isActive
                  : pathname === item.href ||
                    (item.href !== "/contractor/dashboard" &&
                      !item.href.includes("projects") &&
                      pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98] ${
                    active
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
              const active =
                item.isActive !== undefined
                  ? item.isActive
                  : pathname === item.href ||
                    (item.href !== "/contractor/dashboard" &&
                      !item.href.includes("projects") &&
                      pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                    active
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

export function ContractorSidebar(props: { open?: boolean; onClose?: () => void }) {
  return (
    <Suspense fallback={<aside className="w-64 border-r bg-card" />}>
      <ContractorSidebarInner {...props} />
    </Suspense>
  );
}
