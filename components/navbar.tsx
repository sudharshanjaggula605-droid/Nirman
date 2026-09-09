"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LogOut,
  LayoutDashboard,
  Moon,
  Sun,
} from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/actions/auth";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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
        console.warn("Navbar loadUser error:", err);
      }
    }
    loadUser();
  }, [pathname]);

  const isLanding = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(false);
  }, [pathname]);

  // Efficient passive scroll listener for navbar background transition on mobile
  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || document.documentElement.scrollTop;
          const scrolled = currentScrollY > 15;
          if (scrolled !== lastScrolled) {
            lastScrolled = scrolled;
            setIsScrolled(scrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await logoutAction();
    } catch {}
    setUser(null);
    setProfile(null);
    window.location.href = "/";
  };


  const getDashboardPath = () => {
    if (!profile) return "/login";
    if (profile.role === "admin") return "/admin/dashboard";
    if (profile.role === "owner") return "/owner/dashboard";
    if (profile.role === "contractor") return "/contractor/dashboard";
    return "/";
  };

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ease-out ${
        isLanding
          ? `fixed md:sticky top-0 inset-x-0 ${
              isScrolled
                ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
                : "bg-transparent border-b border-transparent shadow-none md:bg-background/80 md:backdrop-blur-md md:border-border"
            }`
          : "sticky top-0 border-b border-border bg-background/80 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <NirmanLogo size="sm" priority />
          <span className="text-foreground font-black hidden sm:inline">NIRMAN</span>
          <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hidden sm:inline-flex">
            Tenders
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors hover:text-orange-600 ${
              pathname === "/" ? "text-orange-600 font-semibold" : "text-muted-foreground"
            }`}
          >
            Live Tenders
          </Link>
          <Link
            href="/#how-it-works"
            className="text-muted-foreground transition-colors hover:text-orange-600"
          >
            How It Works
          </Link>
          <Link
            href="/#contact"
            className="text-muted-foreground transition-colors hover:text-orange-600"
          >
            Contact Us
          </Link>

          {user && profile && (
            <Link
              href={getDashboardPath()}
              className="flex items-center gap-1.5 font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Auth Actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border bg-card text-card-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {profile && (
                <div className="flex flex-col text-right text-xs">
                  <span className="font-semibold text-foreground">{profile.full_name}</span>
                  <span className="text-muted-foreground capitalize">{profile.role}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md border border-destructive/20 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent rounded-md border transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-md shadow-sm shadow-orange-700/30 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Actions (Theme Toggle Only - Navigation is handled by Fixed Bottom Bar) */}
        <div className="flex md:hidden items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLanding && !isScrolled
                  ? "bg-black/35 backdrop-blur-md border-white/20 text-white hover:bg-black/50"
                  : "bg-card text-card-foreground border-border hover:bg-accent"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
