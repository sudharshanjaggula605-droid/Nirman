"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Clock, PlusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function ContractorPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadPayments() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch payments for contractor
        const { data } = await supabase
          .from("payments")
          .select("*, project:projects(title)")
          .order("created_at", { ascending: false });

        if (data) setPayments(data);
      } catch (err) {
        console.error("Error loading contractor payments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const totalReceived = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingRequests = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + (p.amount || 0), 0);

  const handleRequestPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPayment = {
        title,
        amount: parseFloat(amount || "0"),
        status: "pending",
        payment_mode: "NetBanking",
        created_at: new Date().toISOString(),
      };

      const { data } = await supabase.from("payments").insert(newPayment).select().single();
      if (data) {
        setPayments([data, ...payments]);
      }
      setShowInvoiceModal(false);
      setTitle("");
      setAmount("");
    } catch (err) {
      console.error("Error submitting invoice request:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments & Invoicing</h1>
          <p className="text-xs text-muted-foreground">View payment history and submit milestone invoice requests to property owners</p>
        </div>

        <button
          onClick={() => setShowInvoiceModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
        >
          <CreditCard className="h-4 w-4" /> Request Milestone Payment
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Received Disbursements</span>
          <div className="text-2xl font-extrabold text-emerald-600">{formatCurrency(totalReceived)}</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Pending Invoice Requests</span>
          <div className="text-2xl font-extrabold text-amber-600">{formatCurrency(pendingRequests)}</div>
        </div>
      </div>

      {/* Payment Requests & History Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-foreground border-b pb-3">Payment History & Requests</h3>

        {payments.length > 0 ? (
          <div className="divide-y text-xs">
            {payments.map((p) => {
              const statusUpper = (p.status || "PENDING").toUpperCase();
              return (
                <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-foreground block">{p.title}</span>
                    <span className="text-muted-foreground">Project: {p.project?.title || "Construction Project"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(p.amount || 0)}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                      statusUpper === "PAID"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}>
                      {statusUpper === "PAID" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {statusUpper}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
            <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="text-xs font-bold text-foreground">No Payments Recorded</div>
            <p className="text-[11px] text-muted-foreground">Your milestone payout requests and receipts will appear here.</p>
          </div>
        )}
      </div>

      {/* Request Payment Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-foreground">Submit Milestone Invoice Request</h3>
            <form onSubmit={handleRequestPayment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Milestone / Invoice Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Milestone 2: RCC Framing Completion"
                  className="w-full rounded-lg border bg-background p-2.5 text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Requested Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500000"
                  className="w-full rounded-lg border bg-background p-2.5 text-foreground font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="rounded-lg border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
