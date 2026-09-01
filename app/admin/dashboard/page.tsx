"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  UserCheck,
  Clock,
  Building2,
  FileText,
  Gavel,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  ShieldAlert,
  BarChart3,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTimeBasedGreeting } from "@/lib/utils";
import { getAdminDashboardStatsAction, type AdminDashboardStats } from "@/actions/admin";

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalOwners: 0,
    totalContractors: 0,
    pendingOwners: 0,
    pendingContractors: 0,
    activeTenders: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBids: 0,
    supportTotal: 0,
    supportOpen: 0,
    supportUnderReview: 0,
    supportResolved: 0,
  });

  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    async function loadAdminData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: myProf } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (myProf) setProfile(myProf);
        }

        const res = await getAdminDashboardStatsAction();
        if (res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error("Error loading admin live stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const greetingText = mounted
    ? getTimeBasedGreeting(profile?.full_name, "Admin Console")
    : "Platform Admin Console";

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-slate-100">
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
              Real-time platform health metrics, pending user verification approvals, and active tender monitoring.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-0 shrink-0">
            <Link
              href="/admin/owners"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 transition-all text-center"
            >
              <UserCheck className="h-4 w-4" /> Review Applications
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards (8 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Owners */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold truncate">Total Owners</span>
            <Users className="h-4 w-4 text-blue-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.totalOwners}
          </div>
        </div>

        {/* Total Contractors */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold truncate">Total Contractors</span>
            <UserCheck className="h-4 w-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.totalContractors}
          </div>
        </div>

        {/* Pending Owners */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold truncate">Pending Owners</span>
            <Clock className="h-4 w-4 text-rose-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-400">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.pendingOwners}
          </div>
        </div>

        {/* Pending Contractors */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold truncate">Pending Contractors</span>
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.pendingContractors}
          </div>
        </div>

        {/* Active Tenders */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold truncate">Active Tenders</span>
            <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.activeTenders}
          </div>
        </div>

        {/* Active Projects */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold truncate">Active Projects</span>
            <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-400">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.activeProjects}
          </div>
        </div>

        {/* Completed Projects */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold truncate">Completed Projects</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-400">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.completedProjects}
          </div>
        </div>

        {/* Support Requests Card */}
        <Link
          href="/admin/support"
          className="col-span-2 sm:col-span-2 lg:col-span-1 rounded-2xl border border-amber-500/30 bg-slate-900 p-3.5 sm:p-4 space-y-2 shadow-sm hover:border-amber-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
              Support Requests
            </span>
            <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stats.supportTotal}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-[11px] font-semibold">
              <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                Open: {stats.supportOpen}
              </span>
              <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                Review: {stats.supportUnderReview}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Resolved: {stats.supportResolved}
              </span>
            </div>
          </div>
        </Link>
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
            href="/admin/support"
            className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span>Support Requests</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/owners"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>Owner Approvals</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/contractors"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-4 w-4 text-amber-400" />
              <span>Contractor Approvals</span>
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
            href="/admin/projects"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span>View Projects</span>
            </div>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
