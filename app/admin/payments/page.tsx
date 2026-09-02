"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Loader2,
  ExternalLink,
  Settings,
  HardHat,
  Building2,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAdminPaymentsOverviewAction, adminReconcilePaymentAction } from "@/actions/payments";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Reconcile Modal State
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [reconcileDecision, setReconcileDecision] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await getAdminPaymentsOverviewAction();
      if (res.success) {
        setPayments(res.payments || []);
        setStats(res.stats || null);
      }
    } catch (err) {
      console.error("Error loading admin payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleOpenInspect = (payment: any) => {
    setSelectedPayment(payment);
    setInspectModalOpen(true);
    setReconcileDecision(null);
    setRejectReason("");
    setActionMessage(null);
  };

  const handleReconcile = async (decision: "approve" | "reject") => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    setActionMessage(null);

    try {
      const res = await adminReconcilePaymentAction({
        paymentId: selectedPayment.id,
        decision,
        reason: decision === "reject" ? rejectReason : undefined,
      });

      if (res.error) {
        setActionMessage({ text: res.error, type: "error" });
      } else {
        setActionMessage({
          text: decision === "approve" ? "Payment approved and verified as PAID!" : "Payment marked as rejected.",
          type: "success",
        });
        await fetchOverview();
        setTimeout(() => {
          setInspectModalOpen(false);
        }, 1200);
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Failed to reconcile payment", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesFilter =
      statusFilter === "ALL" ||
      p.displayStatus === statusFilter ||
      p.status?.toUpperCase() === statusFilter;

    const matchesSearch =
      !searchQuery ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contractor?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.txnRef?.utr_number?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Governance & Selection Fees</h1>
          <p className="text-xs text-slate-400">
            Monitor NIRMAN ₹199 platform contractor selection fees, Razorpay gateway logs, and Static QR bank reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>

          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:from-orange-700 hover:to-amber-700 transition-all"
          >
            <Settings className="h-3.5 w-3.5" /> Payment Settings
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-lg col-span-2 sm:col-span-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Selection Fees</span>
          <span className="text-2xl font-black text-amber-400">{formatCurrency(stats?.totalSelectionFees || 0)}</span>
          <span className="text-[10px] text-slate-500 block">₹199 per verified appointment</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Paid</span>
          <span className="text-xl font-black text-emerald-400">{stats?.paidCount || 0}</span>
          <span className="text-[10px] text-slate-500 block">Verified & Active</span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pending Verif.</span>
          <span className="text-xl font-black text-amber-300">{stats?.pendingVerificationCount || 0}</span>
          <span className="text-[10px] text-amber-400/70 block">Static QR UTRs</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
          <span className="text-xl font-black text-slate-300">{stats?.pendingCount || 0}</span>
          <span className="text-[10px] text-slate-500 block">Awaiting payment</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Failed</span>
          <span className="text-xl font-black text-rose-400">{stats?.failedCount || 0}</span>
          <span className="text-[10px] text-slate-500 block">Rejected / Expired</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Refunded</span>
          <span className="text-xl font-black text-slate-400">0</span>
          <span className="text-[10px] text-slate-500 block">None requested</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Payment ID, Project, Owner, UTR..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {["ALL", "PAID", "PENDING_VERIFICATION", "PENDING", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL"
                ? "All"
                : st === "PENDING_VERIFICATION"
                ? "Needs Verification"
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-4">Payment ID & Type</th>
                <th className="p-4">Project</th>
                <th className="p-4">Owner (Payer)</th>
                <th className="p-4">Contractor (Payee)</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method / UTR</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading payment records...
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((p) => {
                  const isSelectionFee = p.payment_type === "CONTRACTOR_SELECTION_FEE";
                  const isStaticQrPending = p.displayStatus === "PENDING_VERIFICATION";

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-white block">{p.id.slice(0, 10)}...</span>
                          <span className="text-[10px] text-amber-400 font-semibold block">
                            {isSelectionFee ? "Selection Fee (₹199)" : "Milestone Payment"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-200 block truncate max-w-[160px]" title={p.project?.title}>
                          {p.project?.title || "Construction Project"}
                        </span>
                        <span className="text-[10px] text-slate-500">{p.project?.city || "Hyderabad"}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-300 block">{p.owner?.full_name || "Owner"}</span>
                        <span className="text-[10px] text-slate-500">{p.owner?.company_name || "Individual"}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-amber-400 block">{p.contractor?.company_name || "Contractor"}</span>
                        <span className="text-[10px] text-slate-500">{p.contractor?.contact_person}</span>
                      </td>

                      <td className="p-4 font-black text-emerald-400 text-sm">
                        {formatCurrency(p.amount || 199)}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-300 block uppercase">
                          {p.txnRef?.payment_method || "Razorpay"}
                        </span>
                        {p.txnRef?.utr_number && (
                          <span className="font-mono text-[10px] text-amber-400 block">
                            UTR: {p.txnRef.utr_number}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {p.displayStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> PAID
                          </span>
                        ) : isStaticQrPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 font-extrabold border border-amber-500/30 text-[10px] animate-pulse">
                            <Clock className="h-3 w-3" /> VERIF. REQUIRED
                          </span>
                        ) : p.displayStatus === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[10px]">
                            <AlertCircle className="h-3 w-3" /> FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-bold text-[10px]">
                            <Clock className="h-3 w-3" /> {p.displayStatus}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(p.created_at || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenInspect(p)}
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-extrabold transition-all cursor-pointer ${
                            isStaticQrPending
                              ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          <Eye className="h-3 w-3" /> {isStaticQrPending ? "Reconcile" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No payment transactions match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT & RECONCILE MODAL */}
      {inspectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Payment Transaction Details</h3>
                  <p className="font-mono text-[10px] text-slate-400">ID: {selectedPayment.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {actionMessage && (
                <div
                  className={`p-3.5 rounded-xl border font-semibold flex items-center gap-2 ${
                    actionMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  {actionMessage.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Payment Type:</span>
                  <span className="font-bold text-amber-400">
                    {selectedPayment.payment_type === "CONTRACTOR_SELECTION_FEE"
                      ? "Platform Contractor Selection Fee (₹199)"
                      : "Milestone Payment"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Project:</span>
                  <span className="font-bold text-white">{selectedPayment.project?.title || "Construction Project"}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Owner (Payer):</span>
                  <span className="font-bold text-white">{selectedPayment.owner?.full_name || "Owner"}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Contractor Appointed:</span>
                  <span className="font-bold text-amber-400">{selectedPayment.contractor?.company_name || "Contractor"}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-black text-emerald-400 text-sm">{formatCurrency(selectedPayment.amount || 199)}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-bold text-white uppercase">{selectedPayment.txnRef?.payment_method || "Razorpay"}</span>
                </div>

                {selectedPayment.txnRef?.utr_number && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-amber-300 font-bold">Static QR UTR / Ref:</span>
                    <span className="font-mono font-black text-amber-400 text-sm">{selectedPayment.txnRef.utr_number}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-extrabold text-white uppercase">{selectedPayment.displayStatus}</span>
                </div>
              </div>

              {/* RECONCILIATION ACTIONS (FOR STATIC QR / PENDING) */}
              {selectedPayment.displayStatus === "PENDING_VERIFICATION" && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Bank Reconciliation Required</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Verify that ₹199 was credited to NIRMAN UPI account with UTR: <strong className="font-mono text-amber-300">{selectedPayment.txnRef?.utr_number}</strong>.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReconcile("approve")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-4 w-4" />}
                      Verify & Approve (Mark PAID)
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setReconcileDecision("reject")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/20 border border-rose-500/40 py-2.5 text-xs font-black text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> Reject Invalid UTR
                    </button>
                  </div>

                  {reconcileDecision === "reject" && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="text-[11px] font-bold text-rose-400">Reason for Rejection *</label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. UTR reference not found in bank statement"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="button"
                        disabled={isProcessing || !rejectReason.trim()}
                        onClick={() => handleReconcile("reject")}
                        className="w-full rounded-xl bg-rose-600 py-2 text-xs font-black text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-800 bg-slate-950 px-6 py-4">
              <button
                type="button"
                onClick={() => setInspectModalOpen(false)}
                className="rounded-xl border border-slate-800 px-5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
