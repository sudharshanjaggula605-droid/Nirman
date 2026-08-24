import Link from "next/link";
import { Users, ShieldCheck, Building2, FileText, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { count: pendingOwnersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "owner")
    .eq("status", "pending");

  const { count: pendingContractorsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "contractor")
    .eq("status", "pending");

  const { count: activeTendersCount } = await supabase
    .from("tenders")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalOwnersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "owner");

  const { count: totalContractorsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "contractor");

  const totalPending = (pendingOwnersCount || 0) + (pendingContractorsCount || 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">NIRMAN Admin Governance Panel</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Platform user verification, tender moderation, and system monitoring.
          </p>
        </div>

        <Link
          href="/admin/approvals"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-amber-700 transition-colors"
        >
          <ShieldCheck className="h-4 w-4" /> Review Pending Approvals ({totalPending})
        </Link>
      </div>

      {/* Admin KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Pending Approvals</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{totalPending}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Property Owners</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalOwnersCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Contractors</span>
            <Building2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalContractorsCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Active Tenders</span>
            <FileText className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{activeTendersCount || 0}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h3 className="font-bold text-base text-foreground">Admin Portal Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/approvals"
            className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-accent transition-colors"
          >
            <span className="text-xs font-bold text-foreground">User Approvals Portal</span>
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
          </Link>
          <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
            <span className="text-xs font-bold text-muted-foreground">Audit Logs & Actions</span>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
            <span className="text-xs font-bold text-muted-foreground">System Security (RLS)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
