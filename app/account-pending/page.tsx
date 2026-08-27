"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, ArrowLeft, ShieldAlert } from "lucide-react";

function AccountPendingContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "owner";

  const isContractor = role === "contractor";

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-border/60 bg-card/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mx-auto">
          <CheckCircle2 className="h-9 w-9 text-emerald-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isContractor ? "Application Submitted ✓" : "Registration Successful ✓"}
          </h1>

          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isContractor
              ? "Your NIRMAN contractor account has been submitted successfully."
              : "Your NIRMAN Owner account has been created successfully."}
          </p>

          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {isContractor
              ? "Our admin team will review your business information and documents."
              : "Your account is currently waiting for administrator approval."}
          </p>

          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {isContractor
              ? "You will receive access after your account is approved."
              : "You will be able to access your Owner Dashboard after approval."}
          </p>
        </div>

        <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs space-y-2 text-left">
          <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" /> Status: PENDING
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            NIRMAN platform administrators verify every Property Owner and Contractor before enabling marketplace access to maintain authentic bids and project security.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountPendingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-16 text-center text-sm text-muted-foreground">Loading pending status...</div>}>
      <AccountPendingContent />
    </Suspense>
  );
}
