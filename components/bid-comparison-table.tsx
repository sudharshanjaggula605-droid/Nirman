"use client";

import { CheckCircle2, Star, Clock, Briefcase, Award, ShieldCheck, DollarSign, HardHat } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BidComparisonTableProps {
  bids: any[];
  onSelectBid: (bid: any) => void;
}

export function BidComparisonTable({ bids, onSelectBid }: BidComparisonTableProps) {
  if (!bids || bids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        No bids available for comparison yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
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
        <tbody className="divide-y text-xs">
          {/* Quotation Amount */}
          <tr>
            <td className="p-4 font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Total Quotation
            </td>
            {bids.map((b) => (
              <td key={b.id} className="p-4 font-black text-base text-emerald-600 dark:text-emerald-400">
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
                  <span className="text-[10px] text-muted-foreground">({b.contractor?.total_reviews || 0} reviews)</span>
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
            <td className="p-4 font-bold text-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Platform Fee: ₹199
              </span>
            </td>
            {bids.map((b) => (
              <td key={b.id} className="p-4">
                {b.status === "accepted" ? (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white shadow-sm">
                    <CheckCircle2 className="h-4 w-4" /> Appointed Contractor
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectBid(b)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 transition-all cursor-pointer"
                  >
                    <HardHat className="h-3.5 w-3.5" /> Select Contractor
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
