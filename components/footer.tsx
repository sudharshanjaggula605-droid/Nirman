import Link from "next/link";
import { HardHat, ShieldCheck, Building2, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
                <HardHat className="h-4 w-4" />
              </div>
              <span>NIRMAN</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              NIRMAN is India's leading transparent construction tender marketplace, connecting verified property owners directly with licensed construction contractors.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/" className="hover:text-orange-600">Live Tenders</Link></li>
              <li><Link href="/register?role=owner" className="hover:text-orange-600">Post Construction Tender</Link></li>
              <li><Link href="/register?role=contractor" className="hover:text-orange-600">Contractor Registration</Link></li>
              <li><Link href="/login" className="hover:text-orange-600">User Dashboard Login</Link></li>
            </ul>
          </div>

          {/* Enterprise Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Key Workflows</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Admin Verification</li>
              <li className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-blue-500" /> Transparent Bidding</li>
              <li className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-orange-500" /> Milestone Tracking</li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Governance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Built on Supabase PostgreSQL & Next.js App Router for enterprise-grade security and RLS data compliance.
            </p>
            <div className="pt-2 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} NIRMAN Platform. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
