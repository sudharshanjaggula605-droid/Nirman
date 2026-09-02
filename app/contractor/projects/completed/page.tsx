"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, MapPin, Eye, ArrowLeft, Star } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function ContractorCompletedProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCompletedProjects() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("projects")
          .select("*, owner:owners(full_name)")
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (data) setProjects(data);
      } catch (err) {
        console.error("Error fetching completed contractor projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompletedProjects();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            href="/contractor/projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to All Projects
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Completed Projects</h1>
            <span className="sm:hidden text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
              {projects.length} Completed
            </span>
          </div>
          <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">Portfolio records of completed project deliverables and handed over properties.</p>
        </div>

        <div className="hidden sm:block text-xs text-muted-foreground font-semibold shrink-0">
          Showing <span className="font-extrabold text-foreground">{projects.length}</span> completed projects
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card/60 p-6 h-64" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm hover:border-orange-500/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                    {project.property_type || "Residential Villa"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> COMPLETED
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
                    <span className="text-[10px] text-muted-foreground block font-medium">Final Value</span>
                    <span className="font-extrabold text-emerald-600">{formatCurrency(project.estimated_budget || 3250000)}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Handover Status</span>
                    <span className="text-emerald-600 font-extrabold">100% Complete</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Link
                  href={`/contractor/portfolio`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-muted border px-4 py-2.5 text-xs font-extrabold text-foreground hover:bg-accent transition-all"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500" /> View in Public Portfolio
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Completed Projects Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When your ongoing construction contracts reach 100% milestone completion and are verified by the owner, they will appear in this archive.
          </p>
          <div className="pt-2">
            <Link
              href="/contractor/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700"
            >
              View Active Projects
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
