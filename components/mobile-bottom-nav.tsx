"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  PlusCircle,
  Search,
  MoreHorizontal,
  X,
  HardHat,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  FileText,
  HelpCircle,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    async function loadUser() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);
        if (currentUser) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();
          setProfile(userProfile);
        }
      } catch (err) {
        console.warn("MobileBottomNav loadUser error:", err);
      }
    }
    loadUser();
  }, [pathname]);

  // Lock body scroll and handle ESC key when More sheet is open
  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMoreOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [moreOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMoreOpen(false);
    router.push("/login");
    router.refresh();
  };

  const getDashboardPath = () => {
    if (!profile) return "/login";
    if (profile.role === "admin") return "/admin/dashboard";
    if (profile.role === "owner") return "/owner/dashboard";
    if (profile.role === "contractor") return "/contractor/dashboard";
    return "/";
  };

  // Determine dynamic link targets based on user role
  const postProjectHref =
    user && profile?.role === "owner"
      ? "/owner/projects/new"
      : "/register?role=owner";

  const exploreTendersHref = "/tenders";

  const isHomeActive = pathname === "/" && !moreOpen;
  const isPostProjectActive =
    (pathname.startsWith("/owner/projects/new") ||
      (pathname === "/register" && postProjectHref.includes("/register"))) &&
    !moreOpen;
  const isExploreActive = pathname.startsWith("/tenders") && !moreOpen;

  return (
    <>
      {/* ========================================================================= */}
      {/* "MORE" POPUP SHEET (SLIDES UP DIRECTLY FROM THE BOTTOM NAVBAR) */}
      {/* ========================================================================= */}
      <div
        className={`fixed inset-0 z-[99998] md:hidden transition-all duration-300 ${
          moreOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
      >
        {/* Dark & Blurred Backdrop Overlay */}
        <div
          onClick={() => setMoreOpen(false)}
          className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
            moreOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Floating Menu Card Anchored Directly Above the Bottom Navbar */}
        <div
          className={`fixed inset-x-2.5 bottom-20 z-[99999] max-h-[75vh] rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl overflow-y-auto p-5 space-y-4 transition-all duration-300 ease-out transform ${
            moreOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-95"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 font-bold text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
                <HardHat className="h-4 w-4" />
              </div>
              <span className="text-foreground font-black tracking-tight">NIRMAN Menu</span>
            </div>

            <div className="flex items-center gap-1.5">
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-xl border bg-muted/40 text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-xl border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* User Profile Banner (if logged in) */}
          {user && profile && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                  {profile.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground truncate max-w-[120px]">
                    {profile.full_name}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {profile.role} Account
                  </div>
                </div>
              </div>

              <Link
                href={getDashboardPath()}
                onClick={() => setMoreOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-500/20 px-2.5 py-1 rounded-xl border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
              >
                <LayoutDashboard className="h-3 w-3" /> Dashboard
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMoreOpen(false)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${
                pathname === "/"
                  ? "bg-orange-600 text-white font-bold shadow-sm shadow-orange-600/30"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-semibold">Live Tenders Marketplace</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-60" />
            </Link>

            <Link
              href="/#how-it-works"
              onClick={() => setMoreOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4" />
                <span className="text-xs font-semibold">How NIRMAN Works</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-40" />
            </Link>

            <Link
              href="/#contact"
              onClick={() => setMoreOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-semibold">Contact & Support</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 opacity-40" />
            </Link>
          </div>

          {/* Auth Action Buttons */}
          <div className="pt-2 border-t space-y-2">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out Account
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMoreOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold border rounded-xl bg-card hover:bg-accent text-foreground transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMoreOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm shadow-orange-600/30 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FIXED ALWAYS-VISIBLE BOTTOM NAVIGATION BAR (MOBILE VIEW) */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-[100001] md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all"
      >
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-1.5 items-center">
          {/* 1. Home Option */}
          <Link
            href="/"
            onClick={() => setMoreOpen(false)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors duration-150 ${
              isHomeActive
                ? "text-orange-600"
                : "text-muted-foreground"
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-150 ${isHomeActive ? "bg-orange-500/15" : ""}`}>
              <Home className="h-[22px] w-[22px]" strokeWidth={isHomeActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10.5px] tracking-tight font-medium ${isHomeActive ? "font-semibold" : ""}`}>Home</span>
          </Link>

          {/* 2. Post a Project Option */}
          <Link
            href={postProjectHref}
            onClick={() => setMoreOpen(false)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors duration-150 ${
              isPostProjectActive
                ? "text-orange-600"
                : "text-muted-foreground"
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-150 ${isPostProjectActive ? "bg-orange-500/15" : ""}`}>
              <PlusCircle className="h-[22px] w-[22px]" strokeWidth={isPostProjectActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10.5px] tracking-tight font-medium truncate max-w-[72px] ${isPostProjectActive ? "font-semibold" : ""}`}>
              Post Project
            </span>
          </Link>

          {/* 3. Explore Tenders Option */}
          <Link
            href={exploreTendersHref}
            onClick={() => setMoreOpen(false)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors duration-150 ${
              isExploreActive
                ? "text-orange-600"
                : "text-muted-foreground"
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-150 ${isExploreActive ? "bg-orange-500/15" : ""}`}>
              <Search className="h-[22px] w-[22px]" strokeWidth={isExploreActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10.5px] tracking-tight font-medium ${isExploreActive ? "font-semibold" : ""}`}>
              Explore
            </span>
          </Link>

          {/* 4. More Option */}
          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors duration-150 cursor-pointer ${
              moreOpen
                ? "text-orange-600"
                : "text-muted-foreground"
            }`}
            aria-label="More navigation options"
            aria-expanded={moreOpen}
          >
            <div className={`p-1 rounded-full transition-all duration-150 ${moreOpen ? "bg-orange-500/15" : ""}`}>
              <MoreHorizontal className="h-[22px] w-[22px]" strokeWidth={moreOpen ? 2.5 : 2} />
            </div>
            <span className={`text-[10.5px] tracking-tight font-medium ${moreOpen ? "font-semibold" : ""}`}>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
