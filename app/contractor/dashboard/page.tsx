import Link from "next/link";
import { Building2, FileText, CheckCircle2, Clock, Star, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export default async function ContractorDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Contractor metrics
  const { count: bidsCount } = await supabase
    .from("bids")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user?.id);

  const { count: acceptedBidsCount } = await supabase
    .from("bids")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user?.id)
    .eq("status", "accepted");

  const { data: contractorProfile } = await supabase
    .from("contractors")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: submittedBids } = await supabase
    .from("bids")
    .select(`
      *,
      tender:tenders(title, status, project:projects(city))
    `)
    .eq("contractor_id", user?.id)
    .order("submitted_at", { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Contractor Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Company: <strong className="text-foreground">{contractorProfile?.company_name || "Contractor"}</strong>
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-orange-700 transition-colors"
        >
          Discover Live Tenders
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Submitted Bids</span>
            <FileText className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{bidsCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Accepted Bids</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{acceptedBidsCount || 0}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Rating</span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{contractorProfile?.average_rating || 0.0}</div>
          <span className="text-[10px] text-muted-foreground">{contractorProfile?.total_reviews || 0} reviews</span>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Awarded Projects</span>
            <Building2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{contractorProfile?.total_projects || 0}</div>
        </div>
      </div>

      {/* Submitted Bids Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-base text-foreground">My Submitted Proposals</h3>
          <Link href="/contractor/bids" className="text-xs font-bold text-orange-600 hover:underline">
            View All
          </Link>
        </div>

        {submittedBids && submittedBids.length > 0 ? (
          <div className="divide-y">
            {submittedBids.map((b: any) => (
              <div key={b.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-foreground">{b.tender?.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>Quotation: <strong className="text-emerald-600">{formatCurrency(b.quotation_amount)}</strong></span>
                    <span>Timeline: {b.estimated_completion_days} Days</span>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${
                    b.status === "accepted"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : b.status === "rejected"
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}>
                    Status: {b.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-3">
            <p>You have not submitted any bids yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
            >
              Browse Active Tenders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
