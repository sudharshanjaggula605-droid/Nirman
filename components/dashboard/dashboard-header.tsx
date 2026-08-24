"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, MessageSquare, Menu, Sun, Moon, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
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
  const [unreadNotifs, setUnreadNotifs] = useState(3);
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
      }
    }
    loadUser();
  }, []);

  const getStatusBadge = () => {
    if (!profile) return null;
    if (profile.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock className="h-3 w-3" /> Pending Review
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg border bg-card text-foreground hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {title && <h2 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">{title}</h2>}

        {/* Universal Quick Search Bar */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground w-64 lg:w-80">
          <Search className="h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search projects, tenders, bids..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Messages Shortcut */}
        <Link
          href={profile?.role === "contractor" ? "/contractor/messages" : profile?.role === "owner" ? "/owner/messages" : "/admin/dashboard"}
          className="relative p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
        </Link>

        {/* Notifications Shortcut */}
        <Link
          href={profile?.role === "contractor" ? "/contractor/notifications" : profile?.role === "owner" ? "/owner/notifications" : "/admin/notifications"}
          className="relative p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[9px] font-bold text-white shadow-sm">
              {unreadNotifs}
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

        {/* User Profile Badge */}
        {profile && (
          <div className="flex items-center gap-2.5 pl-2 border-l">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-xs shadow-md">
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
