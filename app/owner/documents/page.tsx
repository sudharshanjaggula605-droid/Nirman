"use client";

import { useState } from "react";
import { FileText, Upload, Download, Eye } from "lucide-react";

export default function OwnerDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Property & Project Documents</h1>
          <p className="text-xs text-muted-foreground">Store property deeds, municipal permits, structural blueprints, and contractor agreements</p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700">
          <Upload className="h-4 w-4" /> Upload Property Doc
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "Property_Registration_Deed.pdf", cat: "Approvals", size: "4.5 MB" },
          { name: "Villa_Architectural_Blueprints.pdf", cat: "Drawings", size: "12.3 MB" },
          { name: "Contractor_Turnkey_Agreement.pdf", cat: "Contracts", size: "2.1 MB" },
        ].map((doc, idx) => (
          <div key={idx} className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border">
                {doc.cat}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-xs text-foreground truncate">{doc.name}</h4>
              <span className="text-[10px] text-muted-foreground">{doc.size}</span>
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
