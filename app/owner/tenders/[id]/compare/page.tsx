"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Layers } from "lucide-react";
import Link from "next/link";
import { BidComparisonTable } from "@/components/bid-comparison-table";
import { ContractorSelectionModal } from "@/components/payments/contractor-selection-modal";
import { PaymentCheckoutModal } from "@/components/payments/payment-checkout-modal";
import { createClient } from "@/lib/supabase/client";
import { type CreateOrderResult } from "@/actions/payments";

interface CompareBidsPageProps {
  params: { id: string };
}

export default function CompareBidsPage({ params }: CompareBidsPageProps) {
  const router = useRouter();
  const [tender, setTender] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedBidForPayment, setSelectedBidForPayment] = useState<any>(null);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [orderData, setOrderData] = useState<CreateOrderResult | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: tenderData } = await supabase
          .from("tenders")
          .select("*, project:projects(*)")
          .eq("id", params.id)
          .single();

        if (tenderData) setTender(tenderData);

        const { data } = await supabase
          .from("bids")
          .select(`
            *,
            contractor:contractors(*),
            cost_breakdown:bid_cost_breakdowns(*)
          `)
          .eq("tender_id", params.id);

        if (data) {
          const formatted = data.map((b: any) => ({
            ...b,
            cost_breakdown: Array.isArray(b.cost_breakdown) ? b.cost_breakdown[0] : b.cost_breakdown,
          }));
          setBids(formatted);
        }
      } catch (err) {
        console.error("Error loading comparison data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  const handleSelectBid = (bid: any) => {
    setSelectedBidForPayment(bid);
    setIsSelectionModalOpen(true);
  };

  const handleProceedToPayment = (createdOrder: CreateOrderResult) => {
    setOrderData(createdOrder);
    setIsSelectionModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Link
            href={`/owner/tenders/${params.id}/bids`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Bids List
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Side-by-Side Contractor Bid Comparison</h1>
          <p className="text-xs text-muted-foreground">
            Compare quotations, timelines, contractor experience, and cost breakdowns for {tender?.title || "Tender"}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading comparison data...
        </div>
      ) : (
        <BidComparisonTable bids={bids} onSelectBid={handleSelectBid} />
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
