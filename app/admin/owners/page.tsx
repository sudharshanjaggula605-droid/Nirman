"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, CheckCircle2, Eye, Mail, Phone, MapPin, Trash2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { approveUserAction, deleteUserAction, getAllAdminUsersAction } from "@/actions/admin";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { UserDetailsModal } from "@/components/admin/user-details-modal";

export default function AdminOwnerApprovalsPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);

  const supabase = createClient();

  const fetchOwners = async () => {
    try {
      const res = await getAllAdminUsersAction();
      if (res.success && res.users) {
        setOwners(res.users.filter((u: any) => u.role === "owner"));
      }
    } catch (err) {
      console.error("Error fetching owners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleApprove = async (id: string) => {
    setMessage(null);
    const res = await approveUserAction(id);
    if (res?.error) {
      setMessage("Error approving user: " + res.error);
    } else {
      const deliveryInfo = res?.channelSummary ? ` (${res.channelSummary})` : "";
      setMessage(`Owner approved successfully!${deliveryInfo}`);
      setOwners((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "approved" } : o))
      );
    }
  };

  const handleReject = async (id: string) => {
    setMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) {
        setMessage("Error rejecting owner: " + error.message);
      } else {
        setMessage("Owner application rejected.");
        setOwners((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: "rejected" } : o))
        );
      }
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setMessage(null);
    const res = await deleteUserAction(userToDelete.id);
    if (res?.error) {
      setMessage("Error deleting owner: " + res.error);
    } else {
      setMessage("Owner account permanently deleted.");
      setOwners((prev) => prev.filter((o) => o.id !== userToDelete.id));
    }
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-slate-100">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
            <UserCheck className="h-3.5 w-3.5" /> Property Owners Directory
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Property Owners
          </h1>
          <p className="text-xs text-slate-400">
            Review, verify, manage, or delete registered Property Owner accounts.
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-amber-500/10 p-4 text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 space-y-4 shadow-xl overflow-hidden">
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
                        <button
                          type="button"
                          onClick={() => setSelectedUserForModal(owner)}
                          className="text-left group cursor-pointer focus:outline-none"
                          title="Click to view complete details"
                        >
                          <div className="font-bold text-white group-hover:text-amber-400 group-hover:underline underline-offset-2 flex items-center gap-1.5 transition-colors">
                            <span>{owner.full_name || "Owner User"}</span>
                            <Eye className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-amber-400 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-slate-400">{owner.email}</div>
                        </button>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">{owner.phone || owner.owner?.phone || "N/A"}</td>
                      <td className="p-3.5 text-slate-300">
                        {owner.city || owner.owner?.city || "Hyderabad"},{" "}
                        {owner.state || owner.owner?.state || "Telangana"}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {owner.created_at ? new Date(owner.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            statusUpper === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : statusUpper === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForModal(owner)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors cursor-pointer"
                            title="View Owner Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {statusUpper === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(owner.id)}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(owner.id)}
                                className="rounded-lg bg-rose-900/60 text-rose-300 border border-rose-700/50 px-2.5 py-1 text-xs font-bold hover:bg-rose-900 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setUserToDelete(owner)}
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Owner Account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUserForModal}
        isOpen={!!selectedUserForModal}
        onClose={() => setSelectedUserForModal(null)}
        onApprove={handleApprove}
        onDelete={setUserToDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Property Owner"
        itemName={userToDelete?.full_name || userToDelete?.email}
        role="Property Owner"
      />
    </div>
  );
}
