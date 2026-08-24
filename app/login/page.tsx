"use client";

import { useState } from "react";
import Link from "next/link";
import { HardHat, LogIn, AlertCircle } from "lucide-react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
            <HardHat className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sign In to NIRMAN</h1>
          <p className="text-xs text-muted-foreground">
            Access your Property Owner, Contractor, or Admin dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="user@example.com"
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-foreground">Password</label>
            </div>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Don't have an account yet?{" "}
          <Link href="/register" className="font-semibold text-orange-600 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
