"use client";

import { Building2, Eye, ShieldCheck } from "lucide-react";

export default function AdminProjectsPage() {
  const PROJECTS = [
    { id: "1", title: "Modern Duplex Villa Construction", owner: "Rajesh Kumar", contractor: "BuildPro Constructions", city: "Hyderabad", budget: "₹35,00,000", status: "active", progress: "65%" },
    { id: "2", title: "Commercial IT Office Fit-out", owner: "Apex Tech Hub", contractor: "Unassigned (Tender Active)", city: "Bengaluru", budget: "₹50,00,000", status: "tender", progress: "0%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Construction Projects</h1>
          <p className="text-xs text-slate-400">Monitor all active, awarded, and tender-stage construction projects nationwide</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        <div className="divide-y divide-slate-800 text-xs">
          {PROJECTS.map(p => (
            <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  {p.title}
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${p.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                    {p.status}
                  </span>
                </div>
                <div className="text-slate-400 flex items-center gap-4">
                  <span>Owner: <strong className="text-slate-200">{p.owner}</strong></span>
                  <span>Contractor: <strong className="text-slate-200">{p.contractor}</strong></span>
                  <span>Budget: <strong className="text-amber-400">{p.budget}</strong></span>
                  <span>Progress: <strong className="text-emerald-400">{p.progress}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
