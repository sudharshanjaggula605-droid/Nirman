"use client";

import { useState } from "react";
import { MilestoneTracker } from "@/components/milestone-tracker";
import { Building2, Calendar, MapPin, Upload, Camera, CheckCircle2 } from "lucide-react";

export default function ContractorActiveProjectsPage() {
  const [progress, setProgress] = useState(65);
  const [updateMsg, setUpdateMsg] = useState("");

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Active Construction Projects</h1>
        <p className="text-xs text-muted-foreground">Update progress, upload site photos, and manage milestones</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-500/20 mb-2">
              <Building2 className="h-3.5 w-3.5" /> Villa Construction
            </span>
            <h2 className="text-xl font-bold text-foreground">Modern Duplex Villa Construction</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 text-orange-500" /> Jubilee Hills, Hyderabad
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-muted-foreground block">Awarded Budget</span>
            <span className="text-xl font-extrabold text-emerald-600">₹32,50,000</span>
          </div>
        </div>

        {/* Progress Bar & Updater */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/30 border">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>Overall Construction Progress</span>
            <span className="text-orange-600">{progress}% Completed</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-orange-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="pt-2 flex items-center gap-3 text-xs">
            <label className="font-semibold text-foreground">Update Progress %:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-48 accent-orange-600"
            />
          </div>
        </div>

        {/* Milestones Tracker */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-foreground">Project Milestones</h3>
          <MilestoneTracker
            milestones={[
              { id: "m1", title: "Foundation & Basement RCC", status: "completed", completion_percentage: 100, due_date: "2026-06-30", amount: 800000 },
              { id: "m2", title: "Ground & First Floor Brickwork", status: "completed", completion_percentage: 100, due_date: "2026-07-31", amount: 1000000 },
              { id: "m3", title: "Roof Slab & Elevation Plastering", status: "in_progress", completion_percentage: 60, due_date: "2026-08-31", amount: 850000 },
              { id: "m4", title: "Flooring, Electrical & Plumbing", status: "pending", completion_percentage: 0, due_date: "2026-09-30", amount: 600000 },
            ]}
          />
        </div>

        {/* Add Daily Site Work Update */}
        <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
          <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
            <Camera className="h-4 w-4 text-orange-500" /> Post Construction Progress Update & Site Photo
          </h4>
          <textarea
            placeholder="Describe site work completed today (e.g., Roof slab curing completed, elevation plastering initiated)..."
            value={updateMsg}
            onChange={(e) => setUpdateMsg(e.target.value)}
            className="w-full rounded-lg border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            rows={3}
          />
          <button
            onClick={() => setUpdateMsg("")}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
          >
            <Upload className="h-3.5 w-3.5" /> Submit Progress Update
          </button>
        </div>
      </div>
    </div>
  );
}
