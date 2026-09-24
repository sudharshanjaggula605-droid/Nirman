"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Flag,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Upload,
  HardHat,
  Star,
} from "lucide-react";

export default function OwnerProjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "progress" | "milestones" | "site_updates" | "documents" | "payments" | "messages"
  >("overview");

  // Sample active project state for owner view
  const project = {
    id: params.id,
    title: "3BHK Independent Villa Construction",
    description: "2,400 sq.ft duplex villa construction with premium elevations and smart wiring.",
    location: "Plot 42, Jubilee Hills, Hyderabad",
    contractor: {
      company_name: "ABC Constructions",
      contact_person: "Anand Sharma",
      phone: "+91 9876543210",
      rating: 4.8,
    },
    budget: 3500000,
    start_date: "2026-03-01",
    expected_completion: "2027-03-31",
    progress: 72,
    current_stage: "Brick Work & Slab Framing",
    status: "active",
  };

  const milestones = [
    { title: "Foundation & Excavation", progress: 100, status: "completed", date: "2026-04-15" },
    { title: "RCC Pillar Framing & Slabs", progress: 100, status: "completed", date: "2026-06-30" },
    { title: "Brick Work & Plastering", progress: 60, status: "in_progress", date: "2026-09-15" },
    { title: "Electrical & Plumbing Piping", progress: 0, status: "pending", date: "2026-11-30" },
    { title: "Flooring & Interior Finishing", progress: 0, status: "pending", date: "2027-02-15" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <Link href="/owner/projects" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Projects
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{project.title}</h1>
          <p className="text-xs text-muted-foreground">{project.location}</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-extrabold text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="h-4 w-4" /> Active Construction
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b pb-2 text-xs font-bold">
        {[
          { id: "overview", label: "Overview", icon: Building2 },
          { id: "progress", label: "Progress", icon: Clock },
          { id: "milestones", label: "Milestones", icon: Flag },
          { id: "site_updates", label: "Site Updates", icon: HardHat },
          { id: "documents", label: "Documents", icon: FileText },
          { id: "payments", label: "Payments", icon: CreditCard },
          { id: "messages", label: "Messages", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all shrink-0 ${
                isActive
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Contract Value</span>
              <div className="text-xl font-extrabold text-foreground">₹{(project.budget / 100000).toFixed(2)} Lakhs</div>
            </div>

            <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Contractor Firm</span>
              <div className="text-base font-extrabold text-foreground">{project.contractor.company_name}</div>
              <div className="text-xs text-amber-500 font-bold flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-500" /> {project.contractor.rating} / 5.0 Rating
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Start Date</span>
              <div className="text-base font-bold text-foreground">{project.start_date}</div>
            </div>

            <div className="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
              <span className="text-xs text-muted-foreground font-semibold">Expected Completion</span>
              <div className="text-base font-bold text-foreground">{project.expected_completion}</div>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-sm">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-foreground">Overall Construction Completion</span>
              <span className="text-orange-600 font-extrabold text-sm">{project.progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground pt-1">
              Current Stage: <strong className="text-foreground">{project.current_stage}</strong>
            </div>
          </div>

          {/* Description & Contractor Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-sm">
              <h3 className="font-extrabold text-sm text-foreground">Project Description & Specs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-sm">
              <h3 className="font-extrabold text-sm text-foreground">Contractor Details</h3>
              <div className="text-xs space-y-2">
                <div>Company: <strong className="text-foreground">{project.contractor.company_name}</strong></div>
                <div>Contact Person: <strong className="text-foreground">{project.contractor.contact_person}</strong></div>
                <div>Phone: <strong className="text-foreground">{project.contractor.phone}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PROGRESS ================= */}
      {activeTab === "progress" && (
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-extrabold text-foreground">Construction Timeline & Progress Tracker</h2>
          <div className="space-y-4 pt-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{m.title}</span>
                  <span className={`font-bold ${m.status === "completed" ? "text-emerald-600" : m.status === "in_progress" ? "text-orange-600" : "text-muted-foreground"}`}>
                    {m.progress}% ({m.status.toUpperCase()})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.status === "completed" ? "bg-emerald-500" : "bg-orange-600"}`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: MILESTONES ================= */}
      {activeTab === "milestones" && (
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-extrabold text-foreground">Project Milestones</h2>
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white ${m.status === "completed" ? "bg-emerald-600" : "bg-orange-600"}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{m.title}</div>
                    <div className="text-[11px] text-muted-foreground">Due Date: {m.date}</div>
                  </div>
                </div>
                <span className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${m.status === "completed" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border border-orange-500/20"}`}>
                  {m.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: SITE UPDATES ================= */}
      {activeTab === "site_updates" && (
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-extrabold text-foreground">Contractor Site Proof Photos & Updates</h2>
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
            <HardHat className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="text-xs font-bold text-foreground">Brick Work & Column Casting Update (Yesterday)</div>
            <p className="text-[11px] text-muted-foreground">Uploaded 4 photo proofs for slab casting and brick wall alignment.</p>
          </div>
        </div>
      )}

      {/* ================= TAB 5: DOCUMENTS ================= */}
      {activeTab === "documents" && (
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground">Project Blueprints & Contracts</h2>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-700">
              <Upload className="h-3.5 w-3.5" /> Upload Document
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border text-xs">
              <span className="font-bold text-foreground">Approved Architectural Floor Plan.pdf</span>
              <span className="text-muted-foreground font-mono">2.4 MB</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl border text-xs">
              <span className="font-bold text-foreground">Signed Construction Agreement & BOQ.pdf</span>
              <span className="text-muted-foreground font-mono">1.8 MB</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: PAYMENTS ================= */}
      {activeTab === "payments" && (
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-extrabold text-foreground">Milestone Payment Schedule</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
              <div>
                <div className="font-bold text-foreground">Advance & Excavation Payout</div>
                <div className="text-[11px] text-muted-foreground">Paid on 2026-03-05</div>
              </div>
              <div className="font-extrabold text-emerald-600">₹7,00,000 (PAID ✓)</div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/20">
              <div>
                <div className="font-bold text-foreground">Slab & Brick Work Milestone</div>
                <div className="text-[11px] text-muted-foreground">Due upon 75% completion</div>
              </div>
              <div className="font-extrabold text-amber-600">₹10,50,000 (PENDING RELEASE)</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: MESSAGES ================= */}
      {activeTab === "messages" && (
        <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-extrabold text-foreground">Project Chat with ABC Constructions</h2>
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3 h-48 overflow-y-auto text-xs">
            <div className="bg-card border p-2.5 rounded-xl max-w-sm">
              <span className="font-bold text-orange-600 block">ABC Constructions:</span>
              <span>We have finished the first floor slab casting today. Inspection photos uploaded.</span>
            </div>
            <div className="bg-orange-600 text-white p-2.5 rounded-xl max-w-sm ml-auto text-right">
              <span className="font-bold block">You (Owner):</span>
              <span>Great progress! I will review the photos and release the milestone payment.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
