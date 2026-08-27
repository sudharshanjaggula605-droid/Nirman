"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Clock, PlusCircle } from "lucide-react";
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

        // Fetch payments for owner projects
        const { data: ownerPayments } = await supabase
          .from("payments")
          .select("*, project:projects(title)")
          .eq("payer_id", user.id)
          .order("created_at", { ascending: false });
        if (ownerPayments) setPayments(ownerPayments);
      } catch (err) {
        console.error("Error loading owner payments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFinances();
  }, []);

  const totalBudget = projects.reduce((acc, p) => acc + (p.estimated_budget || 0), 0);
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + (p.amount || 0), 0);
  const remainingBalance = Math.max(0, totalBudget - totalPaid);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const numAmount = parseFloat(amount || "0");
      const newPayment = {
        project_id: selectedProjectId || null,
        payer_id: user.id,
        title,
        amount: numAmount,
        payment_mode: paymentMode,
        status: "paid",
        paid_at: new Date().toISOString(),
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Project Finances & Payments</h1>
          <p className="text-xs text-muted-foreground">Track total construction expenditure, upcoming milestone dues, and payment records</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Record Milestone Payment
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Project Budget</span>
          <span className="text-2xl font-extrabold text-foreground">{formatCurrency(totalBudget)}</span>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Paid Out</span>
          <span className="text-2xl font-extrabold text-emerald-600">{formatCurrency(totalPaid)}</span>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Remaining Balance</span>
          <span className="text-2xl font-extrabold text-purple-600">{formatCurrency(remainingBalance)}</span>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-base text-foreground border-b pb-3">Disbursement Transactions</h3>

        {payments.length > 0 ? (
          <div className="divide-y text-xs">
            {payments.map((p) => {
              const statusUpper = (p.status || "PAID").toUpperCase();
              return (
                <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-foreground block">{p.title}</span>
                    <span className="text-muted-foreground">Project: {p.project?.title || "Construction Project"} • Mode: {p.payment_mode || "NetBanking"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(p.amount)}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {statusUpper} ({new Date(p.paid_at || p.created_at || Date.now()).toLocaleDateString()})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
            <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="text-xs font-bold text-foreground">No Payment Transactions Recorded</div>
            <p className="text-[11px] text-muted-foreground">Record milestone disbursements to contractors as project construction progresses.</p>
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

              <div className="grid grid-cols-2 gap-3">
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

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="NetBanking">NetBanking / NEFT</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
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
