"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-background text-foreground min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border p-8 text-center space-y-6 shadow-2xl bg-card">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight">Something Went Wrong</h1>
            <p className="text-xs text-muted-foreground">
              An unhandled application exception occurred. You can retry the action or return to home.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition-all"
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
      </body>
    </html>
  );
}
