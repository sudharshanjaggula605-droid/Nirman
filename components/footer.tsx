import Link from "next/link";
import { ShieldCheck, Building2, FileText } from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card text-card-foreground">
      {/* ========================================================================= */}
      {/* MOBILE SIMPLE FOOTER (< md) WITH DEDICATED BACKGROUND COLOR & SAFE BOTTOM PADDING */}
      {/* ========================================================================= */}
      <div className="md:hidden px-4 pt-8 pb-24 text-center space-y-2.5 bg-gradient-to-b from-slate-900 to-black text-white border-t border-slate-800/80 shadow-inner">
        <div className="flex items-center justify-center gap-2 font-bold text-sm">
          <NirmanLogo size="sm" />
          <span className="font-black text-white tracking-tight text-base">NIRMAN</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          &copy; {currentYear} NIRMAN Platform. All rights reserved.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP FULL FOOTER (md+) */}
      {/* ========================================================================= */}
      <div className="hidden md:block container mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <NirmanLogo size="sm" />
              <span className="font-black text-foreground">NIRMAN</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              NIRMAN is India's leading transparent construction tender marketplace, connecting verified property owners directly with licensed construction contractors.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h3>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li><Link href="/" className="hover:text-orange-600 transition-colors">Live Tenders</Link></li>
              <li><Link href="/register?role=owner" className="hover:text-orange-600 transition-colors">Post Construction Tender</Link></li>
              <li><Link href="/register?role=contractor" className="hover:text-orange-600 transition-colors">Contractor Registration</Link></li>
              <li><Link href="/login" className="hover:text-orange-600 transition-colors">User Dashboard Login</Link></li>
            </ul>
          </div>

          {/* Enterprise Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Key Workflows</h3>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Admin Verification</li>
              <li className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-blue-500" /> Transparent Bidding</li>
              <li className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-orange-500" /> Milestone Tracking</li>
            </ul>
          </div>

          {/* Governance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Governance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Built on Supabase PostgreSQL & Next.js App Router for enterprise-grade security and RLS data compliance.
            </p>
            <div className="pt-2 text-xs text-muted-foreground">
              &copy; {currentYear} NIRMAN Platform. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
