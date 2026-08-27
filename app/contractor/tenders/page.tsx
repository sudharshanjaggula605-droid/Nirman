"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  MapPin,
  Clock,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContractorFindTendersPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchTenders() {
      try {
        const { data } = await supabase
          .from("tenders")
          .select("*, project:projects(*), bids:bids(count)")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (data) {
          setTenders(data);
        }
      } catch (err) {
        console.error("Error fetching tenders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, []);

  // Filtering
  const filteredTenders = tenders.filter((t) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(query);
    const cityMatch = t.project?.city?.toLowerCase().includes(query);
    const stateMatch = t.project?.state?.toLowerCase().includes(query);
    const matchesSearch = !searchQuery || titleMatch || cityMatch || stateMatch;

    const matchesType = selectedType === "ALL" || t.project?.property_type?.toUpperCase().includes(selectedType);

    return matchesSearch && matchesType;
  });

  // Sorting
  const sortedTenders = [...filteredTenders].sort((a, b) => {
    if (selectedSort === "budget_high") return (b.budget_max || 0) - (a.budget_max || 0);
    if (selectedSort === "budget_low") return (a.budget_max || 0) - (b.budget_max || 0);
    if (selectedSort === "deadline") return new Date(a.bid_deadline).getTime() - new Date(b.bid_deadline).getTime();
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Construction Tender Marketplace</h1>
          <p className="text-xs text-muted-foreground">Discover live tenders posted by property owners across India and submit itemized BOQ bids.</p>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <span className="font-extrabold text-foreground">{sortedTenders.length}</span> active tenders
        </div>
      </div>

      {/* Search, Filters, & Sorting Bar */}
      <div className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project title, city, or state..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Construction Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-semibold"
            >
              <option value="ALL">All Construction Types</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="RENOVATION">Renovation</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-semibold"
            >
              <option value="latest">Sort by: Latest Tenders</option>
              <option value="closing_soon">Sort by: Closing Soon</option>
              <option value="budget_high">Budget: High → Low</option>
              <option value="budget_low">Budget: Low → High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenders Grid */}
      {sortedTenders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTenders.map((tender) => {
            const bidsCount = tender.bids?.[0]?.count ?? 0;
            const budgetFormatted = `₹${(tender.budget_min / 100000).toFixed(1)}L - ₹${(tender.budget_max / 100000).toFixed(1)}L`;

            return (
              <div key={tender.id} className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm hover:border-orange-500/40 transition-colors flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      {tender.project?.property_type || "Residential"}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {bidsCount} Bids Submitted
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-foreground line-clamp-1">{tender.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tender.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-muted/50">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Estimated Budget</span>
                      <span className="font-extrabold text-foreground">{budgetFormatted}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">Location</span>
                      <span className="font-bold text-foreground">{tender.project?.city || "Hyderabad"}, {tender.project?.state || "Telangana"}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center justify-between pt-1">
                    <span>Area: <strong className="text-foreground">{tender.project?.area_sqft || 2400} sq.ft</strong></span>
                    <span>Deadline: <strong className="text-orange-600">{new Date(tender.bid_deadline).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link
                    href={`/contractor/tenders/${tender.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all"
                  >
                    <Eye className="h-4 w-4" /> View Tender & Submit Bid
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">No Live Tenders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are currently no active tenders matching your criteria in the database.
          </p>
        </div>
      )}
    </div>
  );
}
