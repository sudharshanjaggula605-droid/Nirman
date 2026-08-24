"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Building2, Check, X, Clock } from "lucide-react";
import { approveUserAction, rejectUserAction } from "@/actions/admin";
import { createClient } from "@/lib/supabase/client";

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchPending() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) {
        setPendingUsers(data);
      }
      setLoading(false);
    }

    fetchPending();
  }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    const res = await approveUserAction(userId);
    if (res.success) {
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
      router.refresh();
    } else {
      alert(`Error approving user: ${res.error}`);
    }
    setActionLoading(null);
  };

  const handleReject = async (userId: string) => {
    const reason = prompt("Enter rejection reason:", "Registration details incomplete.");
    if (reason !== null) {
      setActionLoading(userId);
      const res = await rejectUserAction(userId, reason);
      if (res.success) {
        setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
        router.refresh();
      } else {
        alert(`Error rejecting user: ${res.error}`);
      }
      setActionLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 max-w-5xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Account Approvals</h1>
          <p className="text-xs text-muted-foreground">
            Review registration applications for Property Owners and Contractors.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading pending registrations...
        </div>
      ) : pendingUsers.length > 0 ? (
        <div className="space-y-4">
          {pendingUsers.map((u) => (
            <div key={u.id} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold capitalize ${
                    u.role === "owner" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                  }`}>
                    {u.role === "owner" ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                    {u.role} Application
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Applied: {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="font-bold text-base text-foreground">{u.full_name}</div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
                  <span>Email: <strong className="text-foreground">{u.email}</strong></span>
                  <span>Phone: {u.phone || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleReject(u.id)}
                  disabled={actionLoading === u.id}
                  className="flex items-center gap-1 rounded-lg border border-destructive/30 px-3.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(u.id)}
                  disabled={actionLoading === u.id}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Check className="h-4 w-4" /> {actionLoading === u.id ? "Approving..." : "Approve Account"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground space-y-2">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-sm text-foreground">No pending approvals</h3>
          <p className="text-xs">All user applications have been processed.</p>
        </div>
      )}
    </div>
  );
}
