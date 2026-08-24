"use client";

import { useState } from "react";
import { Settings, Shield, Save, Bell, Database } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Platform Settings & Governance Configuration</h1>
        <p className="text-xs text-slate-400">Manage platform fees, security policies, auto-approval thresholds, and database maintenance</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 text-xs shadow-xl text-slate-300">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            Platform governance settings saved!
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Platform Economics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-white block mb-1">Escrow Platform Fee (%)</label>
              <input type="text" defaultValue="1.5%" className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-white" />
            </div>
            <div>
              <label className="font-bold text-white block mb-1">Default Tender Expiry (Days)</label>
              <input type="text" defaultValue="30 Days" className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Security Enforcement</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-amber-600 rounded" />
              <span>Enforce Row Level Security (RLS) on all Supabase tables</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-amber-600 rounded" />
              <span>Require mandatory Admin Verification for contractor bid submission</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700"
          >
            <Save className="h-4 w-4" /> Save Governance Settings
          </button>
        </div>
      </div>
    </div>
  );
}
