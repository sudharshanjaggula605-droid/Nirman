"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronRight,
  Sparkles,
  MapPin,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTimeBasedGreeting, formatDate, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ContractorDashboardPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [contractor, setContractor] = useState<any>(null);
  const [tenders, setTenders] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    async function loadContractorData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (prof) setProfile(prof);

        const { data: cont } = await supabase
          .from("contractors")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (cont) setContractor(cont);

        // Fetch open active tenders
        const { data: openTenders } = await supabase
          .from("tenders")
          .select("*, project:projects(*), bids:bids(count)")
          .eq("status", "active")
          .order("created_at", { ascending: false });
        if (openTenders) setTenders(openTenders);

        // Fetch my bids
        const { data: bids } = await supabase
          .from("bids")
          .select("*, tender:tenders(title, budget_max)")
          .eq("contractor_id", user.id)
          .order("submitted_at", { ascending: false });
        if (bids) setMyBids(bids);
      } catch (err) {
        console.error("Error loading contractor dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContractorData();
  }, []);

  // Compute real dynamic metric counts directly from database safely
  const availableTendersCount = tenders?.length || 0;
  const totalBidsCount = myBids?.length || 0;
  const pendingBidsCount = (myBids || []).filter((b) => b?.status === "pending").length;
  const acceptedBidsCount = (myBids || []).filter((b) => b?.status === "accepted").length;
  const activeProjectsCount = (myBids || []).filter((b) => b?.status === "accepted").length;
  const completedProjectsCount = contractor?.total_projects || 0;

  const greetingDisplay = mounted
    ? getTimeBasedGreeting(profile?.first_name || contractor?.contact_person || profile?.full_name, "Contractor")
    : "Contractor Workspace";

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="rounded-3xl border bg-card/60 p-8 h-36" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border bg-card/60 p-4 h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border bg-card/60 p-6 h-64" />
          <div className="lg:col-span-5 rounded-2xl border bg-card/60 p-6 h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting Banner */}
      <div className="rounded-3xl border bg-gradient-to-r from-orange-500/10 via-background to-amber-500/10 p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600">
              <Sparkles className="h-3.5 w-3.5" /> {t("contractor.workspace_badge", "Contractor Hub")}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {greetingDisplay}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("contractor.dashboard_title", "Contractor Dashboard")}
            </p>
          </div>

          <Link
            href="/contractor/tenders"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-700/30 hover:bg-orange-800 transition-all shrink-0 cursor-pointer"
          >
            <Search className="h-4 w-4" /> {t("contractor.find_open_tenders", "Browse Open Tenders")}
          </Link>
        </div>
      </div>

      {/* 6 Dashboard Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("contractor.available_tenders", "Available Tenders")}</span>
            <Search className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{availableTendersCount}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("contractor.total_bids_submitted", "My Bids")}</span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{totalBidsCount}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("contractor.pending_bids", "Pending Bids")}</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingBidsCount}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("contractor.accepted_bids", "Accepted Bids")}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{acceptedBidsCount}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("nav.active_projects", "Active Projects")}</span>
            <Building2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{activeProjectsCount}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("badge.completed", "Completed")}</span>
            <Briefcase className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{completedProjectsCount}</div>
        </div>
      </div>

      {/* Contractor Quick Actions */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Contractor Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/contractor/tenders"
            className="flex items-center justify-between rounded-xl border bg-orange-500/10 p-3.5 text-xs font-bold text-orange-600 hover:bg-orange-500/20 transition-colors"
          >
            <span>[ Find Tenders ]</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contractor/bids"
            className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <span>[ My Bids ]</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contractor/projects"
            className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <span>[ Active Projects ]</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contractor/portfolio"
            className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <span>[ Update Portfolio ]</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Available Tenders & My Bids Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available Tenders */}
        <div className="lg:col-span-7 rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-extrabold text-foreground">Available Tenders</h2>
              <p className="hidden sm:block text-xs text-muted-foreground">Latest construction requirements looking for contractor bids</p>
            </div>
            <Link href="/contractor/tenders" className="text-xs font-bold text-orange-600 hover:underline shrink-0">
              Explore All →
            </Link>
          </div>

          {tenders.length > 0 ? (
            <div className="space-y-3">
              {tenders.slice(0, 4).map((tender) => (
                <div key={tender.id} className="rounded-xl border p-4 hover:border-orange-500/40 transition-colors space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-foreground">{tender.title}</h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-orange-500" />
                        <span>{tender.project?.city || "Hyderabad"}</span>
                        <span>•</span>
                        <span>{tender.project?.area_sqft || 2400} sq.ft</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-emerald-600">
                      Est. ₹{((parseFloat(tender.budget_max || "3500000")) / 100000).toFixed(1)}L
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-muted/40">
                    <span className="text-muted-foreground">
                      Deadline: <strong className="text-foreground">{formatDate(tender.bid_deadline)}</strong>
                    </span>

                    <Link
                      href={`/contractor/tenders/${tender.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
                    >
                      View Tender
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
              <Search className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="text-xs font-bold text-foreground">No Open Tenders</div>
              <p className="text-[11px] text-muted-foreground font-medium">No live tenders published in database yet.</p>
            </div>
          )}
        </div>

        {/* My Bids Table */}
        <div className="lg:col-span-5 rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-extrabold text-foreground">My Bids</h2>
              <p className="text-xs text-muted-foreground">Track status of your submitted bids</p>
            </div>
            <Link href="/contractor/bids" className="text-xs font-bold text-orange-600 hover:underline">
              View All Bids
            </Link>
          </div>

          {myBids.length > 0 ? (
            <div className="space-y-3">
              {myBids.slice(0, 4).map((bid) => {
                const statusUpper = (bid.status || "PENDING").toUpperCase();
                return (
                  <div key={bid.id} className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground truncate max-w-[180px]">{bid.tender?.title || "Construction Tender"}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        statusUpper === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : statusUpper === "REJECTED"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        {statusUpper}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Quotation: <strong className="text-foreground">{formatCurrency(bid.quotation_amount)}</strong></span>
                      <span>Duration: <strong className="text-foreground">{Math.round((bid.estimated_completion_days || 180) / 30)} mo</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="text-xs font-bold text-foreground">No Bids Submitted</div>
              <p className="text-[11px] text-muted-foreground">Explore active tenders and submit your BOQ quotation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
