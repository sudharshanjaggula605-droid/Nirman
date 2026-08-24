"use client";

import { useState } from "react";
import { CheckCircle2, Star, Clock, Briefcase, Award, ShieldCheck, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BidComparisonTableProps {
  bids: any[];
  onAcceptBid: (bidId: string) => Promise<void>;
}

export function BidComparisonTable({ bids, onAcceptBid }: BidComparisonTableProps) {
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);

  const handleAccept = async (bidId: string) => {
    if (confirm("Are you sure you want to accept this contractor's bid? This will reject other bids and activate the project.")) {
      setLoadingBidId(bidId);
      try {
        await onAcceptBid(bidId);
      } finally {
        setLoadingBidId(null);
      }
    }
  };

  if (!bids || bids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        No bids available for comparison yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 font-semibold text-muted-foreground w-48">Feature / Metric</th>
            {bids.map((b) => (
              <th key={b.id} className="p-4 font-bold text-foreground min-w-[240px]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center font-extrabold text-sm border border-orange-500/20">
                    {b.contractor?.company_name?.[0] || "C"}
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-none">{b.contractor?.company_name}</div>
                    <span className="text-[10px] text-muted-foreground font-normal">{b.contractor?.contact_person}</span>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {/* Quotation Amount */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Total Quotation
            </td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 font-black text-lg text-emerald-600 dark:text-emerald-400">
                {formatCurrency(b.quotation_amount)}
              </td>
            ))}
          </tr>

          {/* Estimated Completion Timeline */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" /> Completion Timeline
            </td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 font-bold text-foreground">
                {b.estimated_completion_days} Days
              </td>
            ))}
          </tr>

          {/* Experience */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-orange-500" /> Experience
            </td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 font-medium text-foreground">
                {b.contractor?.years_of_experience || 0} Years
              </td>
            ))}
          </tr>

          {/* Average Rating */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500" /> Rating & Reviews
            </td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 font-medium text-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{b.contractor?.average_rating || 0.0}</span>
                  <span className="text-xs text-muted-foreground">({b.contractor?.total_reviews || 0} reviews)</span>
                </div>
              </td>
            ))}
          </tr>

          {/* Completed Projects Count */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-purple-500" /> Awarded Projects
            </td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 font-medium text-foreground">
                {b.contractor?.total_projects || 0} Projects Completed
              </td>
            ))}
          </tr>

          {/* Cost Breakdown Items */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground">Material Cost</td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 text-xs font-mono text-muted-foreground">
                {formatCurrency(b.cost_breakdown?.material_cost || 0)}
              </td>
            ))}
          </tr>

          <tr>
            <td className="p-4 font-semibold text-muted-foreground">Labour Cost</td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 text-xs font-mono text-muted-foreground">
                {formatCurrency(b.cost_breakdown?.labour_cost || 0)}
              </td>
            ))}
          </tr>

          <tr>
            <td className="p-4 font-semibold text-muted-foreground">Equipment & Other</td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 text-xs font-mono text-muted-foreground">
                {formatCurrency((b.cost_breakdown?.equipment_cost || 0) + (b.cost_breakdown?.other_cost || 0))}
              </td>
            ))}
          </tr>

          {/* Verification Badges */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground">Compliance Checks</td>
            {bids.map((b) => (
              <td key={b.id} className="p-4">
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {b.contractor?.gst_number && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                      GST Verified
                    </span>
                  )}
                  {b.contractor?.license_number && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-semibold border border-blue-500/20">
                      License Active
                    </span>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Action Row */}
          <tr className="bg-muted/30">
            <td className="p-4 font-bold text-foreground">Action</td>
            {bids.map((b) => (
              <td key={b.id} className="p-4">
                {b.status === "accepted" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> Accepted Bid
                  </span>
                ) : (
                  <button
                    onClick={() => handleAccept(b.id)}
                    disabled={loadingBidId === b.id}
                    className="w-full rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {loadingBidId === b.id ? "Accepting..." : "Accept Contractor"}
                  </button>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
