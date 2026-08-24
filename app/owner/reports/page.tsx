"use client";

import { BarChart3, Download, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function OwnerReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project & Spending Analytics</h1>
          <p className="text-xs text-muted-foreground">Comprehensive expenditure breakdown, contractor performance metrics, and timeline reports</p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700">
          <Download className="h-4 w-4" /> Export Financial Statement (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-card space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Total Project Commitments</span>
          <span className="text-2xl font-extrabold text-foreground">₹35,00,000</span>
        </div>

        <div className="p-5 rounded-2xl border bg-card space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Disbursed Funds</span>
          <span className="text-2xl font-extrabold text-emerald-600">₹18,00,000</span>
        </div>

        <div className="p-5 rounded-2xl border bg-card space-y-1 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase block">Budget Variance</span>
          <span className="text-2xl font-extrabold text-blue-600">- 7.1% (Under Budget)</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-foreground border-b pb-3">Contractor Performance Breakdown</h3>
        <div className="p-4 rounded-xl bg-muted/30 border space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">BuildPro Constructions Pvt Ltd</span>
            <span className="font-extrabold text-emerald-600">4.9 / 5.0 Rating</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-muted-foreground">
            <div>On-time Delivery: <strong className="text-foreground">98%</strong></div>
            <div>Quality Rating: <strong className="text-foreground">4.9/5</strong></div>
            <div>Safety Compliance: <strong className="text-foreground">100%</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
