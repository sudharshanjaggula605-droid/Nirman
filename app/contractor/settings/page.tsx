"use client";

import { useState } from "react";
import { Settings, Shield, Bell, Key, Save } from "lucide-react";

export default function ContractorSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Account & Security Settings</h1>
        <p className="text-xs text-muted-foreground">Manage password, notification preferences, and security settings</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
            Settings updated successfully!
          </div>
        )}

        <div className="space-y-4 text-xs">
          <h3 className="font-bold text-sm text-foreground border-b pb-2 flex items-center gap-2">
            <Key className="h-4 w-4 text-orange-500" /> Change Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">New Password</label>
              <input type="password" placeholder="At least 6 characters" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Confirm New Password</label>
              <input type="password" placeholder="Re-enter new password" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs pt-4 border-t">
          <h3 className="font-bold text-sm text-foreground border-b pb-2 flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-500" /> Notification Preferences
          </h3>

          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-600 rounded" />
              <span>Email alerts when property owner accepts a bid</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-600 rounded" />
              <span>Notifications for new tender openings matching my category</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-600 rounded" />
              <span>Disbursement & milestone payment alerts</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
          >
            <Save className="h-4 w-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
