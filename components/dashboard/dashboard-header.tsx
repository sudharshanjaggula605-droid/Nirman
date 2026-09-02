"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  Globe,
  User,
  LogOut,
  ChevronDown,
  Building2,
  FileText,
  Gavel,
  HardHat,
  Folder,
  X,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { getUnreadMessageCountAction } from "@/actions/messages";
import { getUnreadNotificationCountAction } from "@/actions/notifications";
import { useLanguage } from "@/lib/i18n/language-context";
import { dashboardSearchAction, type SearchResult } from "@/actions/search";
import { LogoutModal } from "@/components/dashboard/logout-modal";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

const RESULT_TYPE_ICONS: Record<string, any> = {
  tender: FileText,
  project: Building2,
  bid: Gavel,
  contractor: HardHat,
  document: Folder,
  message: MessageSquare,
};

const BADGE_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export function DashboardHeader({ onMenuToggle, title }: DashboardHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchFocused(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Debounced real search
  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const { results } = await dashboardSearchAction(q);
      setSearchResults(results);
      setSearchOpen(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (val.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(() => performSearch(val), 400);
  };

  const handleSearchResultClick = (href: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(href);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    searchInputRef.current?.focus();
  };

  // Live Unread Notification Count (Realtime postgres_changes + 30s backup interval)
  useEffect(() => {
    async function updateUnreadNotifCount() {
      try {
        const res = await getUnreadNotificationCountAction();
        setUnreadNotifs(res.count || 0);
      } catch {}
    }
    updateUnreadNotifCount();
    const interval = setInterval(updateUnreadNotifCount, 30000);
    const channel = supabase
      .channel("header_notif_unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, updateUnreadNotifCount)
      .subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Live Unread Chat Count (Realtime postgres_changes + window events + 30s backup interval)
  useEffect(() => {
    async function updateUnreadChatCount() {
      try {
        const res = await getUnreadMessageCountAction();
        setUnreadChatCount(res.count || 0);
      } catch {}
    }
    updateUnreadChatCount();
    const handleReadEvent = () => updateUnreadChatCount();
    window.addEventListener("chat_read_updated", handleReadEvent);
    const interval = setInterval(updateUnreadChatCount, 30000);
    const channel = supabase
      .channel("header_chat_unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, updateUnreadChatCount)
      .subscribe();
    return () => {
      window.removeEventListener("chat_read_updated", handleReadEvent);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOutClick = () => {
    setUserDropdownOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getStatusBadge = () => {
    if (!profile) return null;
    if (profile.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> {t("badge.approved", "Approved")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock className="h-3 w-3" /> {t("badge.pending", "Pending")}
      </span>
    );
  };

  const getProfileLink = () => {
    if (profile?.role === "contractor") return "/contractor/profile";
    if (profile?.role === "admin") return "/admin/profile";
    return "/owner/profile";
  };

  const getNotificationLink = () => {
    if (profile?.role === "contractor") return "/contractor/notifications";
    if (profile?.role === "admin") return "/admin/notifications";
    return "/owner/notifications";
  };

  const getMessagesLink = () => {
    if (profile?.role === "contractor") return "/contractor/messages";
    if (profile?.role === "admin") return "/admin/messages";
    return "/owner/messages";
  };

  const showSearchDropdown = searchFocused && (searchLoading || searchResults.length > 0 || (searchQuery.trim().length >= 2 && !searchLoading));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/90 px-3 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl border bg-card text-foreground hover:bg-accent shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {title && (
          <h2 className="font-extrabold text-xs sm:text-base lg:text-lg text-foreground tracking-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
            {title.includes("Owner") ? t("portal.owner", title) : title.includes("Contractor") ? t("portal.contractor", title) : title}
          </h2>
        )}

        {/* Real Search Bar */}
        <div className="relative hidden lg:block" ref={searchRef}>
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs w-56 lg:w-80 transition-all duration-200 ${
              searchFocused
                ? "bg-background border-orange-500/60 shadow-sm ring-1 ring-orange-500/20"
                : "bg-muted/40 border-border"
            }`}
          >
            {searchLoading ? (
              <Loader2 className="h-3.5 w-3.5 text-orange-500 animate-spin shrink-0" />
            ) : (
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                setSearchFocused(true);
                if (searchResults.length > 0) setSearchOpen(true);
              }}
              placeholder={t("header.search_placeholder", "Search tenders, projects, bids...")}
              aria-label="Search dashboard"
              autoComplete="off"
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 top-full mt-2 w-[360px] lg:w-[480px] rounded-2xl border bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Loading state */}
              {searchLoading && (
                <div className="flex items-center gap-3 px-4 py-4 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  Searching across your dashboard data...
                </div>
              )}

              {/* Results */}
              {!searchLoading && searchResults.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
                  </div>
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
                    {searchResults.map((result) => {
                      const Icon = RESULT_TYPE_ICONS[result.type] || FileText;
                      const badgeClass = BADGE_COLORS[result.badgeColor || "slate"];
                      return (
                        <button
                          key={`${result.type}:${result.id}`}
                          onClick={() => handleSearchResultClick(result.href)}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/60 transition-colors group"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0 mt-0.5 group-hover:bg-orange-500/20 transition-colors">
                            <Icon className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                                {result.title}
                              </span>
                              {result.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeClass} uppercase shrink-0`}>
                                  {result.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {result.subtitle}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 capitalize shrink-0 pt-0.5">
                            {result.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No results */}
              {!searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground">No results found</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    No matches for &quot;{searchQuery}&quot; in your dashboard data.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

        {/* Messages */}
        <Link
          href={getMessagesLink()}
          className="relative p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={t("header.direct_messages", "Direct User Messages & Chat")}
          aria-label={t("header.direct_messages", "Direct User Messages & Chat")}
        >
          <MessageSquare className="h-4 w-4" />
        </Link>

        {/* Notifications */}
        <Link
          href={getNotificationLink()}
          className="relative p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={t("header.notifications", "Notifications")}
          aria-label={t("header.notifications", "Notifications")}
        >
          <Bell className="h-4 w-4" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] sm:h-5 sm:min-w-[20px] px-1 items-center justify-center rounded-full bg-orange-700 text-[9px] sm:text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-background">
              {unreadNotifs > 99 ? "99+" : unreadNotifs}
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={t("header.toggle_theme", "Toggle Theme")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        )}

        {/* User Badge with Interactive Dropdown */}
        {profile && (
          <div className="relative pl-1 sm:pl-2 border-l" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2.5 rounded-xl p-1 sm:px-2 hover:bg-accent/70 transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
              aria-label="User account menu"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold text-xs shadow-sm shrink-0 ring-1 ring-white/20">
                {profile.full_name?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-foreground leading-snug">{profile.full_name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground capitalize">
                    {profile.role === "owner" ? t("badge.owner", "Owner") : profile.role === "contractor" ? t("badge.contractor", "Contractor") : profile.role}
                  </span>
                  {getStatusBadge()}
                </div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground hidden sm:block transition-transform duration-200 ${userDropdownOpen ? "rotate-180 text-orange-600" : ""}`} />
            </button>

            {/* Dropdown Menu Popover */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl border bg-card p-2 text-foreground shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header in Popover */}
                <div className="p-3 border-b mb-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold text-sm shadow-sm shrink-0">
                      {profile.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-extrabold text-sm text-foreground truncate">{profile.full_name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{user?.email || profile.email}</div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-dashed">
                    <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {profile.role === "owner" ? t("badge.owner", "Owner") : profile.role === "contractor" ? t("badge.contractor", "Contractor") : profile.role}
                    </span>
                    {getStatusBadge()}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1 py-1">
                  <Link
                    href={getProfileLink()}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4 text-orange-600" />
                    <span>{t("nav.profile", "Profile")}</span>
                  </Link>
                </div>

                {/* Sign Out / Logout */}
                <div className="pt-1 mt-1 border-t">
                  <button
                    type="button"
                    onClick={handleSignOutClick}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-destructive" />
                    <span>{t("nav.logout", "Sign Out / Logout")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
      />
    </header>
  );
}
