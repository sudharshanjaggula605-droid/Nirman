import Link from "next/link";
import {
  Shield,
  Users,
  UserCheck,
  Clock,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Layers,
  Award,
  CreditCard,
  Gavel,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTimeBasedGreeting } from "@/lib/utils";
import { getAdminDashboardStatsAction, type AdminDashboardStats } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let adminName = "Admin";
  if (user) {
    const { data: myProf } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (myProf?.full_name) adminName = myProf.full_name;
  }

  const res = await getAdminDashboardStatsAction();
  const stats: AdminDashboardStats = res.stats || {
    totalOwners: 0,
    totalContractors: 0,
    pendingOwners: 0,
    pendingContractors: 0,
    totalTenders: 0,
    openTenders: 0,
    activeTenders: 0,
    closedAwardedTenders: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBids: 0,
    acceptedBids: 0,
    rejectedBids: 0,
    totalConnections: 0,
    supportTotal: 0,
    supportOpen: 0,
    supportUnderReview: 0,
    supportResolved: 0,
  };

  const greetingText = getTimeBasedGreeting(adminName, "Admin Console");

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-slate-100 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Shield className="h-3.5 w-3.5" /> Platform Governance Console
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greetingText}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              Real-time platform health metrics, tender marketplace activity, and Owner ↔ Contractor connections.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-0 shrink-0">
            <Link
              href="/admin/connections"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-600/30 hover:bg-amber-500 transition-all text-center"
            >
              <Award className="h-4 w-4" /> Bid Awards & Connections
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Section: Tender & Bid Ecosystem Metrics */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Gavel className="h-3.5 w-3.5 text-amber-400" /> Tenders, Bids & Awarded Connections
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Tenders */}
          <Link
            href="/admin/tenders"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-1.5 shadow-sm hover:border-slate-700 transition-colors group block"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold truncate group-hover:text-slate-200">Total Tenders</span>
              <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">{stats.totalTenders}</div>
            <div className="text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold">{stats.openTenders} Open</span> • {stats.closedAwardedTenders} Awarded
            </div>
          </Link>

          {/* Total Bids */}
          <Link
            href="/admin/bids"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-1.5 shadow-sm hover:border-slate-700 transition-colors group block"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold truncate group-hover:text-slate-200">Total Bids</span>
              <Gavel className="h-4 w-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">{stats.totalBids}</div>
            <div className="text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold">{stats.acceptedBids} Accepted</span> • {stats.rejectedBids} Rejected
            </div>
          </Link>

          {/* Owner-Contractor Connections */}
          <Link
            href="/admin/connections"
            className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/20 p-4 space-y-1.5 shadow-sm hover:border-amber-500/60 transition-all group block"
          >
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold truncate">Connections Formed</span>
              <Award className="h-4 w-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">{stats.totalConnections}</div>
            <div className="text-[11px] text-amber-300 font-medium">Owner ↔ Contractor pairings</div>
          </Link>

          {/* Active Projects */}
          <Link
            href="/admin/projects"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-1.5 shadow-sm hover:border-purple-500/40 transition-colors group block"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold truncate group-hover:text-purple-300">Active Projects</span>
              <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-400">{stats.activeProjects}</div>
            <div className="text-[11px] text-slate-400">{stats.completedProjects} Completed Projects</div>
          </Link>
        </div>
      </div>

      {/* Secondary Section: User & Account Health */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-blue-400" /> User Accounts & Platform Governance
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Owners */}
          <Link
            href="/admin/owners"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm hover:border-slate-700 transition-colors group block"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold truncate group-hover:text-slate-200">Total Owners</span>
              <Users className="h-4 w-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">{stats.totalOwners}</div>
            <div className="text-[11px] text-slate-400">{stats.pendingOwners} Pending Approvals</div>
          </Link>

          {/* Total Contractors */}
          <Link
            href="/admin/contractors"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm hover:border-slate-700 transition-colors group block"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold truncate group-hover:text-slate-200">Total Contractors</span>
              <UserCheck className="h-4 w-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">{stats.totalContractors}</div>
            <div className="text-[11px] text-slate-400">{stats.pendingContractors} Pending Approvals</div>
          </Link>

          {/* Support Requests */}
          <Link
            href="/admin/support"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm hover:border-amber-500/40 transition-colors group block"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold truncate group-hover:text-amber-300">Support Requests</span>
              <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">{stats.supportTotal}</div>
            <div className="text-[11px] text-slate-400">
              <span className="text-amber-400 font-bold">{stats.supportOpen} Open</span> • {stats.supportResolved} Resolved
            </div>
          </Link>

          {/* Payments & Fees */}
          <Link
            href="/admin/payments"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-1.5 shadow-sm hover:border-emerald-500/40 transition-colors group block"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold truncate group-hover:text-emerald-300">Selection Fees</span>
              <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">₹199 / Award</div>
            <div className="text-[11px] text-slate-400">Razorpay + Static UPI QR</div>
          </Link>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-amber-400" /> Admin Quick Governance Actions
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <Link
            href="/admin/connections"
            className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Bid Awards & Connections</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/payments"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>Payments & Reconciliation</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/tenders"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Active Tenders</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/bids"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Gavel className="h-4 w-4 text-amber-400" />
              <span>Bids Monitoring</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/support"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span>Support Requests</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
