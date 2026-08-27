import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border p-8 text-center space-y-6 shadow-2xl bg-card">
        <div className="h-14 w-14 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto border border-orange-500/20">
          <FileQuestion className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold tracking-tight">404 - Page Not Found</h1>
          <p className="text-xs text-muted-foreground">
            The requested NIRMAN page could not be found or has moved.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition-all"
          >
            <Home className="h-4 w-4" /> Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
