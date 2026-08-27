"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Eye,
  X,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  User,
  HardHat,
  Layers,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminProjectManagementPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Project Details Modal State
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data } = await supabase
          .from("projects")
          .select("*, owner:owners(full_name)")
          .order("created_at", { ascending: false });

        if (data) setProjects(data);
      } catch (err) {
        console.error("Error fetching admin projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const openProjectDetails = async (p: any) => {
    setSelectedProject(p);
    setLoadingDocs(true);
    try {
      const { data } = await supabase
        .from("project_documents")
        .select("*")
        .eq("project_id", p.id);
      setProjectDocs(data || []);
    } catch (err) {
      console.error("Error fetching docs:", err);
      setProjectDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const capitalize = (str?: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Construction Projects</h1>
          <p className="text-xs text-slate-400">Monitor awarded project execution, milestone progress, and budget compliance.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl overflow-hidden">
        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 font-extrabold text-slate-300">
                  <th className="p-3.5">Project Name</th>
                  <th className="p-3.5">Property Owner</th>
                  <th className="p-3.5">Awarded Contractor</th>
                  <th className="p-3.5">Contract Budget</th>
                  <th className="p-3.5">Progress</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {projects.map((p) => {
                  const statusUpper = (p.status || "ACTIVE").toUpperCase();
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">{capitalize(p.title)}</td>
                      <td className="p-3.5 text-slate-300">{capitalize(p.owner?.full_name) || "Owner"}</td>
                      <td className="p-3.5 text-slate-300">{capitalize(p.contractor_name) || "Unassigned"}</td>
                      <td className="p-3.5 font-extrabold text-amber-400">₹{((p.estimated_budget || 0) / 100000).toFixed(1)}L</td>
                      <td className="p-3.5 font-bold text-emerald-400">{p.progress_percentage || 0}%</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          statusUpper === "COMPLETED"
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                            : statusUpper === "TENDER"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => openProjectDetails(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-400" /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2 text-slate-400">
            <Building2 className="h-8 w-8 text-slate-500 mx-auto" />
            <div className="text-xs font-bold text-white">No Projects in Database</div>
            <p className="text-[11px]">No construction projects found on the platform.</p>
          </div>
        )}
      </div>

      {/* Professional Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
          <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-700/80 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden backdrop-blur-2xl">
            {/* Subtle Gradient Backdrop Glob */}
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-600/10 to-transparent blur-2xl pointer-events-none" />

            {/* Modal Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-5 shrink-0 relative z-20">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-amber-500/15 px-3 py-0.5 text-[10px] font-black tracking-wider text-amber-400 border border-amber-500/30 uppercase">
                    {selectedProject.status || "ACTIVE"}
                  </span>
                  {selectedProject.property_type && (
                    <span className="rounded-md bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-400 border border-orange-500/20">
                      {selectedProject.property_type}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {capitalize(selectedProject.title)}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950/50">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Estimated Budget</span>
                    <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <p className="text-base font-black text-amber-400">
                    ₹{(selectedProject.estimated_budget || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Built-up Area</span>
                    <Layers className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <p className="text-base font-black text-white">{selectedProject.area_sqft || 0} Sq.ft</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Progress</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-base font-black text-emerald-400">{selectedProject.progress_percentage || 0}%</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Location</span>
                    <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-200 truncate">
                    {capitalize(selectedProject.city) || "Hyderabad"}
                  </p>
                </div>
              </div>

              {/* Execution Progress Bar */}
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-wide">Civil Execution Progress</span>
                  <span className="text-emerald-400 font-extrabold">{selectedProject.progress_percentage || 0}% Completed</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${selectedProject.progress_percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Property Owner & Awarded Contractor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Property Owner
                  </span>
                  <p className="font-extrabold text-white text-base leading-tight">
                    {capitalize(selectedProject.owner?.full_name) || "Property Owner"}
                  </p>
                  <div className="space-y-0.5 text-slate-300 leading-relaxed">
                    <p className="font-medium text-slate-300">{capitalize(selectedProject.location) || "Site Address"}</p>
                    <p className="text-slate-400 font-mono text-[11px]">
                      {capitalize(selectedProject.city)}, {capitalize(selectedProject.state)} - {selectedProject.pincode}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HardHat className="h-3.5 w-3.5" /> Awarded Contractor
                  </span>
                  <p className="font-extrabold text-white text-base leading-tight">
                    {capitalize(selectedProject.contractor_name) || "Unassigned / Active Bidding Stage"}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    <span>Start: {selectedProject.start_date || "TBD"}</span>
                    <span>•</span>
                    <span>Target: {selectedProject.expected_completion_date || "TBD"}</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              {selectedProject.description && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-amber-400" /> Description & Technical Specifications
                  </span>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto font-normal">
                    {selectedProject.description}
                  </div>
                </div>
              )}

              {/* Attached Blueprints & Documents */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-400" /> Blueprints & Attached Documents
                </span>

                {loadingDocs ? (
                  <div className="p-4 text-center text-xs text-slate-500">Loading blueprint attachments...</div>
                ) : projectDocs.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {projectDocs.map((doc) => {
                      const isImg = doc.file_name?.match(/\.(png|jpg|jpeg|webp)$/i) || doc.file_type?.includes("image");
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 text-xs transition-all hover:border-amber-500/30"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 shrink-0 font-bold border border-amber-500/20">
                              {isImg ? <ImageIcon className="h-4.5 w-4.5 text-amber-400" /> : <FileText className="h-4.5 w-4.5 text-amber-400" />}
                            </div>
                            <div className="truncate space-y-0.5">
                              <p className="font-bold text-white truncate">{doc.file_name}</p>
                              <p className="text-[10px] text-slate-400 uppercase">
                                {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB • ` : ""}
                                {doc.file_type || "DOCUMENT"}
                              </p>
                            </div>
                          </div>

                          {doc.file_url && doc.file_url !== "#" && (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all shrink-0"
                            >
                              View File <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                    No blueprint drawings or attachments uploaded for this project yet.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Fixed Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-800 bg-slate-900/95 px-6 py-4 shrink-0 relative z-20">
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Close Window
              </button>

              <Link
                href="/admin/tenders"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 transition-all"
              >
                Monitor Tenders <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
