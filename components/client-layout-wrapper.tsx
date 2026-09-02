"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SplashScreen } from "@/components/splash-screen";
import { LanguageProvider } from "@/lib/i18n/language-context";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine if splash should play:
  // On root "/", initial state is "playing" UNLESS already shown in this session.
  const [splashState, setSplashState] = useState<"playing" | "done">(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname !== "/") {
        return "done";
      }
      try {
        const alreadyShown = sessionStorage.getItem("nirman_splash_shown");
        if (alreadyShown === "true") {
          return "done";
        }
      } catch {
        // Fallback for strict browser settings
      }
      return "playing";
    }
    // SSR: if route is "/", render splash initially so Landing Page never flashes in HTML
    return pathname === "/" ? "playing" : "done";
  });

  // Ensure client-side navigation respects session flag
  useEffect(() => {
    if (pathname === "/") {
      try {
        const alreadyShown = sessionStorage.getItem("nirman_splash_shown");
        if (alreadyShown === "true") {
          setSplashState("done");
        }
      } catch {
        // Fallback
      }
    } else {
      setSplashState("done");
    }
  }, [pathname]);

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem("nirman_splash_shown", "true");
    } catch {
      // Fallback
    }
    setSplashState("done");
  };

  // Automatic recovery from stale deployment chunks when navigating
  useEffect(() => {
    const isChunkError = (msg?: string) => {
      if (!msg) return false;
      const lower = msg.toLowerCase();
      return (
        lower.includes("loading chunk") ||
        lower.includes("chunkloaderror") ||
        lower.includes("dynamically imported module") ||
        lower.includes("importing a module script failed") ||
        lower.includes("failed to fetch dynamic module") ||
        lower.includes("load failed")
      );
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (isChunkError(event.message) || isChunkError(event.error?.message)) {
        console.warn("Detected stale chunk on navigation, reloading to fetch latest deployment...");
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = typeof reason === "string" ? reason : reason?.message;
      if (isChunkError(msg)) {
        console.warn("Detected unhandled chunk rejection on navigation, reloading...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Identify authenticated dashboard routes
  const isDashboardRoute =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/contractor") ||
    pathname.startsWith("/admin");

  // CRITICAL REQUIREMENT:
  // If splash is playing on "/", render ONLY the SplashScreen.
  // The Landing Page (and Navbar, Footer, MobileBottomNav) remains completely unmounted.
  if (splashState === "playing" && pathname === "/") {
    return (
      <LanguageProvider>
        <SplashScreen onComplete={handleSplashComplete} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      {isDashboardRoute ? (
        children
      ) : (
        <div className="flex flex-col min-h-screen animate-nirman-page-in">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </div>
      )}
    </LanguageProvider>
  );
}
