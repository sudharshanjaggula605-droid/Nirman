"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, CheckCircle2, Clock, MapPin, Eye, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function ContractorProjectsContent() {
  const searchParams = useSearchParams();
  const defaultStatus = searchParams.get("status") === "completed" ? "COMPLETED" : "ALL";

  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>(defaultStatus);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchContractorProjects() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch projects for this contractor or awarded projects
        const { data } = await supabase
          .from("projects")
          .select("*, owner:owners(full_name)")
          .order("created_at", { ascending: false });

        if (data) setProjects(data);
      } catch (err) {
        console.error("Error fetching contractor projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContractorProjects();
  }, []);

  useEffect(() => {
    if (searchParams.get("status") === "completed") {
      setFilter("COMPLETED");
    }
  }, [searchParams]);

  const filteredProjects = projects.filter((p) => {
    if (filter === "ALL") return true;
    return p.status?.toUpperCase() === filter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Contractor Projects</h1>
            <span className="sm:hidden text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
              {filteredProjects.length} Projects
            </span>
          </div>
          <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">Manage active civil construction site execution and completed projects.</p>
        </div>

        <div className="hidden sm:block text-xs text-muted-foreground font-semibold shrink-0">
          Showing <span className="font-extrabold text-foreground">{filteredProjects.length}</span> projects
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mr-1 shrink-0">
          <Filter className="h-3.5 w-3.5" /> Filter by Status:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {["ALL", "ACTIVE", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold transition-all shrink-0 ${
                filter === st
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-card border text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? `All (${projects.length})` : st === "ACTIVE" ? "Active" : "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const statusUpper = (project.status || "ACTIVE").toUpperCase();
            const progressVal = project.progress_percentage ?? (statusUpper === "COMPLETED" ? 100 : 65);

            return (
              <div
                key={project.id}
                className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm hover:border-orange-500/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      {project.property_type || "Residential Villa"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        statusUpper === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {statusUpper === "COMPLETED" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {statusUpper}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-foreground line-clamp-1">{project.title}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span>{project.city || project.location || "Hyderabad"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-muted/50">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Property Owner</span>
                      <span className="font-bold text-foreground">{project.owner?.full_name || "Client Owner"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Awarded Budget</span>
                      <span className="font-extrabold text-emerald-600">{formatCurrency(project.estimated_budget || 3250000)}</span>
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
                    href="/contractor/projects/active"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all"
                  >
                    <Eye className="h-4 w-4" /> Manage Project & Milestones
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">
            No {filter === "COMPLETED" ? "Completed" : filter === "ACTIVE" ? "Active" : ""} Projects Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Once property owners accept your tender quotations, awarded projects will appear here for progress tracking and milestone updates.
          </p>
          <div className="pt-2">
            <Link
              href="/contractor/tenders"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700"
            >
              Browse Active Tenders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContractorProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading contractor projects...</div>}>
      <ContractorProjectsContent />
    </Suspense>
  );
}
