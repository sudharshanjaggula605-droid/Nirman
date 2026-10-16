"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MilestoneTracker } from "@/frontend/components/milestone-tracker";
import {
  Building2,
  Calendar,
  MapPin,
  Upload,
  Camera,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/frontend/lib/utils";
import { createClient } from "@/frontend/lib/supabase/client";

export default function ContractorProjectManagementPage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [progressSuccess, setProgressSuccess] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");
  const [siteUpdateSuccess, setSiteUpdateSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*, owner:owners(full_name)")
          .eq("id", params.id)
          .maybeSingle();

        if (data) {
          setProject(data);
          setProgress(data.progress_percentage ?? (data.status === "completed" ? 100 : 0));
        }
      } catch (err) {
        console.error("Error loading project for contractor:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  const handleSaveProgress = async () => {
    if (!project) return;
    setIsSavingProgress(true);
    setProgressSuccess(false);

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          progress_percentage: progress,
          status: progress === 100 ? "completed" : "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (!error) {
        setProgressSuccess(true);
        setTimeout(() => setProgressSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handlePostSiteUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMsg.trim()) return;

    setSiteUpdateSuccess(true);
    setUpdateMsg("");
    setTimeout(() => setSiteUpdateSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-6 bg-muted/50 rounded w-48" />
        <div className="rounded-2xl border bg-card p-6 h-64" />
        <div className="rounded-2xl border bg-card p-6 h-48" />
      </div>
    );
  }

  const projectTitle = project?.title || "Civil Building";
  const propertyType = project?.property_type || "Construction Project";
  const location = project?.city || project?.location || "Hyderabad";
  const budget = project?.estimated_budget || 3500000;
  const statusUpper = (project?.status || "ACTIVE").toUpperCase();

  // Dynamic milestone breakdown based on current progress
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
      {/* Header with Back button */}
      <div className="space-y-2 border-b pb-4">
        <Link
          href="/contractor/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Contractor Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{projectTitle}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Project Milestone Tracking & Site Progress Management
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border self-start sm:self-auto ${
              statusUpper === "COMPLETED"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }`}
          >
            {statusUpper === "COMPLETED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {statusUpper}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
        {/* Project Meta Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-500/20 mb-2">
              <Building2 className="h-3.5 w-3.5" /> {propertyType}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 text-orange-500" /> {location}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-muted-foreground block">Awarded Budget</span>
            <span className="text-xl font-extrabold text-emerald-600">{formatCurrency(budget)}</span>
          </div>
        </div>

        {/* Progress Bar & Updater */}
        <div className="space-y-4 p-5 rounded-xl bg-muted/30 border">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-foreground">Overall Construction Progress</span>
            <span className="text-orange-600 text-sm font-extrabold">{progress}% Completed</span>
          </div>

          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs">
              <label htmlFor="progress-range" className="font-semibold text-foreground shrink-0">
                Adjust Progress:
              </label>
              <input
                id="progress-range"
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-44 sm:w-64 accent-orange-600"
              />
              <span className="font-mono font-bold text-xs w-10">{progress}%</span>
            </div>

            <button
              onClick={handleSaveProgress}
              disabled={isSavingProgress}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSavingProgress ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Save Progress
                </>
              )}
            </button>
          </div>

          {progressSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Progress updated successfully in project records!
            </div>
          )}
        </div>

        {/* Milestones Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="font-extrabold text-base text-foreground">Project Milestones</h3>
              <p className="text-xs text-muted-foreground">Phased deliverables and stage completions</p>
            </div>
            <span className="text-xs font-bold text-orange-600">
              {milestones.filter((m) => m.status === "completed").length} of {milestones.length} Completed
            </span>
          </div>

          <MilestoneTracker milestones={milestones} />
        </div>

        {/* Add Daily Site Work Update */}
        <form onSubmit={handlePostSiteUpdate} className="space-y-3 p-5 rounded-xl border bg-muted/20">
          <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
            <Camera className="h-4 w-4 text-orange-500" /> Post Construction Progress Update & Site Proof
          </h4>
          <textarea
            placeholder="Describe site work completed today (e.g., Column casting completed, brick curing initiated)..."
            value={updateMsg}
            onChange={(e) => setUpdateMsg(e.target.value)}
            className="w-full rounded-xl border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            rows={3}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">Property owner will receive an instant notification.</span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" /> Submit Progress Update
            </button>
          </div>

          {siteUpdateSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Site work update published successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
