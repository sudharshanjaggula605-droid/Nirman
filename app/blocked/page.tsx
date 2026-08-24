import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function BlockedPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Account Blocked</h1>
          <p className="text-sm text-destructive font-semibold">Your account has been suspended by system administrators.</p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Access to NIRMAN platform features has been restricted for compliance reasons.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
