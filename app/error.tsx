"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Loader2 } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    console.error("NIRMAN Application Error:", error);

    // Auto-recover from stale deployment chunk errors
    const errorText = `${error?.message || ""} ${error?.digest || ""} ${error?.name || ""}`.toLowerCase();
    const isChunkIssue =
      errorText.includes("loading chunk") ||
      errorText.includes("chunkloaderror") ||
      errorText.includes("dynamically imported module") ||
      errorText.includes("importing a module script failed") ||
      errorText.includes("failed to fetch dynamic module") ||
      errorText.includes("load failed");

    if (isChunkIssue) {
      const hasReloaded = sessionStorage.getItem("nirman_chunk_reloaded");
      if (!hasReloaded) {
        sessionStorage.setItem("nirman_chunk_reloaded", "true");
        setIsRecovering(true);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    }
  }, [error]);

  const handleHardReset = () => {
    sessionStorage.removeItem("nirman_chunk_reloaded");
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full rounded-3xl border border-border p-8 text-center space-y-6 shadow-2xl bg-card">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          {isRecovering ? (
            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
          ) : (
            <AlertTriangle className="h-7 w-7" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            {isRecovering ? "Refreshing Session..." : "Something Went Wrong"}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isRecovering
              ? "Updating to the latest version of the app. Please wait a moment..."
              : "We couldn't load this section properly. Please try again or return to the main dashboard."}
          </p>
        </div>

        {!isRecovering && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleHardReset}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>

            <Link
              href="/"
              onClick={() => sessionStorage.removeItem("nirman_chunk_reloaded")}
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition-all"
            >
              <Home className="h-4 w-4" /> Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
