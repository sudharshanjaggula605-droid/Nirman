"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  Star,
  Layers,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  HardHat,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { ContractorSelectionModal } from "@/components/payments/contractor-selection-modal";
import { PaymentCheckoutModal } from "@/components/payments/payment-checkout-modal";
import { type CreateOrderResult } from "@/actions/payments";
import { rejectBidAction } from "@/actions/bids";

interface TenderBidsPageProps {
  params: { id: string };
}

export default function TenderBidsPage({ params }: TenderBidsPageProps) {
  const [tender, setTender] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedBidForPayment, setSelectedBidForPayment] = useState<any>(null);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [orderData, setOrderData] = useState<CreateOrderResult | null>(null);

  // Reject Confirmation State
  const [rejectingBid, setRejectingBid] = useState<any>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const supabase = createClient();

  const loadTenderAndBids = async () => {
    try {
      const { data: tData } = await supabase
        .from("tenders")
        .select(`
          *,
          project:projects(*),
          bids:bids(
            *,
            contractor:contractors(*),
            cost_breakdown:bid_cost_breakdowns(*)
          )
        `)
        .eq("id", params.id)
        .single();

      if (tData) {
        setTender(tData);
        setBids(tData.bids || []);
      }
    } catch (err) {
      console.error("Error loading bids:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenderAndBids();
  }, [params.id]);

  const handleOpenSelection = (bid: any) => {
    setSelectedBidForPayment(bid);
    setIsSelectionModalOpen(true);
  };

  const handleProceedToPayment = (createdOrder: CreateOrderResult) => {
    setOrderData(createdOrder);
    setIsSelectionModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingBid) return;
    setIsRejecting(true);
    setRejectError(null);

    try {
      const res = await rejectBidAction(rejectingBid.id);
      if (res.error) {
        setRejectError(res.error);
      } else {
        await loadTenderAndBids();
        setRejectingBid(null);
      }
    } catch (err: any) {
      setRejectError(err?.message || "Failed to reject bid.");
    } finally {
      setIsRejecting(false);
    }
  };

  const isTenderAwarded = tender?.status === "awarded" || tender?.status === "completed";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <Link
            href="/owner/tenders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Tenders
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Received Bids</h1>
          <p className="text-xs text-muted-foreground">
            Bids submitted by licensed contractors for: <strong className="text-foreground">{tender?.title || "Tender"}</strong>
          </p>
        </div>

        {bids.length > 1 && (
          <Link
            href={`/owner/tenders/${params.id}/compare`}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-orange-700 transition-all shrink-0"
          >
            <Layers className="h-4 w-4" /> Compare Bids Side-by-Side
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading received contractor bids...
        </div>
      ) : bids.length > 0 ? (
        <div className="space-y-4">
          {bids.map((b: any) => {
            const isAccepted = b.status === "accepted";
            const isRejected = b.status === "rejected";
            const contractorName =
              b.contractor?.company_name || b.contractor?.contact_person || "Licensed Contractor";

            return (
              <div key={b.id} className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-foreground">{contractorName}</h3>
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Selected Contractor
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-500/20">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/40 p-3.5 rounded-xl border">
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-medium">Timeline</span>
                    <span className="font-bold text-foreground">{b.estimated_completion_days} Days</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-medium">Material Cost</span>
                    <span className="font-mono text-foreground">{formatCurrency(b.cost_breakdown?.[0]?.material_cost)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-medium">Labour Cost</span>
                    <span className="font-mono text-foreground">{formatCurrency(b.cost_breakdown?.[0]?.labour_cost)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-medium">Equipment/Other</span>
                    <span className="font-mono text-foreground">
                      {formatCurrency((b.cost_breakdown?.[0]?.equipment_cost || 0) + (b.cost_breakdown?.[0]?.other_cost || 0))}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Proposal Highlights:</span>
                  <p className="text-xs text-foreground bg-muted/20 p-3 rounded-xl border leading-relaxed">
                    {b.proposal}
                  </p>
                </div>

                {/* Selection & Reject Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Platform Selection Fee: ₹199
                  </div>

                  <div className="flex items-center gap-2">
                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md">
                        <CheckCircle2 className="h-4 w-4" /> Appointed Contractor
                      </span>
                    ) : isRejected ? (
                      <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                        Bid Rejected
                      </span>
                    ) : isTenderAwarded ? (
                      <span className="text-xs text-muted-foreground italic">Another contractor has been awarded</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingBid(b);
                            setRejectError(null);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" /> Reject Bid
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenSelection(b)}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 transition-all cursor-pointer"
                        >
                          <HardHat className="h-4 w-4" /> Select Contractor (₹199 Fee)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground space-y-2">
          <p>No contractor bids received on this tender yet.</p>
        </div>
      )}

      {/* REJECT CONFIRMATION POPUP */}
      {rejectingBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border bg-card text-foreground shadow-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto border border-rose-500/20">
              <XCircle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Are you sure you want to reject this bid?</h3>
              <p className="text-xs text-muted-foreground">
                Quotation of{" "}
                <strong className="text-foreground">{formatCurrency(rejectingBid.quotation_amount)}</strong> from{" "}
                <strong className="text-foreground">
                  {rejectingBid.contractor?.company_name || rejectingBid.contractor?.contact_person}
                </strong>{" "}
                will be marked as rejected. Other contractors&apos; bids will remain active.
              </p>
            </div>

            {rejectError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold text-xs">
                {rejectError}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isRejecting}
                onClick={() => setRejectingBid(null)}
                className="flex-1 rounded-xl border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleConfirmReject}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Yes, Reject Bid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Payment Modals */}
      {selectedBidForPayment && (
        <ContractorSelectionModal
          isOpen={isSelectionModalOpen}
          onClose={() => setIsSelectionModalOpen(false)}
          tenderId={params.id}
          bid={selectedBidForPayment}
          projectTitle={tender?.title || "Construction Project"}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      <PaymentCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        orderData={orderData}
      />
    </div>
  );
}
