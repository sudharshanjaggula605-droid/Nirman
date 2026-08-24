import Link from "next/link";
import { Plus, Building2, FileText, Layers, CheckCircle2, Clock, MessageSquare, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function OwnerDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Owner metrics
  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user?.id);

  const { count: activeProjectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user?.id)
    .eq("status", "active");

  const { count: tendersCount } = await supabase
    .from("tenders")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user?.id);

  const { data: recentTenders } = await supabase
    .from("tenders")
    .select(`
      *,
      project:projects(title, city),
      bids:bids(count)
    `)
    .eq("owner_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Property Owner Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your construction projects, publish tenders, and review contractor bids.
          </p>
        </div>

        <Link
          href="/owner/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Project & Tender
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Projects</span>
            <Building2 className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{projectsCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Active Projects</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{activeProjectsCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Published Tenders</span>
            <FileText className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{tendersCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tender Actions</span>
            <Layers className="h-4 w-4 text-purple-500" />
          </div>
          <Link href="/owner/projects/new" className="text-xs font-bold text-orange-600 hover:underline block pt-1">
            + Create New
          </Link>
        </div>
      </div>

      {/* Recent Tenders Section */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-base text-foreground">My Published Tenders</h3>
          <Link href="/owner/tenders" className="text-xs font-bold text-orange-600 hover:underline">
            View All
          </Link>
        </div>

        {recentTenders && recentTenders.length > 0 ? (
          <div className="divide-y">
            {recentTenders.map((t: any) => (
              <div key={t.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-foreground">{t.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>Status: <strong className="text-orange-600 uppercase">{t.status}</strong></span>
                    <span>City: {t.project?.city || "India"}</span>
                    <span>Bids Received: <strong className="text-foreground">{t.bids?.[0]?.count || 0}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/owner/tenders/${t.id}/bids`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-orange-600 px-3.5 py-2 rounded-lg hover:bg-orange-700 shadow-sm"
                  >
                    View Bids <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-3">
            <p>You have not published any construction tenders yet.</p>
            <Link
              href="/owner/projects/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" /> Create First Tender
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
