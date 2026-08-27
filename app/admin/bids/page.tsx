"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Gavel, Search, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminBidsMonitoringPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchBids() {
      try {
        const { data } = await supabase
          .from("bids")
          .select("*, contractor:contractors(*), tender:tenders(title, owner_id, project:projects(location))")
          .order("submitted_at", { ascending: false });

        if (data) {
          setBids(data);
        }
      } catch (err) {
        console.error("Error fetching admin bids:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBids();
  }, []);

  // Filtering
  const filteredBids = bids.filter((b) => {
    const query = searchQuery.toLowerCase();
    const tenderMatch = b.tender?.title?.toLowerCase().includes(query);
    const contractorMatch = b.contractor?.company_name?.toLowerCase().includes(query) || b.contractor?.contact_person?.toLowerCase().includes(query);
    const matchesSearch = !searchQuery || tenderMatch || contractorMatch;

    const matchesStatus = statusFilter === "ALL" || b.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Gavel className="h-6 w-6 text-amber-400" /> Bids Monitoring Console
          </h1>
          <p className="text-xs text-slate-400">Track and monitor all contractor quotations submitted across NIRMAN tenders.</p>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-extrabold text-amber-400">{filteredBids.length}</span> contractor bids
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tender title or contractor..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">Status Filter:</span>
          {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                statusFilter === st
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bids Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl overflow-hidden">
        {filteredBids.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                  <th className="p-3.5">Tender Title</th>
                  <th className="p-3.5">Contractor Company</th>
                  <th className="p-3.5">Quotation Amount</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Submitted Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredBids.map((b) => {
                  const statusUpper = (b.status || "PENDING").toUpperCase();
                  const quotationFormatted = `₹${(b.quotation_amount / 100000).toFixed(2)} Lakhs`;
                  const durationMonths = `${Math.round(b.estimated_completion_days / 30)} Months (${b.estimated_completion_days} days)`;

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{b.tender?.title || "Tender"}</div>
                        <div className="text-[11px] text-slate-400">{b.tender?.project?.location || "Hyderabad"}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-amber-400">{b.contractor?.company_name || "Contractor Firm"}</div>
                        <div className="text-[11px] text-slate-400">{b.contractor?.contact_person}</div>
                      </td>
                      <td className="p-3.5 font-extrabold text-white">{quotationFormatted}</td>
                      <td className="p-3.5 text-slate-300">{durationMonths}</td>
                      <td className="p-3.5 text-slate-400">{new Date(b.submitted_at).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          statusUpper === "ACCEPTED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : statusUpper === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href="/admin/tenders"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-400" /> Monitor Tender
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2 text-slate-400">
            <Gavel className="h-8 w-8 text-slate-500 mx-auto" />
            <div className="text-xs font-bold text-white">No Submitted Bids</div>
            <p className="text-[11px]">No contractor bids match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
