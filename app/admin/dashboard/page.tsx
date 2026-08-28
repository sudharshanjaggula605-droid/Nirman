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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTimeBasedGreeting } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
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
    async function loadAdminData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: myProf } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          setProfile(myProf);
        }

        const { data: profiles } = await supabase.from("profiles").select("*");
        const { count: tendersCount } = await supabase.from("tenders").select("*", { count: "exact", head: true }).eq("status", "active");
        const { count: activeProjCount } = await supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active");
        const { count: completedProjCount } = await supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed");
        const { count: bidsCount } = await supabase.from("bids").select("*", { count: "exact", head: true });
        
        // Fetch Support Requests statistics
        const { data: supportReqs } = await supabase.from("support_requests").select("status");

        let sTotal = 0;
        let sOpen = 0;
        let sUnderReview = 0;
        let sResolved = 0;

        if (supportReqs) {
          sTotal = supportReqs.length;
          sOpen = supportReqs.filter((r) => r.status === "open").length;
          sUnderReview = supportReqs.filter((r) => r.status === "under_review").length;
          sResolved = supportReqs.filter((r) => r.status === "resolved").length;
        }

        if (profiles) {
          const owners = profiles.filter((p) => p.role === "owner");
          const contractors = profiles.filter((p) => p.role === "contractor");
          const pendingOwn = owners.filter((p) => p.status === "pending");
          const pendingCont = contractors.filter((p) => p.status === "pending");

          setStats({
            totalOwners: owners.length,
            totalContractors: contractors.length,
            pendingOwners: pendingOwn.length,
            pendingContractors: pendingCont.length,
            activeTenders: tendersCount || 0,
            activeProjects: activeProjCount || 0,
            completedProjects: completedProjCount || 0,
            totalBids: bidsCount || 0,
            supportTotal: sTotal,
            supportOpen: sOpen,
            supportUnderReview: sUnderReview,
            supportResolved: sResolved,
          });
        }
      } catch (err) {
        console.error("Error loading admin live stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Shield className="h-3.5 w-3.5" /> Platform Governance Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getTimeBasedGreeting(profile?.full_name, "Admin Console")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time platform health metrics, pending user verification approvals, and active tender monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/owners"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-700 transition-all"
            >
              Review Owner Applications
            </Link>
          </div>
        </div>
      </div>

      {/* 8 Top Dynamic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Owners</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.totalOwners}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Contractors</span>
            <UserCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.totalContractors}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Owner Approvals</span>
            <Clock className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{stats.pendingOwners}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Contractor Approvals</span>
            <AlertCircle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{stats.pendingContractors}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Tenders</span>
            <FileText className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{stats.activeTenders}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Projects</span>
            <Building2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">{stats.activeProjects}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Completed Projects</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-teal-400">{stats.completedProjects}</div>
        </div>

        <Link
          href="/admin/support"
          className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/30 bg-slate-900 p-4 space-y-2 shadow-sm hover:border-amber-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">Support Requests</span>
            <HelpCircle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-white">{stats.supportTotal}</div>
            <div className="text-[11px] text-slate-400 space-x-1.5 font-medium">
              <span className="text-amber-400 font-bold">Open: {stats.supportOpen}</span>
              <span>•</span>
              <span className="text-blue-400 font-bold">Review: {stats.supportUnderReview}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Resolved: {stats.supportResolved}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Admin Quick Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Admin Quick Governance Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            href="/admin/support"
            className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <span>[ Support Requests ]</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/owners"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <span>[ Owner Approvals ]</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/contractors"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <span>[ Contractor Approvals ]</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/tenders"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <span>[ Active Tenders ]</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/projects"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <span>[ View Projects ]</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
