"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, Clock, XCircle, Building2, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function ContractorMyBidsPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchContractorBids() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("bids")
          .select("*, tender:tenders(*, project:projects(*), owner:owners(full_name))")
          .eq("contractor_id", user.id)
          .order("submitted_at", { ascending: false });

        if (data) setBids(data);
      } catch (err) {
        console.error("Error fetching contractor bids:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContractorBids();
  }, []);

  const filteredBids = bids.filter((b) => {
    if (activeTab === "all") return true;
    return b.status?.toLowerCase() === activeTab;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Submitted Bids</h1>
          <p className="text-xs text-muted-foreground">Track status, proposals, and owner feedback on your quotes</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto">
        {(["all", "pending", "accepted", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
              activeTab === tab
                ? "bg-orange-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab} {tab === "all" ? `(${bids.length})` : ""}
          </button>
        ))}
      </div>

      {/* Bids List */}
      {filteredBids.length > 0 ? (
        <div className="space-y-4">
          {filteredBids.map((bid) => {
            const statusUpper = (bid.status || "PENDING").toUpperCase();
            return (
              <div key={bid.id} className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{bid.tender?.title || "Construction Tender"}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-orange-500" /> Owner: {bid.tender?.owner?.full_name || "Property Owner"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" /> {bid.tender?.project?.city || "Hyderabad"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        statusUpper === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : statusUpper === "REJECTED"
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}
                    >
                      {statusUpper === "ACCEPTED" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : statusUpper === "REJECTED" ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {statusUpper}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Proposed Quotation</span>
                    <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(bid.quotation_amount || 0)}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Est. Completion</span>
                    <span className="text-sm font-bold text-foreground">{bid.estimated_completion_days || 180} Days</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Submitted Date</span>
                    <span className="text-sm font-bold text-foreground">{new Date(bid.submitted_at || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tender Deadline</span>
                    <span className="text-sm font-bold text-foreground">{bid.tender?.bid_deadline ? new Date(bid.tender.bid_deadline).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Bids Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You haven't submitted any bids in this category yet. Browse active tenders in the marketplace to submit your BOQ proposal.
          </p>
          <div className="pt-2">
            <Link
              href="/contractor/tenders"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
            >
              Browse Active Tenders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
