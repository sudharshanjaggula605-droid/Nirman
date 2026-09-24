"use client";

import { useState } from "react";
import { Users, CheckCircle2, XCircle, Search, ShieldCheck } from "lucide-react";

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState([
    { id: "1", name: "Rajesh Kumar", email: "rajesh@nirman.com", phone: "+91 98490 12345", projects: 2, properties: 2, status: "approved", date: "2026-06-01" },
    { id: "2", name: "Apex Tech Hub", email: "contact@apex.in", phone: "+91 98765 11223", projects: 1, properties: 1, status: "approved", date: "2026-07-15" },
    { id: "3", name: "Sunil Varma", email: "sunil@gmail.com", phone: "+91 91234 56789", projects: 0, properties: 1, status: "pending", date: "2026-08-20" },
  ]);

  const toggleStatus = (id: string) => {
    setOwners(owners.map(o => o.id === id ? { ...o, status: o.status === "approved" ? "suspended" : "approved" } : o));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Property Owners Governance</h1>
          <p className="text-xs text-slate-400">View and manage registered property owner accounts across the platform</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        <div className="divide-y divide-slate-800">
          {owners.map(owner => (
            <div key={owner.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  {owner.name}
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${owner.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                    {owner.status}
                  </span>
                </div>
                <div className="text-slate-400 flex items-center gap-4">
                  <span>Email: <strong className="text-slate-200">{owner.email}</strong></span>
                  <span>Phone: <strong className="text-slate-200">{owner.phone}</strong></span>
                  <span>Projects: <strong className="text-amber-400">{owner.projects}</strong></span>
                </div>
              </div>

              <button
                onClick={() => toggleStatus(owner.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${owner.status === "approved" ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-950" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
              >
                {owner.status === "approved" ? "Suspend Account" : "Approve Owner"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
