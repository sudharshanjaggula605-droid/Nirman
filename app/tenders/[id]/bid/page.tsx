"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HardHat, DollarSign, Clock, FileText, Send, AlertCircle } from "lucide-react";
import { submitBidAction } from "@/actions/bids";

interface BidSubmissionPageProps {
  params: { id: string };
}

export default function BidSubmissionPage({ params }: BidSubmissionPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [materialCost, setMaterialCost] = useState<number>(0);
  const [labourCost, setLabourCost] = useState<number>(0);
  const [equipmentCost, setEquipmentCost] = useState<number>(0);
  const [otherCost, setOtherCost] = useState<number>(0);

  const totalCalculated = materialCost + labourCost + equipmentCost + otherCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("tender_id", params.id);

    const result = await submitBidAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/contractor/bids");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-3xl">
      <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Submit Construction Bid</h1>
            <p className="text-xs text-muted-foreground">
              Provide your quotation, itemized cost breakdown, and proposal
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Quotation & Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" /> Quotation & Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Total Quotation Amount (₹)</label>
                <input
                  name="quotation_amount"
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 3200000"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Estimated Completion (Days)</label>
                <input
                  name="estimated_completion_days"
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 180"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Proposed Start Date</label>
              <input
                name="proposed_start_date"
                type="date"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Section 2: Itemized Cost Breakdown */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" /> Itemized Cost Breakdown (BOQ)
              </h3>
              {totalCalculated > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-600">
                  Breakdown Total: ₹{totalCalculated.toLocaleString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Material Cost (₹)</label>
                <input
                  name="material_cost"
                  type="number"
                  min={0}
                  value={materialCost || ""}
                  onChange={(e) => setMaterialCost(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Labour Cost (₹)</label>
                <input
                  name="labour_cost"
                  type="number"
                  min={0}
                  value={labourCost || ""}
                  onChange={(e) => setLabourCost(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Equipment Cost (₹)</label>
                <input
                  name="equipment_cost"
                  type="number"
                  min={0}
                  value={equipmentCost || ""}
                  onChange={(e) => setEquipmentCost(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Other / Contingency (₹)</label>
                <input
                  name="other_cost"
                  type="number"
                  min={0}
                  value={otherCost || ""}
                  onChange={(e) => setOtherCost(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Proposal Details */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Project Proposal Narrative</label>
              <textarea
                name="proposal"
                required
                rows={4}
                placeholder="Detail your construction methodology, structural quality assurances, material grades, and execution plan..."
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Additional Terms & Notes (Optional)</label>
              <textarea
                name="additional_notes"
                rows={2}
                placeholder="Payment terms, water/electricity requirements from owner..."
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {loading ? "Submitting Bid..." : "Submit Bid Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
}
