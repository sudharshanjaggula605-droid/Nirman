import Link from "next/link";
import { XCircle, HardHat, ArrowLeft } from "lucide-react";

export default function AccountRejectedPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 mx-auto">
          <XCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Application Not Approved
          </h1>
          <p className="text-sm font-semibold text-destructive">
            Your account application was reviewed and not approved by administration.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed pt-2">
            If you believe this is an error or wish to re-submit your registration details, please contact platform support or re-register with verified company documents.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition-colors"
          >
            <HardHat className="h-4 w-4" /> Re-register Account
          </Link>
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
