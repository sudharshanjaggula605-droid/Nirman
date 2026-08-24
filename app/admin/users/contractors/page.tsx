"use client";

import { useState } from "react";
import { UserCheck, ShieldCheck, Star } from "lucide-react";

export default function AdminContractorsPage() {
  const [contractors, setContractors] = useState([
    { id: "1", company: "BuildPro Constructions Pvt Ltd", contact: "Ramesh Varma", email: "ramesh@buildpro.in", rating: 4.9, status: "verified" },
    { id: "2", name: "Modern Infra Systems", contact: "Kiran Rao", email: "kiran@infra.in", rating: 4.6, status: "pending" },
  ]);

  const toggleVerification = (id: string) => {
    setContractors(contractors.map(c => c.id === id ? { ...c, status: c.status === "verified" ? "pending" : "verified" } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Contractors Verification Portal</h1>
          <p className="text-xs text-slate-400">Review company licenses, GST registrations, contractor verification, and ratings</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        <div className="divide-y divide-slate-800 text-xs">
          {contractors.map(c => (
            <div key={c.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  {c.company || c.name}
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${c.status === "verified" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-slate-400 flex items-center gap-4">
                  <span>Contact Person: <strong className="text-slate-200">{c.contact}</strong></span>
                  <span>Email: <strong className="text-slate-200">{c.email}</strong></span>
                  <span>Rating: <strong className="text-amber-400">★ {c.rating}</strong></span>
                </div>
              </div>

              <button
                onClick={() => toggleVerification(c.id)}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors ${c.status === "verified" ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-950" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
              >
                {c.status === "verified" ? "Revoke Verification" : "Verify Contractor"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
