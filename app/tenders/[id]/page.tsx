import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Layers, Building, FileText, ArrowUpRight, ShieldCheck, DollarSign, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TenderDetailsPageProps {
  params: { id: string };
}

export default async function TenderDetailsPage({ params }: TenderDetailsPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Tender with project, owner, documents, images, and bids
  const { data: tender } = await supabase
    .from("tenders")
    .select(`
      *,
      project:projects(*, category:project_categories(name)),
      owner:owners(*),
      documents:tender_documents(*),
      images:tender_images(*)
    `)
    .eq("id", params.id)
    .single();

  if (!tender) {
    // If id is sample id or not found in db, render mock fallback specs
    return (
      <div className="container mx-auto px-4 py-12 space-y-8 max-w-5xl">
        <div className="rounded-2xl border bg-card p-8 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div>
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-500/20 mb-2">
                <Building className="h-3.5 w-3.5" /> Residential Construction
              </span>
              <h1 className="text-3xl font-extrabold text-foreground">Modern Duplex Villa Construction</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 text-orange-500" /> Jubilee Hills, Hyderabad, Telangana
              </div>
            </div>
            <Link
              href={`/tenders/${params.id}/bid`}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700"
            >
              Submit Bid Proposal <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Estimated Budget</span>
              <span className="text-lg font-extrabold text-orange-600">₹35,00,000</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Built-up Area</span>
              <span className="text-base font-bold text-foreground">2,400 Sq.ft</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Property Type</span>
              <span className="text-base font-bold text-foreground">Villa / Independent</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Bid Deadline</span>
              <span className="text-base font-bold text-foreground">15 Sep 2026</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-lg text-foreground">Project Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seeking licensed civil contractors for turn-key construction of a 2,400 sq.ft modern duplex villa. Specifications include RCC frame structure, brick masonry, elevation plastering, premium electrical wiring conduits, and plumbing provisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userIsOwner = user?.id === tender.owner_id;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-500/20">
                <Building className="h-3.5 w-3.5" />
                {tender.project?.category?.name || "General Construction"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> Status: {tender.status.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{tender.title}</h1>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>
                {tender.project?.location ? `${tender.project.location}, ` : ""}
                {tender.project?.city || "India"}, {tender.project?.state || ""}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {userIsOwner ? (
              <Link
                href={`/owner/tenders/${tender.id}/bids`}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:bg-orange-700"
              >
                Manage Bids
              </Link>
            ) : (
              <Link
                href={`/tenders/${tender.id}/bid`}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all"
              >
                Submit Bid <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Specifications Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Estimated Budget</span>
            <span className="text-lg font-extrabold text-orange-600">
              {formatCurrency(tender.budget_max || tender.project?.estimated_budget)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Built-up Area</span>
            <span className="text-base font-bold text-foreground flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-orange-500" />
              {tender.project?.area_sqft ? `${tender.project.area_sqft.toLocaleString()} Sq.ft` : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Property Type</span>
            <span className="text-base font-bold text-foreground">
              {tender.project?.property_type || "Residential"}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Bid Deadline</span>
            <span className="text-base font-bold text-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              {formatDate(tender.bid_deadline)}
            </span>
          </div>
        </div>

        {/* Description & Scope */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-lg text-foreground">Project Description & Specifications</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {tender.description || tender.project?.description || "Detailed scope of work provided in uploaded documents."}
          </p>
        </div>

        {/* Additional Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-xs">
          <div>
            <span className="text-muted-foreground block">Proposed Start Date:</span>
            <span className="font-bold text-foreground">{formatDate(tender.project?.start_date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Expected Completion Date:</span>
            <span className="font-bold text-foreground">{formatDate(tender.project?.expected_completion_date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
