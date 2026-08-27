"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, PlusCircle, Eye, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function OwnerProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("projects")
          .select("*, tender:tenders(*)")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (data) setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filter === "ALL") return true;
    return p.status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Construction Projects</h1>
          <p className="text-xs text-muted-foreground">Manage and track your property construction projects.</p>
        </div>

        <Link
          href="/owner/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Post New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mr-2">
          <Filter className="h-3.5 w-3.5" /> Status Filter:
        </span>
        {["ALL", "ACTIVE", "COMPLETED", "DRAFT"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filter === st
                ? "bg-orange-600 text-white shadow-md"
                : "bg-card border text-muted-foreground hover:text-foreground"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const statusUpper = (project.status || "ACTIVE").toUpperCase();
            const budgetFormatted = `₹${((project.estimated_budget || 0) / 100000).toFixed(1)} Lakhs`;
            const progressVal = project.progress_percentage ?? (project.status === "completed" ? 100 : project.status === "active" ? 50 : 0);

            return (
              <div key={project.id} className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm flex flex-col justify-between hover:border-orange-500/40 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      {project.property_type || "Residential"}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      statusUpper === "ACTIVE"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : statusUpper === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground border"
                    }`}>
                      {statusUpper}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-foreground">{project.title}</h3>
                  <div className="text-xs text-muted-foreground">{project.city || project.location || "Hyderabad"}</div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-muted/50">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Contractor</span>
                      <span className="font-bold text-foreground">{project.contractor_name || "Assigned Contractor"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Budget</span>
                      <span className="font-bold text-foreground">{budgetFormatted}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-orange-600">{progressVal}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full"
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link
                    href={`/owner/projects/${project.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
                  >
                    <Eye className="h-4 w-4 text-orange-600" /> View Project
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Projects Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You don't have any projects in this category yet. Click below to post a new project requirement.
          </p>
          <div className="pt-2">
            <Link
              href="/owner/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
            >
              <PlusCircle className="h-4 w-4" /> Create Your First Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
