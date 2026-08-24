"use client";

import { useState } from "react";
import { MilestoneTracker } from "@/components/milestone-tracker";
import { CheckCircle2, Clock, XCircle, AlertCircle, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function OwnerMilestonesPage() {
  const [activeStatus, setActiveStatus] = useState("ALL");

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Project Milestone Management</h1>
        <p className="text-xs text-muted-foreground">Review milestone stage completions, verify site work, and authorize contractor disbursements</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-500/20 mb-2">
              <Building2 className="h-3.5 w-3.5" /> Modern Duplex Villa Construction
            </span>
            <h2 className="text-lg font-bold text-foreground">Milestones & Inspection Approvals</h2>
          </div>
        </div>

        <MilestoneTracker
          milestones={[
            { id: "m1", title: "Foundation & Basement RCC", status: "completed", completion_percentage: 100, due_date: "2026-06-30", amount: 800000 },
            { id: "m2", title: "Ground & First Floor Brickwork", status: "completed", completion_percentage: 100, due_date: "2026-07-31", amount: 1000000 },
            { id: "m3", title: "Roof Slab & Elevation Plastering", status: "in_progress", completion_percentage: 60, due_date: "2026-08-31", amount: 850000 },
            { id: "m4", title: "Flooring, Electrical & Plumbing", status: "pending", completion_percentage: 0, due_date: "2026-09-30", amount: 600000 },
          ]}
        />
      </div>
    </div>
  );
}
