"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  DollarSign,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { submitBidAction } from "@/actions/bids";

export default function ContractorTenderDetailPage({ params }: { params: { id: string } }) {
  const [showBidForm, setShowBidForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for bidding
  const [quotation, setQuotation] = useState("2850000");
  const [materialCost, setMaterialCost] = useState("1600000");
  const [labourCost, setLabourCost] = useState("750000");
  const [equipmentCost, setEquipmentCost] = useState("300000");
  const [otherCost, setOtherCost] = useState("200000");
  const [completionDays, setCompletionDays] = useState("210");
  const [startDate, setStartDate] = useState("2026-03-15");
  const [proposal, setProposal] = useState(
    "We offer 12+ years of civil construction expertise in Hyderabad. We use high-density M25 concrete mix, Asian Paints Apex exterior weatherproofing, and Finolex concealed wiring with full 10-year structural warranty."
  );

  const tender = {
    id: params.id,
    title: "Modern Duplex Villa Construction",
    description: "Looking for an experienced civil contractor for a 2,400 sq.ft modern duplex villa with premium elevation, RCC frame structuring, and smart wiring.",
    location: "Plot 42, Jubilee Hills, Hyderabad, Telangana",
    property_type: "Residential Duplex Villa",
    area_sqft: 2400,
    budget_min: 3000000,
    budget_max: 3500000,
    start_date: "2026-03-15",
    expected_completion: "2027-03-30",
    bid_deadline: "2026-09-15",
    owner_requirements: "Contractor must provide past duplex villa portfolio, GST registration, and itemized material BOQ breakdown.",
    boq_items: [
      { item: "Earthwork & Excavation", qty: "2,400 sq.ft", spec: "Depth 6 ft" },
      { item: "RCC Column & Slab Concrete", qty: "M25 Grade", spec: "FE550 TMT Steel" },
      { item: "Red Brick Masonry & Plastering", qty: "9-inch exterior", spec: "Smooth cement finish" },
    ],
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("tender_id", tender.id);
    formData.set("quotation_amount", quotation);
    formData.set("material_cost", materialCost);
    formData.set("labour_cost", labourCost);
    formData.set("equipment_cost", equipmentCost);
    formData.set("other_cost", otherCost);
    formData.set("estimated_completion_days", completionDays);
    formData.set("proposed_start_date", startDate);
    formData.set("proposal", proposal);

    const res = await submitBidAction(formData);

    if (res?.error) {
      setError(res.error);
      setSubmitting(false);
    } else {
      setSubmissionSuccess(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <Link href="/contractor/tenders" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Tender Marketplace
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{tender.title}</h1>
          <p className="text-xs text-muted-foreground">{tender.location}</p>
        </div>

        <button
          onClick={() => setShowBidForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all shrink-0"
        >
          <Sparkles className="h-4 w-4" /> Submit Bid
        </button>
      </div>

      {/* Tender Details Specification Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">Estimated Budget</span>
          <div className="text-base font-extrabold text-foreground">
            ₹{(tender.budget_min / 100000).toFixed(1)}L - ₹{(tender.budget_max / 100000).toFixed(1)}L
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">Built-up Area</span>
          <div className="text-base font-extrabold text-foreground">{tender.area_sqft} sq.ft</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">Bid Deadline</span>
          <div className="text-base font-bold text-orange-600">{tender.bid_deadline}</div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
          <span className="text-xs text-muted-foreground font-semibold">Construction Type</span>
          <div className="text-base font-bold text-foreground">{tender.property_type}</div>
        </div>
      </div>

      {/* Description & BOQ Section */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-foreground border-b pb-3">Project Description & Requirements</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tender.description}
        </p>

        <div className="rounded-xl bg-orange-500/10 p-4 border border-orange-500/20 text-xs space-y-1 text-orange-600">
          <span className="font-bold block">Owner Special Requirements:</span>
          <p className="text-[11px] text-orange-600/90">{tender.owner_requirements}</p>
        </div>
      </div>

      {/* BOQ Specifications Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-foreground border-b pb-3">Bill of Quantities (BOQ) Specs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 font-bold text-foreground">
                <th className="p-3">Work Item</th>
                <th className="p-3">Quantity / Grade</th>
                <th className="p-3">Material Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tender.boq_items.map((b, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-foreground">{b.item}</td>
                  <td className="p-3 text-muted-foreground">{b.qty}</td>
                  <td className="p-3 text-muted-foreground">{b.spec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================
          BID SUBMISSION MODAL / SECTION
      =================================================== */}
      {(showBidForm || submissionSuccess) && (
        <div className="rounded-3xl border border-orange-500/50 bg-card p-6 sm:p-8 space-y-6 shadow-2xl ring-2 ring-orange-500/20">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-foreground">Submit Quotation & BOQ Proposal</h2>
              <p className="text-xs text-muted-foreground">Submit your itemized quotation and estimated project completion timeline.</p>
            </div>
            <button
              onClick={() => setShowBidForm(false)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Close ✕
            </button>
          </div>

          {submissionSuccess ? (
            <div className="rounded-2xl bg-emerald-500/10 p-6 text-center space-y-3 border border-emerald-500/20">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-extrabold text-foreground">Your bid has been submitted successfully.</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                The property owner will review your quotation, cost breakdown, and company portfolio. You can monitor the bid status from your dashboard.
              </p>
              <div className="pt-2">
                <Link
                  href="/contractor/bids"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
                >
                  View My Submitted Bids
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitBid} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quotation & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Total Quotation Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={quotation}
                    onChange={(e) => setQuotation(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Estimated Completion (Days) *</label>
                  <input
                    type="number"
                    required
                    value={completionDays}
                    onChange={(e) => setCompletionDays(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Proposed Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {/* Itemized Cost Breakdown */}
              <div className="space-y-3 rounded-2xl bg-muted/30 p-4 border">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Itemized BOQ Cost Breakdown
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Material Cost (₹)</label>
                    <input
                      type="number"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Labour Cost (₹)</label>
                    <input
                      type="number"
                      value={labourCost}
                      onChange={(e) => setLabourCost(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Equipment Cost (₹)</label>
                    <input
                      type="number"
                      value={equipmentCost}
                      onChange={(e) => setEquipmentCost(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">Other Expenses (₹)</label>
                    <input
                      type="number"
                      value={otherCost}
                      onChange={(e) => setOtherCost(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs font-bold text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Proposal Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Proposal Statement / Suitability Explanation *</label>
                <textarea
                  rows={4}
                  required
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Explain why your firm is best suited for this construction project..."
                  className="w-full rounded-xl border bg-background/60 p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 transition-all"
                >
                  {submitting ? "Submitting Bid..." : "Submit Bid"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
