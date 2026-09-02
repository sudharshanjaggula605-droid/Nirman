"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Clock, PlusCircle, ShieldCheck, AlertCircle, RefreshCw, QrCode } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function OwnerPaymentsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("NetBanking");

  const supabase = createClient();

  useEffect(() => {
    async function loadFinances() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch owner projects
        const { data: ownerProjects } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id);
        if (ownerProjects) {
          setProjects(ownerProjects);
          if (ownerProjects.length > 0) setSelectedProjectId(ownerProjects[0].id);
        }

        // Fetch payments for owner
        const { data: ownerPayments } = await supabase
          .from("payments")
          .select("*, project:projects(title)")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (ownerPayments) {
          setPayments(ownerPayments);
        } else {
          // Fallback to payer_id if schema column differs
          const { data: altPayments } = await supabase
            .from("payments")
            .select("*, project:projects(title)")
            .eq("payer_id", user.id)
            .order("created_at", { ascending: false });
          if (altPayments) setPayments(altPayments);
        }
      } catch (err) {
        console.error("Error loading owner payments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFinances();
  }, []);

  const totalPaidSelectionFees = payments
    .filter((p) => p.payment_type === "CONTRACTOR_SELECTION_FEE" && p.status === "paid")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalPaidMilestones = payments
    .filter((p) => p.payment_type !== "CONTRACTOR_SELECTION_FEE" && p.status === "paid")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalPaid = totalPaidSelectionFees + totalPaidMilestones;

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const numAmount = parseFloat(amount || "0");
      const newPayment = {
        project_id: selectedProjectId || null,
        owner_id: user.id,
        amount: numAmount,
        payment_type: "PROJECT_MILESTONE",
        description: title,
        status: "paid",
        payment_date: new Date().toISOString(),
      };

      const { data } = await supabase.from("payments").insert(newPayment).select("*, project:projects(title)").single();
      if (data) {
        setPayments([data, ...payments]);
      }
      setShowAddModal(false);
      setTitle("");
      setAmount("");
    } catch (err) {
      console.error("Error recording payment:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Project Finances & Payments</h1>
          <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">Track NIRMAN selection fees, escrow records, and construction disbursements</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all w-full sm:w-auto shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" /> Record Milestone Payment
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Platform Selection Fees</span>
          <span className="text-2xl font-extrabold text-amber-500">{formatCurrency(totalPaidSelectionFees)}</span>
          <span className="text-[10px] text-muted-foreground block">₹199 per awarded project</span>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Milestone Disbursements</span>
          <span className="text-2xl font-extrabold text-emerald-600">{formatCurrency(totalPaidMilestones)}</span>
          <span className="text-[10px] text-muted-foreground block">Construction escrow funds</span>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Outflow</span>
          <span className="text-2xl font-extrabold text-foreground">{formatCurrency(totalPaid)}</span>
          <span className="text-[10px] text-muted-foreground block">Verified platform transactions</span>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-extrabold text-base text-foreground">Transaction & Selection Fee History</h3>
          <span className="text-xs text-muted-foreground font-medium">{payments.length} Records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading payment records...</div>
        ) : payments.length > 0 ? (
          <div className="divide-y text-xs">
            {payments.map((p) => {
              let txnRef: any = {};
              try {
                txnRef =
                  typeof p.transaction_reference === "string"
                    ? JSON.parse(p.transaction_reference)
                    : p.transaction_reference || {};
              } catch {}

              const isSelectionFee = p.payment_type === "CONTRACTOR_SELECTION_FEE";
              const isStaticQrPending = p.status === "pending" && (txnRef.payment_method === "static_qr" || !!txnRef.utr_number);
              const statusDisplay = isStaticQrPending
                ? "PENDING VERIFICATION"
                : (p.status || "PAID").toUpperCase();

              return (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {isSelectionFee ? "Platform Contractor Selection Fee" : p.description || p.title || "Project Milestone"}
                      </span>
                      {isSelectionFee && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-[10px] border border-amber-500/20">
                          Selection Fee
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-[11px]">
                      <span>Project: <strong>{p.project?.title || "Construction Project"}</strong></span>
                      <span>Payment ID: <strong className="font-mono">{p.id.slice(0, 8)}...</strong></span>
                      <span>Method: <strong className="uppercase">{txnRef.payment_method || p.payment_mode || "Razorpay"}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:text-right shrink-0">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-foreground text-base block">{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        {new Date(p.payment_date || p.paid_at || p.created_at || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {statusDisplay === "PAID" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> PAID
                      </span>
                    ) : statusDisplay === "PENDING VERIFICATION" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                        <Clock className="h-3.5 w-3.5" /> PENDING VERIFICATION
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                        <AlertCircle className="h-3.5 w-3.5" /> {statusDisplay}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
            <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="text-xs font-bold text-foreground">No Payment Transactions Recorded</div>
            <p className="text-[11px] text-muted-foreground">Platform selection fees and milestone payments will appear here.</p>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md space-y-5 rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-extrabold text-foreground">Record Milestone Disbursement</h2>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Select Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Milestone / Transaction Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Milestone 1: Foundation RCC Slab"
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="800000"
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-bold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
