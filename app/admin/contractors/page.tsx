"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { approveUserAction, rejectUserAction } from "@/actions/admin";

export default function AdminContractorApprovalsPage() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchContractors() {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*, contractor:contractors(*)")
          .eq("role", "contractor")
          .order("created_at", { ascending: false });

        if (profiles) setContractors(profiles);
      } catch (err) {
        console.error("Error fetching contractors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContractors();
  }, []);

  const handleApprove = async (id: string) => {
    setMessage(null);
    const res = await approveUserAction(id);
    if (res?.error) {
      setMessage("Error approving contractor: " + res.error);
    } else {
      setMessage("Contractor account approved & verified successfully!");
      setContractors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
      );
    }
  };

  const handleReject = async (id: string) => {
    setMessage(null);
    const res = await rejectUserAction(id);
    if (res?.error) {
      setMessage("Error rejecting contractor: " + res.error);
    } else {
      setMessage("Contractor application rejected.");
      setContractors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c))
      );
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Contractor Partner Verification & Approvals</h1>
          <p className="text-xs text-slate-400">Review business registration, GST numbers, and contractor licenses.</p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-amber-500/10 p-4 text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl overflow-hidden">
        {contractors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                  <th className="p-3.5">Company & Contact Person</th>
                  <th className="p-3.5">Experience & Projects</th>
                  <th className="p-3.5">GST / License No</th>
                  <th className="p-3.5">Registration Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {contractors.map((c) => {
                  const statusUpper = (c.status || "PENDING").toUpperCase();
                  const comp = c.contractor || {};

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{comp.company_name || "Company Firm"}</div>
                        <div className="text-[11px] text-slate-400">Contact: {c.full_name} • {c.email}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div><strong className="text-white">{comp.years_of_experience || 0} Yrs</strong> Exp</div>
                        <div className="text-[11px] text-slate-400">{comp.total_projects || 0} Completed Projects</div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                        <div>GST: {comp.gst_number || "N/A"}</div>
                        <div className="text-slate-400">LIC: {comp.license_number || "N/A"}</div>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          statusUpper === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : statusUpper === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {statusUpper === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(c.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                              >
                                Approve & Verify
                              </button>
                              <button
                                onClick={() => handleReject(c.id)}
                                className="rounded-lg bg-rose-900/60 text-rose-300 border border-rose-700/50 px-3 py-1 text-xs font-bold hover:bg-rose-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2 text-slate-400">
            <UserCheck className="h-8 w-8 text-slate-500 mx-auto" />
            <div className="text-xs font-bold text-white">No Registered Contractors</div>
            <p className="text-[11px]">No contractor applications found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
