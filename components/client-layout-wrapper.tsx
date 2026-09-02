"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { LanguageProvider } from "@/lib/i18n/language-context";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

  return (
    <LanguageProvider>
      {isDashboardRoute ? (
        children
      ) : (
        <>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </LanguageProvider>
  );
}
