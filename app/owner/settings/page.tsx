"use client";

import { useState } from "react";
import { Settings, Key, Bell, Save } from "lucide-react";

export default function OwnerSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-xs text-muted-foreground">Manage password, notification preferences, and account security</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm text-xs">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-foreground border-b pb-2 flex items-center gap-2">
            <Key className="h-4 w-4 text-orange-500" /> Password & Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-foreground block mb-1">New Password</label>
              <input type="password" placeholder="At least 6 characters" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Confirm New Password</label>
              <input type="password" placeholder="Re-type password" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
