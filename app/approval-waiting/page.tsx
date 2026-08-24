import Link from "next/link";
import { Clock, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ApprovalWaitingPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Application Under Review</h1>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-500/20">
            <ShieldCheck className="h-3.5 w-3.5" /> Status: Pending Admin Approval
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Your registration has been submitted successfully. Your account is currently waiting for administrator approval.
        </p>

        <div className="rounded-xl bg-muted p-4 text-xs text-muted-foreground space-y-1 text-left">
          <div className="font-semibold text-foreground">What happens next?</div>
          <p>Our platform administrators verify company credentials and GST/license documentation. You will receive an automated notification once approved.</p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Home Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
