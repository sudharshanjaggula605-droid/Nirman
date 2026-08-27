"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, CheckCircle2, Eye, Mail, Phone, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { approveUserAction, rejectUserAction } from "@/actions/admin";

export default function AdminOwnerApprovalsPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchOwners() {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*, owner:owners(*)")
          .eq("role", "owner")
          .order("created_at", { ascending: false });

        if (profiles) setOwners(profiles);
      } catch (err) {
        console.error("Error fetching owners:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOwners();
  }, []);

  const handleApprove = async (id: string) => {
    setMessage(null);
    const res = await approveUserAction(id);
    if (res?.error) {
      setMessage("Error approving user: " + res.error);
    } else {
      setMessage("Owner approved successfully!");
      setOwners((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "approved" } : o))
      );
    }
  };

  const handleReject = async (id: string) => {
    setMessage(null);
    const res = await rejectUserAction(id);
    if (res?.error) {
      setMessage("Error rejecting user: " + res.error);
    } else {
      setMessage("Owner application rejected.");
      setOwners((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "rejected" } : o))
      );
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Owner Verification & Approvals</h1>
          <p className="text-xs text-slate-400">Review pending Property Owner accounts before granting dashboard access.</p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-amber-500/10 p-4 text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl overflow-hidden">
        {owners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                  <th className="p-3.5">Owner Name & Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Registration Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {owners.map((owner) => {
                  const statusUpper = (owner.status || "PENDING").toUpperCase();
                  return (
                    <tr key={owner.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{owner.full_name}</div>
                        <div className="text-[11px] text-slate-400">{owner.email}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">{owner.phone || owner.owner?.phone || "N/A"}</td>
                      <td className="p-3.5 text-slate-300">{owner.city || owner.owner?.city || "Hyderabad"}, {owner.state || owner.owner?.state || "Telangana"}</td>
                      <td className="p-3.5 text-slate-400">{new Date(owner.created_at).toLocaleDateString()}</td>
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
                                onClick={() => handleApprove(owner.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(owner.id)}
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
            <div className="text-xs font-bold text-white">No Registered Owners</div>
            <p className="text-[11px]">No property owner applications found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
