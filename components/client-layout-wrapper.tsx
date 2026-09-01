"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LanguageProvider } from "@/lib/i18n/language-context";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          <main className="flex-1">{children}</main>
          <Footer />
        </>
      )}
    </LanguageProvider>
  );
}

