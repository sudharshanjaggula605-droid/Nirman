import Link from "next/link";
import { notFound } from "next/navigation";
import { DollarSign, Clock, Star, Layers, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

interface TenderBidsPageProps {
  params: { id: string };
}

export default async function TenderBidsPage({ params }: TenderBidsPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Tender with received bids
  const { data: tender } = await supabase
    .from("tenders")
    .select(`
      *,
      project:projects(title),
      bids:bids(
        *,
        contractor:contractors(*),
        cost_breakdown:bid_cost_breakdowns(*)
      )
    `)
    .eq("id", params.id)
    .single();

  const bids = tender?.bids || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Received Bids</h1>
          <p className="text-xs text-muted-foreground">
            Bids submitted by licensed contractors for: <strong className="text-foreground">{tender?.title || "Tender"}</strong>
          </p>
        </div>

        {bids.length > 1 && (
          <Link
            href={`/owner/tenders/${params.id}/compare`}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-orange-700"
          >
            <Layers className="h-4 w-4" /> Compare Bids Side-by-Side
          </Link>
        )}
      </div>

      {bids.length > 0 ? (
        <div className="space-y-4">
          {bids.map((b: any) => (
            <div key={b.id} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground">{b.contractor?.company_name || "Contractor"}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>Contact: {b.contractor?.contact_person}</span>
                    <span>Experience: {b.contractor?.years_of_experience || 0} Years</span>
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {b.contractor?.average_rating || 0.0} ({b.contractor?.total_reviews || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Quotation Amount</span>
                  <span className="text-2xl font-black text-emerald-600">{formatCurrency(b.quotation_amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/40 p-3 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Timeline</span>
                  <span className="font-bold text-foreground">{b.estimated_completion_days} Days</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Material Cost</span>
                  <span className="font-mono text-foreground">{formatCurrency(b.cost_breakdown?.[0]?.material_cost)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Labour Cost</span>
                  <span className="font-mono text-foreground">{formatCurrency(b.cost_breakdown?.[0]?.labour_cost)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Equipment/Other</span>
                  <span className="font-mono text-foreground">
                    {formatCurrency((b.cost_breakdown?.[0]?.equipment_cost || 0) + (b.cost_breakdown?.[0]?.other_cost || 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Proposal Highlights:</span>
                <p className="text-xs text-foreground bg-card p-3 rounded-lg border leading-relaxed">
                  {b.proposal}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground space-y-2">
          <p>No contractor bids received on this tender yet.</p>
        </div>
      )}
    </div>
  );
}
