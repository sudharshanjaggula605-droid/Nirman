"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Star,
  Clock,
  Building2,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { acceptBidAction } from "@/actions/bids";

export default function ReceivedBidsPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBidsForComparison, setSelectedBidsForComparison] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "compare">("cards");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchOwnerBids() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch owner's tenders
        const { data: tenders } = await supabase
          .from("tenders")
          .select("id, title")
          .eq("owner_id", user.id);

        if (tenders && tenders.length > 0) {
          const tenderIds = tenders.map((t) => t.id);
          const { data: bidsData } = await supabase
            .from("bids")
            .select("*, contractor:contractors(*), tender:tenders(title)")
            .in("tender_id", tenderIds)
            .order("submitted_at", { ascending: false });

          if (bidsData) setBids(bidsData);
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOwnerBids();
  }, []);

  const handleToggleCompare = (bidId: string) => {
    setSelectedBidsForComparison((prev) =>
      prev.includes(bidId) ? prev.filter((id) => id !== bidId) : [...prev, bidId]
    );
  };

  const handleAcceptBid = async (bidId: string) => {
    setActionMessage(null);
    const res = await acceptBidAction(bidId);
    if (res?.error) {
      setActionMessage("Error accepting bid: " + res.error);
    } else {
      setActionMessage("Bid accepted successfully! The project has transitioned to Active status.");
      setBids((prev) =>
        prev.map((b) => (b.id === bidId ? { ...b, status: "accepted" } : b))
      );
    }
  };

  const selectedBidsList = bids.filter((b) =>
    selectedBidsForComparison.length > 0
      ? selectedBidsForComparison.includes(b.id)
      : true
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Received Contractor Bids</h1>
          <p className="text-xs text-muted-foreground">Compare quotations, timelines, and contractor ratings to award your project.</p>
        </div>

        {bids.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("cards")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-card border text-muted-foreground hover:text-foreground"
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode("compare")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewMode === "compare"
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-card border text-muted-foreground hover:text-foreground"
              }`}
            >
              Compare View ({selectedBidsForComparison.length > 0 ? selectedBidsForComparison.length : "All"})
            </button>
          </div>
        )}
      </div>

      {actionMessage && (
        <div className="rounded-xl bg-orange-500/10 p-4 text-xs font-bold text-orange-600 border border-orange-500/20 flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {bids.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <Users className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Bids Received Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Once licensed contractors discover your published active tenders and submit quotations, their bids will appear here for comparison and awarding.
          </p>
          <div className="pt-2">
            <Link
              href="/owner/tenders"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
            >
              View My Tenders
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ===================================================
              MODE 1: CARD VIEW INTERFACE
          =================================================== */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bids.map((bid) => {
                const isCompared = selectedBidsForComparison.includes(bid.id);
                const quotationFormatted = `₹${(bid.quotation_amount / 100000).toFixed(2)} L`;
                const completionMonths = `${Math.round(bid.estimated_completion_days / 30)} months`;

                return (
                  <div
                    key={bid.id}
                    className={`rounded-2xl border bg-card p-6 space-y-4 shadow-sm transition-all relative flex flex-col justify-between ${
                      isCompared ? "ring-2 ring-orange-500 border-orange-500" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Tender Title */}
                      <div className="text-[11px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded-md inline-block">
                        Tender: {bid.tender?.title || "Construction Tender"}
                      </div>

                      {/* Contractor Basic Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold text-base text-foreground">
                            {bid.contractor?.company_name || "Contractor Firm"}
                          </h3>
                          <div className="text-xs text-muted-foreground">
                            Proprietor: {bid.contractor?.contact_person || "Manager"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span>{bid.contractor?.average_rating || 4.8}</span>
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/30 p-3 text-xs border">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">Quotation</span>
                          <span className="font-extrabold text-sm text-foreground">{quotationFormatted}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">Completion Time</span>
                          <span className="font-bold text-sm text-foreground">{completionMonths}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">Experience</span>
                          <span className="font-bold text-foreground">{bid.contractor?.years_of_experience || 10} Years</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold block">Completed</span>
                          <span className="font-bold text-foreground">{bid.contractor?.total_projects || 20} Projects</span>
                        </div>
                      </div>

                      {/* Proposal Snippet */}
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        "{bid.proposal}"
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleToggleCompare(bid.id)}
                          className={`w-full py-2 text-xs font-bold rounded-xl border transition-all ${
                            isCompared
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          {isCompared ? "Selected ✓" : "+ Compare"}
                        </button>
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={bid.status === "accepted"}
                          className="w-full py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                        >
                          {bid.status === "accepted" ? "Accepted ✓" : "Accept Bid"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================================================
              MODE 2: SIDE-BY-SIDE COMPARISON TABLE
          =================================================== */}
          {viewMode === "compare" && (
            <div className="rounded-3xl border bg-card p-6 space-y-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">Contractor Side-by-Side Comparison</h2>
                  <p className="text-xs text-muted-foreground">Easy visual comparison for property owners</p>
                </div>
                <button
                  onClick={() => setViewMode("cards")}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  ← Back to Card View
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-extrabold text-foreground">
                      <th className="p-4 w-48 bg-card sticky left-0 z-10 border-r">Feature / Metric</th>
                      {selectedBidsList.map((bid) => (
                        <th key={bid.id} className="p-4 min-w-[220px] text-center border-r">
                          <div className="font-extrabold text-sm text-foreground">{bid.contractor?.company_name}</div>
                          <div className="text-[11px] text-muted-foreground">{bid.contractor?.contact_person}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {/* Quotation Row */}
                    <tr>
                      <td className="p-4 font-bold text-foreground bg-card sticky left-0 z-10 border-r flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-emerald-500" /> Quotation Amount
                      </td>
                      {selectedBidsList.map((bid) => (
                        <td key={bid.id} className="p-4 text-center border-r font-extrabold text-sm text-foreground">
                          ₹{(bid.quotation_amount / 100000).toFixed(2)} Lakhs
                        </td>
                      ))}
                    </tr>

                    {/* Completion Row */}
                    <tr>
                      <td className="p-4 font-bold text-foreground bg-card sticky left-0 z-10 border-r flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" /> Completion Timeline
                      </td>
                      {selectedBidsList.map((bid) => (
                        <td key={bid.id} className="p-4 text-center border-r font-bold">
                          {Math.round(bid.estimated_completion_days / 30)} Months ({bid.estimated_completion_days} days)
                        </td>
                      ))}
                    </tr>

                    {/* Experience Row */}
                    <tr>
                      <td className="p-4 font-bold text-foreground bg-card sticky left-0 z-10 border-r flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-500" /> Experience
                      </td>
                      {selectedBidsList.map((bid) => (
                        <td key={bid.id} className="p-4 text-center border-r font-bold">
                          {bid.contractor?.years_of_experience || 10} Years
                        </td>
                      ))}
                    </tr>

                    {/* Rating Row */}
                    <tr>
                      <td className="p-4 font-bold text-foreground bg-card sticky left-0 z-10 border-r flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" /> Customer Rating
                      </td>
                      {selectedBidsList.map((bid) => (
                        <td key={bid.id} className="p-4 text-center border-r font-extrabold text-amber-500">
                          ⭐ {bid.contractor?.average_rating || 4.8} / 5.0
                        </td>
                      ))}
                    </tr>

                    {/* Completed Projects Row */}
                    <tr>
                      <td className="p-4 font-bold text-foreground bg-card sticky left-0 z-10 border-r flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-orange-500" /> Completed Projects
                      </td>
                      {selectedBidsList.map((bid) => (
                        <td key={bid.id} className="p-4 text-center border-r font-bold text-foreground">
                          {bid.contractor?.total_projects || 20} Projects
                        </td>
                      ))}
                    </tr>

                    {/* Action Row */}
                    <tr>
                      <td className="p-4 font-bold text-foreground bg-card sticky left-0 z-10 border-r">Action</td>
                      {selectedBidsList.map((bid) => (
                        <td key={bid.id} className="p-4 text-center border-r">
                          <button
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={bid.status === "accepted"}
                            className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                          >
                            {bid.status === "accepted" ? "Accepted ✓" : "Accept Bid"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
