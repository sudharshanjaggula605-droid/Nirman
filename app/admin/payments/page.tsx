"use client";

import { CreditCard, CheckCircle2, TrendingUp } from "lucide-react";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Financial Transactions & Escrow Governance</h1>
        <p className="text-xs text-slate-400">Track total platform transaction volume, escrow disbursements, and transaction logs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase block">Gross Transaction Volume</span>
          <span className="text-2xl font-extrabold text-white">₹82,50,000</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase block">Disbursed Escrow Funds</span>
          <span className="text-2xl font-extrabold text-emerald-400">₹48,00,000</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-1 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase block">Platform Fee Revenue (1.5%)</span>
          <span className="text-2xl font-extrabold text-amber-400">₹1,23,750</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">Recent Escrow Transactions</h3>

        <div className="divide-y divide-slate-800 text-xs">
          <div className="py-3 flex justify-between items-center text-slate-300">
            <div>
              <span className="font-bold text-white block">TXN #998241 • Modern Duplex Villa Milestone 2</span>
              <span>Payer: Rajesh Kumar (Owner) → Recipient: BuildPro Constructions</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-emerald-400 text-sm block">₹10,00,000</span>
              <span className="text-[10px] text-slate-400">Status: CLEARED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
