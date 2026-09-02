"use client";

import { useState } from "react";
import { ShieldCheck, HardHat, Building2, ArrowRight, Loader2, X, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createContractorSelectionOrderAction, type CreateOrderResult } from "@/actions/payments";

interface ContractorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
  bid: any;
  projectTitle: string;
  onProceedToPayment: (orderData: CreateOrderResult) => void;
}

export function ContractorSelectionModal({
  isOpen,
  onClose,
  tenderId,
  bid,
  projectTitle,
  onProceedToPayment,
}: ContractorSelectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !bid) return null;

  const contractorName =
    bid.contractor?.company_name || bid.contractor?.contact_person || "Licensed Contractor Firm";

  const handleProceed = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await createContractorSelectionOrderAction(tenderId, bid.id);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onProceedToPayment(res);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to initialize payment order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Confirm Contractor Selection</h2>
              <p className="text-[11px] text-slate-400">Review selection & platform fee before awarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Details Card */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Selected Contractor</span>
                <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <HardHat className="h-4 w-4 text-amber-500 shrink-0" />
                  {contractorName}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400">Contract Quotation</span>
                <p className="text-sm font-black text-emerald-400">{formatCurrency(bid.quotation_amount)}</p>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Project / Tender</span>
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                {projectTitle}
              </p>
            </div>
          </div>

          {/* Fee Card */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  NIRMAN Platform Selection Fee
                </span>
                <span className="text-[11px] text-slate-400">
                  One-time project contract governance & legal escrow activation fee
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-white">₹199</span>
                <span className="text-[10px] text-slate-400 block">incl. all taxes</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-xl bg-slate-950/80 p-3 text-[11px] text-slate-400 leading-relaxed border border-slate-800">
            🔒 By proceeding to payment, your contractor selection will be locked. Once the ₹199 payment is verified, the project status will automatically transition to <strong>ACTIVE</strong> and the contractor will be notified.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing Payment...
              </>
            ) : (
              <>
                Proceed to Payment <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
