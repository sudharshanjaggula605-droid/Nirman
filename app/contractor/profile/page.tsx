"use client";

import { useState } from "react";
import { Building2, User, Phone, Mail, MapPin, Award, Star, Save } from "lucide-react";

export default function ContractorProfilePage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Contractor Profile & Portfolio</h1>
        <p className="text-xs text-muted-foreground">Manage your company profile, license, experience, and past project showcase</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="h-16 w-16 rounded-2xl bg-orange-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            BC
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">BuildPro Constructions Pvt Ltd</h2>
            <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mt-0.5">
              <Star className="h-4 w-4 fill-amber-400" /> 4.9 Rating (24 Client Reviews)
            </div>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
            Profile details saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Company Name</label>
            <input type="text" defaultValue="BuildPro Constructions Pvt Ltd" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Contact Person Name</label>
            <input type="text" defaultValue="Ramesh Varma" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Phone Number</label>
            <input type="tel" defaultValue="+91 98765 43210" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Email Address</label>
            <input type="email" defaultValue="ramesh@buildpro.in" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-foreground">Specializations</label>
            <input type="text" defaultValue="Turn-key Duplex Villas, Structural RCC Frame Work, Commercial Office Interior Fit-outs" className="w-full rounded-lg border bg-background p-2.5 text-foreground" />
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
