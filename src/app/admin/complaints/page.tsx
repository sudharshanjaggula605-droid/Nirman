"use client";

import { useState } from "react";
import { AlertOctagon, CheckCircle2, MessageSquare } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([
    { id: "CMP-101", user: "Rajesh Kumar", project: "Modern Duplex Villa", category: "Milestone Delay", desc: "Contractor delayed elevation plastering by 5 days.", status: "under_review", date: "2026-08-22" },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Dispute & Complaints Management</h1>
        <p className="text-xs text-slate-400">Review owner-contractor disputes, quality complaints, and milestone delay inquiries</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        <div className="divide-y divide-slate-800 text-xs">
          {complaints.map(c => (
            <div key={c.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{c.id} • {c.category} ({c.project})</span>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 uppercase text-[10px]">
                  {c.status}
                </span>
              </div>
              <p className="text-slate-300">{c.desc}</p>
              <div className="text-[10px] text-slate-400">Reported by {c.user} on {c.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
