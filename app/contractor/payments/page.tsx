"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, Clock, Upload, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ContractorPaymentsPage() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  return (
    <div className="space-y-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Contract Value</span>
          <div className="text-2xl font-extrabold text-foreground">₹32,50,000</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Received Disbursements</span>
          <div className="text-2xl font-extrabold text-emerald-600">₹18,00,000</div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Pending Invoice Requests</span>
          <div className="text-2xl font-extrabold text-amber-600">₹8,50,000</div>
        </div>
      </div>

      {/* Payment Requests & History Table */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-foreground border-b pb-3">Payment History & Requests</h3>

        <div className="divide-y text-xs">
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-foreground block">Milestone 2: Ground Floor RCC & Brickwork</span>
              <span className="text-muted-foreground">Invoice #INV-2026-002 • Modern Duplex Villa</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-extrabold text-emerald-600 text-sm">₹10,00,000</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> PAID (15 Jul 2026)
              </span>
            </div>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-foreground block">Milestone 3: Roof Slab & Elevation Plastering</span>
              <span className="text-muted-foreground">Invoice #INV-2026-003 • Modern Duplex Villa</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-extrabold text-amber-600 text-sm">₹8,50,000</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                <Clock className="h-3.5 w-3.5" /> AWAITING APPROVAL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Request Payment Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-foreground">Submit Payment Request</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Select Project</label>
                <select className="w-full rounded-lg border bg-background p-2.5 text-foreground">
                  <option>Modern Duplex Villa Construction</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Select Completed Milestone</label>
                <select className="w-full rounded-lg border bg-background p-2.5 text-foreground">
                  <option>Milestone 3: Roof Slab & Elevation Plastering (₹8,50,000)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Invoice Notes / Remarks</label>
                <textarea placeholder="Add remarks for property owner..." className="w-full rounded-lg border bg-background p-2.5 text-foreground" rows={3} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowInvoiceModal(false)} className="rounded-lg border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-accent">
                Cancel
              </button>
              <button onClick={() => setShowInvoiceModal(false)} className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
