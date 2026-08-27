"use client";

import { useState, useEffect } from "react";
import { Briefcase, PlusCircle, MapPin, CheckCircle2, Trash2, Edit2, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContractorPortfolioPage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("Residential Construction");
  const [location, setLocation] = useState("Hyderabad");
  const [completionYear, setCompletionYear] = useState("2025");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("contractor_portfolio")
          .select("*")
          .eq("contractor_id", user.id)
          .order("created_at", { ascending: false });

        if (data) setPortfolio(data);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      }
    }
    fetchPortfolio();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setProjectType("Residential Construction");
    setLocation("Hyderabad");
    setCompletionYear("2025");
    setDescription("");
    setImageUrl("");
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setTitle(item.title || "");
    setProjectType(item.project_type || "Residential Construction");
    setLocation(item.location || "Hyderabad");
    setCompletionYear((item.completion_year || 2025).toString());
    setDescription(item.description || "");
    setImageUrl(item.image_url || "");
    setShowAddModal(true);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        contractor_id: user.id,
        title,
        project_type: projectType,
        location,
        completion_year: parseInt(completionYear, 10),
        description,
        image_url: imageUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=800&q=80",
      };

      if (editingItem) {
        const { data } = await supabase
          .from("contractor_portfolio")
          .update(payload)
          .eq("id", editingItem.id)
          .select()
          .single();

        if (data) {
          setPortfolio((prev) => prev.map((p) => (p.id === editingItem.id ? data : p)));
        }
      } else {
        const { data } = await supabase.from("contractor_portfolio").insert(payload).select().single();
        if (data) setPortfolio([data, ...portfolio]);
      }

      setShowAddModal(false);
    } catch (err) {
      console.error("Error saving portfolio item:", err);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      await supabase.from("contractor_portfolio").delete().eq("id", id);
      setPortfolio((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting portfolio item:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Contractor Work Portfolio & Project Photos</h1>
          <p className="text-xs text-muted-foreground">Manage your past project photos and civil engineering showcases to attract property owners.</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Add Project Photo / Showcase
        </button>
      </div>

      {/* Portfolio Grid */}
      {portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <div key={item.id} className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:border-orange-500/40 transition-colors flex flex-col justify-between overflow-hidden">
              <div className="space-y-3">
                {/* Photo Display */}
                {item.image_url ? (
                  <div className="h-44 w-full rounded-xl overflow-hidden bg-muted relative group">
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 shadow-md backdrop-blur-sm"
                        title="Edit Project"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(item.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 w-full rounded-xl bg-muted/40 border border-dashed flex items-center justify-center text-muted-foreground text-xs font-bold gap-1.5">
                    <ImageIcon className="h-5 w-5" /> No Photo Attached
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                    {item.project_type || "Residential"}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    Year: {item.completion_year || 2025}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-foreground">{item.title}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span>{item.location}</span>
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Showcase
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePortfolio(item.id)}
                    className="text-xs font-bold text-rose-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Portfolio Photos Uploaded</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Upload photos of completed construction projects to build trust with property owners on NIRMAN.
          </p>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
            >
              <PlusCircle className="h-4 w-4" /> Add Your First Project Photo
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Portfolio Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg space-y-5 rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-extrabold text-foreground">
                {editingItem ? "Edit Project Photo & Showcase" : "Add Project Photo & Showcase"}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Villa Construction"
                  className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Project Photo Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Project Type</label>
                  <input
                    type="text"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Year</label>
                  <input
                    type="number"
                    value={completionYear}
                    onChange={(e) => setCompletionYear(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Project Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe built-up area, specifications, materials used..."
                  className="w-full rounded-xl border bg-background/60 p-3 text-xs text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-bold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
                >
                  {editingItem ? "Save Changes" : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
