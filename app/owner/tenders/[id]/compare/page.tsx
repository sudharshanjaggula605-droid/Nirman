"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Layers } from "lucide-react";
import Link from "next/link";
import { BidComparisonTable } from "@/components/bid-comparison-table";
import { acceptBidAction } from "@/actions/bids";
import { createClient } from "@/lib/supabase/client";

interface CompareBidsPageProps {
  params: { id: string };
}

export default function CompareBidsPage({ params }: CompareBidsPageProps) {
  const router = useRouter();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadBids() {
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
      setLoading(false);
    }

    loadBids();
  }, [params.id]);

  const handleAcceptBid = async (bidId: string) => {
    const result = await acceptBidAction(bidId);
    if (result.success) {
      router.push("/owner/dashboard");
      router.refresh();
    } else if (result.error) {
      alert(`Error accepting bid: ${result.error}`);
    }
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
            Compare quotations, timelines, contractor experience, and cost breakdowns side-by-side.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading comparison data...
        </div>
      ) : (
        <BidComparisonTable bids={bids} onAcceptBid={handleAcceptBid} />
      )}
    </div>
  );
}
