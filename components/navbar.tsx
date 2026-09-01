"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HardHat, LogOut, LayoutDashboard, User, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md shadow-orange-600/30">
            <HardHat className="h-5 w-5" />
          </div>
          <span className="text-foreground">NIRMAN</span>
          <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
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

        {/* User Auth Actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border bg-card text-card-foreground hover:bg-accent transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md border border-destructive/20 transition-colors"
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

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border bg-card text-card-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border text-foreground"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 hover:text-orange-600"
          >
            Live Tenders
          </Link>
          {user && profile && (
            <Link
              href={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-orange-600 py-2"
            >
              Dashboard ({profile.role})
            </Link>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full text-left text-sm font-medium text-destructive py-2"
            >
              Sign Out
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold border rounded-md"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-bold bg-orange-700 hover:bg-orange-800 text-white rounded-md shadow-sm shadow-orange-700/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
