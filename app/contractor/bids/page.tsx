"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, Clock, XCircle, ArrowUpRight, Building2, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const SAMPLE_BIDS = [
  {
    id: "bid-1",
    tender_title: "Modern Duplex Villa Construction",
    owner_name: "Rajesh Kumar",
    city: "Hyderabad, Telangana",
    quotation_amount: 3250000,
    completion_days: 180,
    submitted_at: "2026-08-20",
    deadline: "2026-09-15",
    status: "accepted",
  },
  {
    id: "bid-2",
    tender_title: "Commercial IT Office Fit-out & Interior",
    owner_name: "Apex Tech Hub",
    city: "Bengaluru, Karnataka",
    quotation_amount: 4800000,
    completion_days: 90,
    submitted_at: "2026-08-22",
    deadline: "2026-09-20",
    status: "pending",
  },
  {
    id: "bid-3",
    tender_title: "Luxury Apartment Facade Facelift",
    owner_name: "Priya Sharma",
    city: "Mumbai, Maharashtra",
    quotation_amount: 7800000,
    completion_days: 120,
    submitted_at: "2026-08-18",
    deadline: "2026-09-10",
    status: "rejected",
  },
];

export default function ContractorMyBidsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  const filteredBids = SAMPLE_BIDS.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  return (
    <div className="space-y-6">
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
            {tab} {tab === "all" ? `(${SAMPLE_BIDS.length})` : ""}
          </button>
        ))}
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.map((bid) => (
          <div key={bid.id} className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">{bid.tender_title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-orange-500" /> Owner: {bid.owner_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" /> {bid.city}
                  </span>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    bid.status === "accepted"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : bid.status === "rejected"
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {bid.status === "accepted" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : bid.status === "rejected" ? (
                    <XCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {bid.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-2.5 rounded-lg bg-muted/30 border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Proposed Quotation</span>
                <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(bid.quotation_amount)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Est. Completion</span>
                <span className="text-sm font-bold text-foreground">{bid.completion_days} Days</span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Submitted Date</span>
                <span className="text-sm font-bold text-foreground">{bid.submitted_at}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tender Deadline</span>
                <span className="text-sm font-bold text-foreground">{bid.deadline}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
