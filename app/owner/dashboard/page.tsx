"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  PlusCircle,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Eye,
  Star,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTimeBasedGreeting, formatDate, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export default function OwnerDashboardPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tenders, setTenders] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Load profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (prof) setProfile(prof);

        // Load projects
        const { data: ownerProjects } = await supabase
          .from("projects")
          .select("*, tender:tenders(*)")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        if (ownerProjects) setProjects(ownerProjects);

        // Load tenders
        const { data: ownerTenders } = await supabase
          .from("tenders")
          .select("*, project:projects(*), bids:bids(count)")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        if (ownerTenders) setTenders(ownerTenders);

        // Load bids received across owner's tenders
        if (ownerTenders && ownerTenders.length > 0) {
          const tenderIds = ownerTenders.map((t) => t.id).filter(Boolean);
          if (tenderIds.length > 0) {
            const { data: receivedBids } = await supabase
              .from("bids")
              .select("*, contractor:contractors(*), tender:tenders(title)")
              .in("tender_id", tenderIds)
              .order("submitted_at", { ascending: false });
            if (receivedBids) setBids(receivedBids);
          }
        }
      } catch (err) {
        console.error("Error loading owner dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute metric counts safely
  const totalProjects = projects?.length || 0;
  const activeProjects = (projects || []).filter((p) => p?.status === "active").length;
  const activeTenders = (tenders || []).filter((t) => t?.status === "active").length;
  const totalBids = bids?.length || 0;
  const pendingBids = (bids || []).filter((b) => b?.status === "pending").length;
  const completedProjects = (projects || []).filter((p) => p?.status === "completed").length;

  const firstActiveProject = (projects || []).find((p) => p?.status === "active") || projects?.[0];

  const greetingDisplay = mounted
    ? getTimeBasedGreeting(profile?.first_name || profile?.full_name, "Property Owner")
    : "Property Owner Workspace";

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
      {/* Top Greeting Banner */}
      <div className="rounded-3xl border bg-gradient-to-r from-orange-500/10 via-background to-amber-500/10 p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600">
              <Sparkles className="h-3.5 w-3.5" /> {t("owner.workspace_badge", "Owner Workspace")}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {greetingDisplay}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("owner.dashboard_title", "Project & Tender Overview")}
            </p>
          </div>

          <Link
            href="/owner/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-700 to-amber-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-700/30 hover:from-orange-800 hover:to-amber-700 transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" /> {t("owner.post_new_tender", "Post New Project")}
          </Link>
        </div>
      </div>

      {/* Dashboard Metric Cards (6 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("owner.total_projects", "Total Projects")}</span>
            <Building2 className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalProjects}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("owner.active_projects", "Active Projects")}</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{activeProjects}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("owner.active_tenders", "Active Tenders")}</span>
            <FileText className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{activeTenders}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("owner.total_bids_received", "Total Bids")}</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{totalBids}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("contractor.pending_bids", "Pending Bids")}</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{pendingBids}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">{t("badge.completed", "Completed")}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{completedProjects}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/owner/projects/new"
            className="flex items-center justify-between rounded-xl border bg-orange-500/10 p-3.5 text-xs font-bold text-orange-600 hover:bg-orange-500/20 transition-colors"
          >
            <span>+ Post New Project</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/owner/tenders"
            className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <span>View My Tenders</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/owner/bids"
            className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <span>View Received Bids</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/owner/projects"
            className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            <span>View Active Projects</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Active Project Progress Bar Section */}
      {firstActiveProject && (
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-foreground">Active Project Progress</h2>
              <p className="text-xs text-muted-foreground">Real-time completion milestone tracking</p>
            </div>
            <Link href="/owner/projects" className="text-xs font-bold text-orange-600 hover:underline">
              View All Projects →
            </Link>
          </div>

          <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-extrabold text-sm text-foreground">{firstActiveProject.title || "Untitled Project"}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 pt-0.5">
                  <span>Location: <strong className="text-foreground">{firstActiveProject.city || firstActiveProject.location || "Hyderabad"}</strong></span>
                  <span>•</span>
                  <span>Budget: <strong className="text-foreground">{formatCurrency(firstActiveProject.estimated_budget)}</strong></span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                Status: {(firstActiveProject.status || "ACTIVE").toUpperCase()}
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground">Overall Construction Progress</span>
                <span className="text-orange-600">{firstActiveProject.progress_percentage || 45}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${firstActiveProject.progress_percentage || 45}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Link
                href={`/owner/projects/${firstActiveProject.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent"
              >
                <Eye className="h-3.5 w-3.5 text-orange-600" /> View Project Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Recent Tenders & Received Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Tenders Section */}
        <div className="lg:col-span-7 rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-extrabold text-foreground">Recent Tenders</h2>
              <p className="text-xs text-muted-foreground font-medium">Tenders created for contractor bidding</p>
            </div>
            <Link href="/owner/tenders" className="text-xs font-bold text-orange-600 hover:underline">
              View All ({tenders.length}) →
            </Link>
          </div>

          {tenders.length > 0 ? (
            <div className="space-y-3">
              {tenders.slice(0, 4).map((t) => {
                const bidsCount = t.bids?.[0]?.count || 0;
                return (
                  <div
                    key={t.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-foreground">{t.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Budget: <strong>{formatCurrency(t.budget_max)}</strong></span>
                        <span>•</span>
                        <span>{t.property_type || "Residential"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-md border border-orange-500/20">
                        <Users className="h-3 w-3" /> {bidsCount} {bidsCount === 1 ? "Bid" : "Bids"}
                      </span>
                      <Link
                        href={`/owner/tenders/${t.id}/bids`}
                        className="inline-flex items-center gap-1 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
                      >
                        Bids <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-3 bg-muted/10">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="text-xs font-bold text-foreground">No Tenders Created Yet</div>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Post your first construction tender to receive competitive quotations from verified contractors.
              </p>
              <Link
                href="/owner/projects/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Post First Tender
              </Link>
            </div>
          )}
        </div>

        {/* Recent Received Bids */}
        <div className="lg:col-span-5 rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-extrabold text-foreground">Latest Contractor Bids</h2>
              <p className="text-xs text-muted-foreground font-medium">Quotations submitted for your review</p>
            </div>
            <Link href="/owner/bids" className="text-xs font-bold text-orange-600 hover:underline">
              View All ({bids.length}) →
            </Link>
          </div>

          {bids.length > 0 ? (
            <div className="space-y-3">
              {bids.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-foreground">
                      {b.contractor?.company_name || "Contractor Partner"}
                    </div>
                    <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.quotation_amount)}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Timeline: {b.estimated_completion_days || 180} Days</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {b.contractor?.average_rating || 5.0}
                    </span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/owner/tenders/${b.tender_id}/bids`}
                      className="text-[11px] font-bold text-orange-600 hover:underline inline-flex items-center gap-1"
                    >
                      Inspect Quote Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/10">
              <Users className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="text-xs font-bold text-foreground">No Bids Received Yet</div>
              <p className="text-[11px] text-muted-foreground">
                Once contractors review your open tenders, their quotation proposals will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
