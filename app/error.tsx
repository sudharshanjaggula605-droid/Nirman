"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("NIRMAN Application Error:", error);

    // Auto-recover from stale deployment ChunkLoadErrors
    if (
      error?.message &&
      (error.message.includes("Loading chunk") ||
        error.message.includes("ChunkLoadError") ||
        error.message.includes("Failed to fetch dynamic module"))
    ) {
      const hasReloaded = sessionStorage.getItem("nirman_chunk_reloaded");
      if (!hasReloaded) {
        sessionStorage.setItem("nirman_chunk_reloaded", "true");
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full rounded-3xl border border-border p-8 text-center space-y-6 shadow-2xl bg-card">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold tracking-tight">Something Went Wrong</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We couldn't load this section properly. Please try again or return to the main dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sessionStorage.removeItem("nirman_chunk_reloaded");
              reset();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition-all"
          >
            <Home className="h-4 w-4" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
