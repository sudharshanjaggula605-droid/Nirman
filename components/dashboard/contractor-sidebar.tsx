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
    { label: t("nav.settings", "Settings"), href: "/contractor/settings", icon: Settings },
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
          {/* Sidebar Header - Logo and Brand only (Unwanted 'Contractor' text removed) */}
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
                  onClick={onClose}
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
