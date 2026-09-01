"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardHat, DollarSign, Clock, FileText, Send, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { submitBidAction } from "@/actions/bids";

interface BidSubmissionPageProps {
  params: { id: string };
}

export default function BidSubmissionPage({ params }: BidSubmissionPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    quotation_amount: "",
    estimated_completion_days: "",
    proposed_start_date: "",
    material_cost: 0,
    labour_cost: 0,
    equipment_cost: 0,
    other_cost: 0,
    proposal: "",
    additional_notes: "",
  });

  // Validation State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const totalCalculated =
    (formData.material_cost || 0) +
    (formData.labour_cost || 0) +
    (formData.equipment_cost || 0) +
    (formData.other_cost || 0);

  const scrollToFirstInvalid = (errors: Record<string, string>) => {
    setFieldErrors(errors);
    const firstKey = Object.keys(errors)[0];
    if (firstKey) {
      const el = document.getElementById(firstKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.quotation_amount.trim() || Number(formData.quotation_amount) <= 0) {
      errors["quotation_amount"] = "Please enter a valid quotation amount in ₹.";
    }
    if (!formData.estimated_completion_days.trim() || Number(formData.estimated_completion_days) <= 0) {
      errors["estimated_completion_days"] = "Please enter estimated completion timeline in days.";
    }
    if (!formData.proposed_start_date.trim()) {
      errors["proposed_start_date"] = "Please select a proposed start date.";
    }
    if (!formData.proposal.trim() || formData.proposal.trim().length < 10) {
      errors["proposal"] = "Please provide a detailed project proposal narrative (min 10 characters).";
    }

    if (Object.keys(errors).length > 0) {
      scrollToFirstInvalid(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);

    try {
      const dataPayload = new FormData();
      dataPayload.set("tender_id", params.id);
      dataPayload.set("quotation_amount", formData.quotation_amount);
      dataPayload.set("estimated_completion_days", formData.estimated_completion_days);
      dataPayload.set("proposed_start_date", formData.proposed_start_date);
      dataPayload.set("material_cost", formData.material_cost.toString());
      dataPayload.set("labour_cost", formData.labour_cost.toString());
      dataPayload.set("equipment_cost", formData.equipment_cost.toString());
      dataPayload.set("other_cost", formData.other_cost.toString());
      dataPayload.set("proposal", formData.proposal);
      dataPayload.set("additional_notes", formData.additional_notes);

      const result = await submitBidAction(dataPayload);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setShowSuccessModal(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit bid. Please try again.");
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    // Reset form state upon successful submission
    setFormData({
      quotation_amount: "",
      estimated_completion_days: "",
      proposed_start_date: "",
      material_cost: 0,
      labour_cost: 0,
      equipment_cost: 0,
      other_cost: 0,
      proposal: "",
      additional_notes: "",
    });
    setFieldErrors({});
    setShowSuccessModal(false);
    router.push("/contractor/bids");
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-3xl">
      {/* Confirmation Dialog Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center space-y-6 shadow-2xl text-slate-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">✓ Submission Successful</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your bid quotation and BOQ proposal have been submitted successfully.
              </p>
              <p className="text-xs text-slate-400">
                The property owner will review your quotation and proposal.
              </p>
            </div>

            <button
              onClick={handleSuccessModalClose}
              className="w-full rounded-xl bg-orange-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
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
          <Link
            href={`/contractor/tenders/${params.id}`}
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3.5 text-xs font-medium text-destructive border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Section 1: Quotation & Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" /> Quotation & Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="quotation_amount" className="text-xs font-semibold text-foreground">
                  Total Quotation Amount (₹) *
                </label>
                <input
                  id="quotation_amount"
                  name="quotation_amount"
                  type="number"
                  min={1}
                  value={formData.quotation_amount}
                  onChange={(e) => {
                    setFormData({ ...formData, quotation_amount: e.target.value });
                    if (fieldErrors["quotation_amount"]) {
                      setFieldErrors((prev) => {
                        const n = { ...prev };
                        delete n["quotation_amount"];
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g. 3200000"
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono ${
                    fieldErrors["quotation_amount"] ? "border-rose-500 ring-2 ring-rose-500/30" : ""
                  }`}
                />
                {fieldErrors["quotation_amount"] && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors["quotation_amount"]}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="estimated_completion_days" className="text-xs font-semibold text-foreground">
                  Estimated Completion (Days) *
                </label>
                <input
                  id="estimated_completion_days"
                  name="estimated_completion_days"
                  type="number"
                  min={1}
                  value={formData.estimated_completion_days}
                  onChange={(e) => {
                    setFormData({ ...formData, estimated_completion_days: e.target.value });
                    if (fieldErrors["estimated_completion_days"]) {
                      setFieldErrors((prev) => {
                        const n = { ...prev };
                        delete n["estimated_completion_days"];
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g. 180"
                  className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                    fieldErrors["estimated_completion_days"] ? "border-rose-500 ring-2 ring-rose-500/30" : ""
                  }`}
                />
                {fieldErrors["estimated_completion_days"] && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors["estimated_completion_days"]}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="proposed_start_date" className="text-xs font-semibold text-foreground">
                Proposed Start Date *
              </label>
              <input
                id="proposed_start_date"
                name="proposed_start_date"
                type="date"
                value={formData.proposed_start_date}
                onChange={(e) => {
                  setFormData({ ...formData, proposed_start_date: e.target.value });
                  if (fieldErrors["proposed_start_date"]) {
                    setFieldErrors((prev) => {
                      const n = { ...prev };
                      delete n["proposed_start_date"];
                      return n;
                    });
                  }
                }}
                className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                  fieldErrors["proposed_start_date"] ? "border-rose-500 ring-2 ring-rose-500/30" : ""
                }`}
              />
              {fieldErrors["proposed_start_date"] && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors["proposed_start_date"]}</p>
              )}
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
                  value={formData.material_cost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, material_cost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Labour Cost (₹)</label>
                <input
                  name="labour_cost"
                  type="number"
                  min={0}
                  value={formData.labour_cost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, labour_cost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Equipment Cost (₹)</label>
                <input
                  name="equipment_cost"
                  type="number"
                  min={0}
                  value={formData.equipment_cost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, equipment_cost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Other / Contingency (₹)</label>
                <input
                  name="other_cost"
                  type="number"
                  min={0}
                  value={formData.other_cost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, other_cost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Proposal Details */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-1">
              <label htmlFor="proposal" className="text-xs font-semibold text-foreground">
                Project Proposal Narrative *
              </label>
              <textarea
                id="proposal"
                name="proposal"
                rows={4}
                value={formData.proposal}
                onChange={(e) => {
                  setFormData({ ...formData, proposal: e.target.value });
                  if (fieldErrors["proposal"]) {
                    setFieldErrors((prev) => {
                      const n = { ...prev };
                      delete n["proposal"];
                      return n;
                    });
                  }
                }}
                placeholder="Detail your construction methodology, structural quality assurances, material grades, and execution plan..."
                className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y ${
                  fieldErrors["proposal"] ? "border-rose-500 ring-2 ring-rose-500/30" : ""
                }`}
              />
              {fieldErrors["proposal"] && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors["proposal"]}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Additional Terms & Notes (Optional)</label>
              <textarea
                name="additional_notes"
                rows={2}
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                placeholder="Payment terms, water/electricity requirements from owner..."
                className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-y"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="h-4 w-4" />
            {loading ? "Submitting Bid..." : "Submit Bid Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
}
