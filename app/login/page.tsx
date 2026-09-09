"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { LogIn, AlertCircle, Mail, Lock, RefreshCw } from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";
import { loginAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { sanitizeUserFacingError } from "@/lib/errors";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status")
            .eq("id", user.id)
            .single();

          if (profile?.status === "approved") {
            const role = profile.role?.toLowerCase();
            if (role === "admin") {
              const dest = redirectTo && redirectTo.startsWith("/admin") ? redirectTo : "/admin/dashboard";
              window.location.replace(dest);
              return;
            }
            if (role === "owner") {
              const dest = redirectTo && (redirectTo.startsWith("/owner") || redirectTo.startsWith("/tenders")) ? redirectTo : "/owner/dashboard";
              window.location.replace(dest);
              return;
            }
            if (role === "contractor") {
              const dest = redirectTo && (redirectTo.startsWith("/contractor") || redirectTo.startsWith("/tenders")) ? redirectTo : "/contractor/dashboard";
              window.location.replace(dest);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Session check notice in login:", err);
      }
    }
    checkExistingSession();
  }, [redirectTo]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (redirectTo) {
        formData.set("redirectTo", redirectTo);
      }

      const result = await loginAction(formData);

      if (result?.error) {
        setError(sanitizeUserFacingError(result.error, "Invalid email or password. Please try again."));
        setLoading(false);
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (err: any) {
      if (err.message && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setError(sanitizeUserFacingError(err, "Unable to sign in. Please try again."));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Gradient Mesh Globs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-orange-600/30 to-amber-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-600/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-border/60 bg-card/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <NirmanLogo size="lg" priority className="ring-4 ring-orange-500/10 shadow-lg shadow-orange-500/20" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Sign In to <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">NIRMAN</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              India's Transparent Construction & Tender Platform
            </p>
          </div>
        </div>

        {/* User-Friendly Error Alert */}
        {error && (
          <div className="rounded-2xl bg-destructive/10 p-4 text-xs font-medium text-destructive border border-destructive/20 space-y-2 shadow-inner animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span>Authentication Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-destructive/90">{error}</p>
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  const form = document.querySelector("form");
                  if (form) form.requestSubmit();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/15 hover:bg-destructive/25 text-destructive font-bold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground tracking-wide flex items-center justify-between">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                name="email"
                type="email"
                required
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground tracking-wide flex items-center justify-between">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                name="password"
                type="password"
                required
                value={passwordVal}
                onChange={(e) => setPasswordVal(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Verifying Credentials..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Don't have a NIRMAN account yet?{" "}
          <Link href="/register" className="font-bold text-orange-600 hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading sign in portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
