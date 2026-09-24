"use client";

import { History, ShieldCheck, User } from "lucide-react";

export default function AdminAuditLogsPage() {
  const LOGS = [
    { id: "1", action: "Contractor Verification Approved", user: "Admin Governance", resource: "BuildPro Constructions", time: "2026-08-24 14:30:12", ip: "182.74.90.12" },
    { id: "2", action: "User Role Updated", user: "System Trigger", resource: "admin@nirman.com -> ADMIN", time: "2026-08-24 12:15:00", ip: "127.0.0.1" },
    { id: "3", action: "Tender Published", user: "Rajesh Kumar (Owner)", resource: "Modern Duplex Villa", time: "2026-08-20 09:00:00", ip: "106.51.24.18" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">System Audit & Governance Trail</h1>
        <p className="text-xs text-slate-400">Immutable security logs of administrative actions, user permissions, and tender operations</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-xl">
        <div className="divide-y divide-slate-800 text-xs">
          {LOGS.map(l => (
            <div key={l.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-slate-300">
              <div>
                <span className="font-bold text-amber-400 block">{l.action}</span>
                <span className="text-slate-400">Performed by: {l.user} • Target: {l.resource}</span>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>{l.time}</div>
                <div>IP: {l.ip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
