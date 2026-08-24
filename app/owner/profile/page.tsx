"use client";

import { useState } from "react";
import { User, Phone, Mail, MapPin, Save } from "lucide-react";

export default function OwnerProfilePage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Property Owner Profile</h1>
        <p className="text-xs text-muted-foreground">Manage your contact details, company information, and property ownership records</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
            Profile updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Full Name</label>
            <input type="text" defaultValue="Rajesh Kumar" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Email Address</label>
            <input type="email" defaultValue="rajesh@nirman.com" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Phone Number</label>
            <input type="tel" defaultValue="+91 98490 12345" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">City / State</label>
            <input type="text" defaultValue="Hyderabad, Telangana" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
          >
            <Save className="h-4 w-4" /> Save Profile Changes
          </button>
        </div>
      </div>
    </div>
  );
}
