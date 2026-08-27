"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, Eye, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContractorDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [category, setCategory] = useState("Contracts");
  const [fileUrl, setFileUrl] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchDocs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (data) setDocuments(data);
      } catch (err) {
        console.error("Error fetching contractor documents:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newDoc = {
        name: docName,
        category,
        file_url: fileUrl || "/documents/sample.pdf",
        size_bytes: Math.floor(Math.random() * 5000000) + 1000000,
        created_at: new Date().toISOString(),
      };

      const { data } = await supabase.from("documents").insert(newDoc).select().single();
      if (data) setDocuments([data, ...documents]);

      setShowUploadModal(false);
      setDocName("");
      setFileUrl("");
    } catch (err) {
      console.error("Error uploading contractor document:", err);
    }
  };

  const filtered = documents.filter((d) => categoryFilter === "ALL" || d.category === categoryFilter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Document Repository</h1>
          <p className="text-xs text-muted-foreground">Manage contracts, architectural drawings, invoices, and site approvals</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
        >
          <Upload className="h-4 w-4" /> Upload Document
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto border-b pb-2">
        {["ALL", "Contracts", "Drawings", "Invoices", "Approvals"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              categoryFilter === cat ? "bg-orange-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border">
                  {doc.category || "General"}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-foreground truncate">{doc.name}</h4>
                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-between">
                  <span>{((doc.size_bytes || 2500000) / 1000000).toFixed(1)} MB</span>
                  <span>{new Date(doc.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t text-xs">
                <a
                  href={doc.file_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border bg-muted/30 py-1.5 font-semibold text-foreground hover:bg-accent"
                >
                  <Eye className="h-3.5 w-3.5 text-orange-600" /> Preview
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Documents in Repository</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Upload structural drawings, site progress photos, or invoice receipts for your construction projects.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
            >
              <Upload className="h-4 w-4" /> Upload Document
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-extrabold text-foreground">Upload Contractor Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-xs text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Document Title / Name *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Structural_Drawing_Rev1.pdf"
                  className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="Contracts">Contracts & Agreements</option>
                  <option value="Drawings">Drawings & Blueprints</option>
                  <option value="Invoices">Invoices & Receipts</option>
                  <option value="Approvals">Municipal Approvals</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Document File URL</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://... / File path"
                  className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-bold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
