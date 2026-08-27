"use client";

import { useState, useEffect } from "react";
import { Building2, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminProjectManagementPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                      <td className="p-3.5 font-bold text-white">{p.title}</td>
                      <td className="p-3.5 text-slate-300">{p.owner?.full_name || "Owner"}</td>
                      <td className="p-3.5 text-slate-300">{p.contractor_name || "Unassigned"}</td>
                      <td className="p-3.5 font-extrabold text-amber-400">₹{((p.estimated_budget || 0) / 100000).toFixed(1)}L</td>
                      <td className="p-3.5 font-bold text-emerald-400">{p.progress_percentage || 0}%</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          statusUpper === "COMPLETED"
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                        }`}>
                          {statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800">
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
    </div>
  );
}
