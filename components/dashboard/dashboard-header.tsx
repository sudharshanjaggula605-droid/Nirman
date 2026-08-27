"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, MessageSquare, Menu, Sun, Moon, CheckCircle2, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export function DashboardHeader({ onMenuToggle, title }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    async function loadUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        setProfile(userProfile);

        // Fetch unread notifications count from database
        const { count: notifCount } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", currentUser.id)
          .eq("is_read", false);

        let totalUnread = notifCount || 0;

        if (userProfile?.role === "admin") {
          const { count: openSupportCount } = await supabase
            .from("support_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "open");

          if (openSupportCount) {
            totalUnread = Math.max(totalUnread, openSupportCount);
          }
        }

        setUnreadNotifs(totalUnread);
      }
    }
    loadUser();
  }, []);

  const getStatusBadge = () => {
    if (!profile) return null;
    if (profile.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  };

  const getNotificationLink = () => {
    if (profile?.role === "contractor") return "/contractor/notifications";
    if (profile?.role === "admin") return "/admin/notifications";
    return "/owner/notifications";
  };

  const getMessagesLink = () => {
    if (profile?.role === "contractor") return "/contractor/messages";
    if (profile?.role === "admin") return "/admin/dashboard";
    return "/owner/messages";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl border bg-card text-foreground hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {title && <h2 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">{title}</h2>}

        {/* Quick Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground w-56 lg:w-72">
          <Search className="h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search projects, tenders, bids..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Messages */}
        <Link
          href={getMessagesLink()}
          className="relative p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
        </Link>

        {/* Notifications */}
        <Link
          href={getNotificationLink()}
          className="relative p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-orange-600 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-background">
              {unreadNotifs > 99 ? "99+" : unreadNotifs}
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}

        {/* User Badge */}
        {profile && (
          <div className="flex items-center gap-2.5 pl-2 border-l">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold text-xs shadow-sm">
              {profile.full_name?.charAt(0) || "U"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-snug">{profile.full_name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground capitalize">{profile.role}</span>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
