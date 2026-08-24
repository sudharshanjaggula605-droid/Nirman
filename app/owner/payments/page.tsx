"use client";

import { CreditCard, CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function OwnerPaymentsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Project Finances & Payments</h1>
        <p className="text-xs text-muted-foreground">Track total construction expenditure, upcoming milestone dues, and payment records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Project Budget</span>
          <span className="text-2xl font-extrabold text-foreground">₹35,00,000</span>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Contract Value</span>
          <span className="text-2xl font-extrabold text-orange-600">₹32,50,000</span>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Paid Out</span>
          <span className="text-2xl font-extrabold text-emerald-600">₹18,00,000</span>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Remaining Balance</span>
          <span className="text-2xl font-extrabold text-purple-600">₹14,50,000</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-foreground border-b pb-3">Disbursement Transactions</h3>

        <div className="divide-y text-xs">
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-foreground block">Milestone 1: Foundation & Basement RCC</span>
              <span className="text-muted-foreground">Contractor: BuildPro Constructions • Paid via NetBanking</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-extrabold text-emerald-600 text-sm">₹8,00,000</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> PAID (30 Jun)
              </span>
            </div>
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-foreground block">Milestone 2: Ground Floor RCC & Brickwork</span>
              <span className="text-muted-foreground">Contractor: BuildPro Constructions • Paid via NetBanking</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-extrabold text-emerald-600 text-sm">₹10,00,000</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> PAID (15 Jul)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
