import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

export default function AccountBlockedPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 mx-auto">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Account Suspended
          </h1>
          <p className="text-sm font-semibold text-destructive">
            Your access to NIRMAN has been suspended by administration.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed pt-2">
            Access to tender creation, bidding, and project management features has been disabled for this account. If you believe this is in error, please contact NIRMAN compliance.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
