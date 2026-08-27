"use client";

import { useState, useEffect } from "react";
import { FileText, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminTenderManagementPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchTenders() {
      try {
        const { data } = await supabase
          .from("tenders")
          .select("*, owner:owners(full_name), project:projects(location), bids:bids(count)")
          .order("created_at", { ascending: false });

        if (data) setTenders(data);
      } catch (err) {
        console.error("Error fetching tenders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, []);

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
                      <td className="p-3.5 font-bold text-white">{t.title}</td>
                      <td className="p-3.5 text-slate-300">{t.owner?.full_name || "Property Owner"}</td>
                      <td className="p-3.5 text-slate-400">{t.project?.location || "Hyderabad"}</td>
                      <td className="p-3.5 font-bold text-amber-400">
                        ₹{(t.budget_min / 100000).toFixed(1)}L - ₹{(t.budget_max / 100000).toFixed(1)}L
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">{bidsCount} Bids</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800">
                          <Eye className="h-3.5 w-3.5 text-amber-400" /> Monitor
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
    </div>
  );
}
