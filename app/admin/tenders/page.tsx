"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Eye, X, User, Gavel, Calendar, DollarSign, ExternalLink, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminTenderManagementPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Tender Modal State
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [tenderBids, setTenderBids] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchTenders() {
      try {
        let { data, error } = await supabase
          .from("tenders")
          .select("*, owner:owners(full_name), project:projects(*), bids:bids(count)")
          .order("created_at", { ascending: false });

        if (error || !data) {
          const fallback = await supabase
            .from("tenders")
            .select("*")
            .order("created_at", { ascending: false });
          data = fallback.data;
        }

        if (data) setTenders(data);
      } catch (err) {
        console.error("Error fetching tenders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, []);

  const openTenderDetails = async (t: any) => {
    setSelectedTender(t);
    setLoadingBids(true);
    try {
      const { data } = await supabase
        .from("bids")
        .select("*, contractor:contractors(*)")
        .eq("tender_id", t.id)
        .order("submitted_at", { ascending: false });

      setTenderBids(data || []);
    } catch (err) {
      console.error("Error fetching tender bids:", err);
      setTenderBids([]);
    } finally {
      setLoadingBids(false);
    }
  };

  const capitalize = (str?: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tender Monitoring Console</h1>
          <p className="text-xs text-slate-400">Monitor active tenders published by property owners across NIRMAN.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl overflow-hidden">
        {tenders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                  <th className="p-3.5">Tender / Project Title</th>
                  <th className="p-3.5">Owner Name</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Budget Range</th>
                  <th className="p-3.5">Bids Count</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tenders.map((t) => {
                  const bidsCount = t.bids?.[0]?.count ?? 0;
                  const statusUpper = (t.status || "ACTIVE").toUpperCase();

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">{capitalize(t.title)}</td>
                      <td className="p-3.5 text-slate-300">{capitalize(t.owner?.full_name) || "Property Owner"}</td>
                      <td className="p-3.5 text-slate-400">{capitalize(t.project?.location || t.project?.city) || "Hyderabad"}</td>
                      <td className="p-3.5 font-bold text-amber-400">
                        {t.budget_min != null && t.budget_max != null
                          ? `₹${(t.budget_min / 100000).toFixed(1)}L - ₹${(t.budget_max / 100000).toFixed(1)}L`
                          : "Budget Negotiable"}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">{bidsCount} Bids</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => openTenderDetails(t)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-400" /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2 text-slate-400">
            <FileText className="h-8 w-8 text-slate-500 mx-auto" />
            <div className="text-xs font-bold text-white">No Tenders in Database</div>
            <p className="text-[11px]">No active or archived tenders found on the platform.</p>
          </div>
        )}
      </div>

      {/* Selected Tender Details Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
          <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-700/80 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-transparent blur-2xl pointer-events-none" />

            {/* Modal Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-5 shrink-0 relative z-20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-[10px] font-black tracking-wider text-emerald-400 border border-emerald-500/30 uppercase">
                    {selectedTender.status || "ACTIVE"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {capitalize(selectedTender.title)}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTender(null)}
                className="p-2 rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950/50">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget Range</span>
                  <p className="text-base font-black text-amber-400">
                    {selectedTender.budget_min != null && selectedTender.budget_max != null
                      ? `₹${(selectedTender.budget_min / 100000).toFixed(1)}L - ₹${(selectedTender.budget_max / 100000).toFixed(1)}L`
                      : "Negotiable"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property Owner</span>
                  <p className="text-sm font-extrabold text-white truncate">{capitalize(selectedTender.owner?.full_name) || "Property Owner"}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bids Count</span>
                  <p className="text-base font-black text-emerald-400">{tenderBids.length} Submitted</p>
                </div>
              </div>

              {/* Tender Description */}
              {selectedTender.description && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tender Description & Scope</span>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs text-slate-200 leading-relaxed max-h-32 overflow-y-auto">
                    {selectedTender.description}
                  </div>
                </div>
              )}

              {/* Submitted Contractor Bids List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gavel className="h-3.5 w-3.5 text-amber-400" /> Submitted Contractor Bids ({tenderBids.length})
                </span>

                {loadingBids ? (
                  <div className="p-4 text-center text-xs text-slate-500">Loading contractor bids...</div>
                ) : tenderBids.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {tenderBids.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 text-xs transition-all hover:border-amber-500/30"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">{capitalize(b.contractor?.company_name || b.contractor?.contact_person) || "Contractor Firm"}</p>
                          <p className="text-[11px] text-slate-400">Duration: {b.estimated_completion_days || 0} days</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="font-extrabold text-amber-400">
                            {b.quotation_amount != null
                              ? `₹${(b.quotation_amount / 100000).toFixed(2)} Lakhs`
                              : "N/A"}
                          </p>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">{b.status || "PENDING"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                    No contractor bids submitted yet for this tender.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Fixed Footer */}
            <div className="flex justify-between items-center border-t border-slate-800 bg-slate-900/95 px-6 py-4 shrink-0 relative z-20">
              <Link
                href={`/owner/tenders/${selectedTender.id}/compare`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-800"
              >
                Bid Comparison Portal <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setSelectedTender(null)}
                className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
