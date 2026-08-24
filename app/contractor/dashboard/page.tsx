"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  Star,
  Building2,
  TrendingUp,
  CreditCard,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function ContractorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [bidsCount, setBidsCount] = useState(12);
  const [acceptedBidsCount, setAcceptedBidsCount] = useState(4);
  const [contractorProfile, setContractorProfile] = useState<any>(null);
  const [submittedBids, setSubmittedBids] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count: bCount } = await supabase
            .from("bids")
            .select("*", { count: "exact", head: true })
            .eq("contractor_id", user.id);

          const { count: aCount } = await supabase
            .from("bids")
            .select("*", { count: "exact", head: true })
            .eq("contractor_id", user.id)
            .eq("status", "accepted");

          const { data: prof } = await supabase
            .from("contractors")
            .select("*")
            .eq("id", user.id)
            .single();

          const { data: bids } = await supabase
            .from("bids")
            .select(`
              *,
              tender:tenders(title, status, project:projects(city, estimated_budget))
            `)
            .eq("contractor_id", user.id)
            .order("submitted_at", { ascending: false })
            .limit(5);

          if (bCount !== null) setBidsCount(bCount);
          if (aCount !== null) setAcceptedBidsCount(aCount);
          if (prof) setContractorProfile(prof);
          if (bids && bids.length > 0) setSubmittedBids(bids);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-orange-500/10 via-card to-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <ShieldCheck className="h-3.5 w-3.5" /> Licensed Contractor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back, {contractorProfile?.company_name || "Contractor Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track active bids, view awarded construction projects, and manage milestone disbursements.
          </p>
        </div>

        <Link
          href="/contractor/tenders"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition-colors shrink-0"
        >
          Browse Available Tenders <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Submitted Bids</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground">{bidsCount}</div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> Active in 4 cities
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Accepted Bids</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground">{acceptedBidsCount}</div>
          <p className="text-[11px] text-emerald-600 font-semibold">33% Success Rate</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payments</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground">₹12,50,000</div>
          <p className="text-[11px] text-amber-600 font-semibold">2 Milestones awaiting owner sign-off</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Earnings</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-foreground">₹48,20,000</div>
          <p className="text-[11px] text-muted-foreground">Across completed & active projects</p>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress Overview */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-foreground">Active Construction Project Progress</h3>
              <p className="text-xs text-muted-foreground">Real-time status of ongoing site works</p>
            </div>
            <Link href="/contractor/projects/active" className="text-xs font-bold text-orange-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-5">
            <div className="space-y-2 p-4 rounded-xl bg-muted/30 border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Modern Duplex Villa - Jubilee Hills</span>
                <span className="font-extrabold text-orange-600">65% Completed</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-orange-600 rounded-full transition-all duration-500" style={{ width: "65%" }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Current Stage: Elevation & Roofing</span>
                <span>Est. Finish: Oct 2026</span>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-muted/30 border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Commercial IT Office Fit-out - Whitefield</span>
                <span className="font-extrabold text-emerald-600">40% Completed</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: "40%" }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Current Stage: Glass Partitions & HVAC</span>
                <span>Est. Finish: Nov 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Rating Summary */}
        <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-base text-foreground border-b pb-4">Contractor Rating & Profile</h3>

          <div className="text-center space-y-2 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Star className="h-6 w-6 fill-amber-400" />
              <span className="text-2xl font-extrabold text-foreground">{contractorProfile?.average_rating || "4.9"}</span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Verified Contractor Status</p>
          </div>

          <div className="space-y-2">
            <Link
              href="/contractor/tenders"
              className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 hover:bg-accent text-xs font-bold text-foreground transition-colors"
            >
              <span>Explore New Tenders</span>
              <ChevronRight className="h-4 w-4 text-orange-500" />
            </Link>

            <Link
              href="/contractor/payments"
              className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 hover:bg-accent text-xs font-bold text-foreground transition-colors"
            >
              <span>Submit Payment Invoice</span>
              <ChevronRight className="h-4 w-4 text-orange-500" />
            </Link>

            <Link
              href="/contractor/documents"
              className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 hover:bg-accent text-xs font-bold text-foreground transition-colors"
            >
              <span>Upload Project Drawings & Specs</span>
              <ChevronRight className="h-4 w-4 text-orange-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Submitted Proposals Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-base text-foreground">Recent Submitted Proposals</h3>
            <p className="text-xs text-muted-foreground">Track property owner responses to your quotes</p>
          </div>
          <Link href="/contractor/bids" className="text-xs font-bold text-orange-600 hover:underline">
            View All Proposals
          </Link>
        </div>

        <div className="divide-y">
          <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-sm text-foreground">Modern Duplex Villa Construction</div>
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span>Quotation: <strong className="text-emerald-600">₹32,50,000</strong></span>
                <span>Timeline: 180 Days</span>
                <span>City: Hyderabad</span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                ACCEPTED
              </span>
            </div>
          </div>

          <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-sm text-foreground">Commercial IT Office Fit-out</div>
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span>Quotation: <strong className="text-emerald-600">₹48,00,000</strong></span>
                <span>Timeline: 90 Days</span>
                <span>City: Bengaluru</span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                UNDER REVIEW
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
