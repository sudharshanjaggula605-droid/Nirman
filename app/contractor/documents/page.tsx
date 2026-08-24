"use client";

import { useState } from "react";
import { Folder, FileText, Upload, Download, Eye, Plus } from "lucide-react";

export default function ContractorDocumentsPage() {
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const DOCUMENTS = [
    { id: "1", name: "Contract_Agreement_Villa.pdf", category: "Contracts", size: "2.4 MB", date: "2026-06-15" },
    { id: "2", name: "Structural_Drawing_Rev3.pdf", category: "Drawings", size: "8.1 MB", date: "2026-06-20" },
    { id: "3", name: "Milestone_2_Invoice.pdf", category: "Invoices", size: "1.2 MB", date: "2026-07-15" },
    { id: "4", name: "Municipal_Building_Approval.pdf", category: "Approvals", size: "3.5 MB", date: "2026-05-10" },
  ];

  const filtered = DOCUMENTS.filter(d => categoryFilter === "ALL" || d.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Document Repository</h1>
          <p className="text-xs text-muted-foreground">Manage contracts, architectural drawings, invoices, and site approvals</p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700">
          <Upload className="h-4 w-4" /> Upload Document
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto border-b pb-2">
        {["ALL", "Contracts", "Drawings", "Invoices", "Approvals"].map(cat => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border">
                {doc.category}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-xs text-foreground truncate">{doc.name}</h4>
              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-between">
                <span>{doc.size}</span>
                <span>{doc.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t text-xs">
              <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border bg-muted/30 py-1.5 font-semibold text-foreground hover:bg-accent">
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
              <button className="inline-flex items-center justify-center p-1.5 rounded-lg border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-accent">
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
