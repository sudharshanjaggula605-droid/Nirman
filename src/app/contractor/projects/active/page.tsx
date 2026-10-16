"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MilestoneTracker } from "@/frontend/components/milestone-tracker";
import { Building2, Calendar, MapPin, Upload, Camera, CheckCircle2, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/frontend/lib/utils";
import { createClient } from "@/frontend/lib/supabase/client";

export default function ContractorActiveProjectsPage() {
  const [project, setProject] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [updateMsg, setUpdateMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchActiveProject() {
      try {
        const { data } = await supabase
          .from("projects")
          .select("*, owner:owners(full_name)")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setProject(data);
          setProgress(data.progress_percentage ?? 0);
        }
      } catch (err) {
        console.error("Error loading active project:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveProject();
  }, []);

  const projectTitle = project?.title || "Active Construction Project";
  const propertyType = project?.property_type || "Commercial / Residential";
  const location = project?.city || project?.location || "Hyderabad";
  const budget = project?.estimated_budget || 3250000;

  const milestones = [
    {
      id: "m1",
      title: "Foundation & Basement RCC",
      status: (progress >= 25 ? "completed" : progress > 0 ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
      completion_percentage: progress >= 25 ? 100 : Math.round((progress / 25) * 100),
      due_date: "2026-06-30",
      amount: Math.round(budget * 0.25),
    },
    {
      id: "m2",
      title: "Ground & First Floor Brickwork",
      status: (progress >= 50 ? "completed" : progress >= 25 ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
      completion_percentage: progress >= 50 ? 100 : progress >= 25 ? Math.round(((progress - 25) / 25) * 100) : 0,
      due_date: "2026-07-31",
      amount: Math.round(budget * 0.3),
    },
    {
      id: "m3",
      title: "Roof Slab & Elevation Plastering",
      status: (progress >= 75 ? "completed" : progress >= 50 ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
      completion_percentage: progress >= 75 ? 100 : progress >= 50 ? Math.round(((progress - 50) / 25) * 100) : 0,
      due_date: "2026-08-31",
      amount: Math.round(budget * 0.25),
    },
    {
      id: "m4",
      title: "Flooring, Electrical & Plumbing",
      status: (progress === 100 ? "completed" : progress >= 75 ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
      completion_percentage: progress === 100 ? 100 : progress >= 75 ? Math.round(((progress - 75) / 25) * 100) : 0,
      due_date: "2026-09-30",
      amount: Math.round(budget * 0.2),
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b pb-4 space-y-1">
        <Link
          href="/contractor/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Projects
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Active Construction Project</h1>
        <p className="text-xs text-muted-foreground">Update progress, upload site photos, and manage milestones</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-500/20 mb-2">
              <Building2 className="h-3.5 w-3.5" /> {propertyType}
            </span>
            <h2 className="text-xl font-bold text-foreground">{projectTitle}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 text-orange-500" /> {location}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-muted-foreground block">Awarded Budget</span>
            <span className="text-xl font-extrabold text-emerald-600">{formatCurrency(budget)}</span>
          </div>
        </div>

        {/* Progress Bar & Updater */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/30 border">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>Overall Construction Progress</span>
            <span className="text-orange-600 font-extrabold">{progress}% Completed</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="pt-2 flex items-center gap-3 text-xs">
            <label htmlFor="progress-range" className="font-semibold text-foreground">Update Progress %:</label>
            <input
              id="progress-range"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-48 accent-orange-600"
            />
            <span className="font-mono font-bold text-xs">{progress}%</span>
          </div>
        </div>

        {/* Milestones Tracker */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-foreground">Project Milestones</h3>
          <MilestoneTracker milestones={milestones} />
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
