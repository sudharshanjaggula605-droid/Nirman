"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Home, Loader2 } from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    console.error("NIRMAN Global Root Error:", error);

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
      const hasReloaded = sessionStorage.getItem("nirman_chunk_reloaded_global");
      if (!hasReloaded) {
        sessionStorage.setItem("nirman_chunk_reloaded_global", "true");
        setIsRecovering(true);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    }
  }, [error]);

  const handleHardReset = () => {
    sessionStorage.removeItem("nirman_chunk_reloaded_global");
    sessionStorage.removeItem("nirman_chunk_reloaded");
    window.location.reload();
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 antialiased font-sans">
        <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center space-y-6 shadow-2xl">
          <div className="flex justify-center">
            <NirmanLogo size="md" />
          </div>
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            {isRecovering ? (
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            ) : (
              <AlertTriangle className="h-8 w-8" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isRecovering ? "Refreshing Session..." : "Application Error"}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRecovering
                ? "Updating to the latest version of the app. Please wait a moment..."
                : "We encountered an issue loading this view. Please refresh or retry to restore your session."}
            </p>
          </div>

          {!isRecovering && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleHardReset}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>

              <button
                onClick={() => {
                  sessionStorage.removeItem("nirman_chunk_reloaded_global");
                  window.location.href = "/";
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                <Home className="h-4 w-4" /> Home
              </button>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
