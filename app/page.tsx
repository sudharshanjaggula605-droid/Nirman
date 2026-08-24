"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HardHat, ShieldCheck, ArrowRight, Building2, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { TenderCard } from "@/components/tender-card";
import { TenderSearch } from "@/components/tender-search";
import { createClient } from "@/lib/supabase/client";

// Fallback seed tenders if database is currently empty
const SAMPLE_TENDERS = [
  {
    id: "sample-1",
    title: "Modern Duplex Villa Construction",
    description: "Looking for an experienced contractor for a 2,400 sq.ft modern duplex villa with premium elevation and smart structural wiring.",
    budget_min: 3000000,
    budget_max: 3500000,
    bid_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    bids_count: 12,
    images: [{ image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" }],
    project: {
      city: "Hyderabad",
      state: "Telangana",
      property_type: "Villa",
      area_sqft: 2400,
      estimated_budget: 3500000,
      category: { name: "Residential" },
    },
  },
  {
    id: "sample-2",
    title: "Commercial IT Office Fit-out & Interior",
    description: "Complete interior fit-out for 5,000 sq.ft commercial office space including glass partitions, HVAC, and modular workstations.",
    budget_min: 4500000,
    budget_max: 5200000,
    bid_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    bids_count: 8,
    images: [{ image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" }],
    project: {
      city: "Bengaluru",
      state: "Karnataka",
      property_type: "Commercial",
      area_sqft: 5000,
      estimated_budget: 5000000,
      category: { name: "Commercial" },
    },
  },
  {
    id: "sample-3",
    title: "Luxury Apartment Complex Renovation",
    description: "Structural strengthening and external facade facelift for a 4-story luxury residential apartment building.",
    budget_min: 7500000,
    budget_max: 8500000,
    bid_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    bids_count: 15,
    images: [{ image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" }],
    project: {
      city: "Mumbai",
      state: "Maharashtra",
      property_type: "Apartment",
      area_sqft: 8200,
      estimated_budget: 8000000,
      category: { name: "Renovation" },
    },
  },
];

export default function HomePage() {
  const [tenders, setTenders] = useState<any[]>(SAMPLE_TENDERS);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch categories
        const { data: catData } = await supabase
          .from("project_categories")
          .select("id, name")
          .eq("is_active", true);

        if (catData && catData.length > 0) {
          setCategories(catData);
        } else {
          setCategories([
            { id: "1", name: "Residential" },
            { id: "2", name: "Commercial" },
            { id: "3", name: "Industrial" },
            { id: "4", name: "Villa" },
            { id: "5", name: "Apartment" },
            { id: "6", name: "Renovation" },
            { id: "7", name: "Interior" },
          ]);
        }

        // Fetch active tenders from database
        const { data: tenderData } = await supabase
          .from("tenders")
          .select(`
            *,
            project:projects(*, category:project_categories(name)),
            bids:bids(count),
            images:tender_images(image_url)
          `)
          .eq("status", "active")
          .gt("bid_deadline", new Date().toISOString())
          .order("created_at", { ascending: false });

        if (tenderData && tenderData.length > 0) {
          const formatted = tenderData.map((t: any) => ({
            ...t,
            bids_count: t.bids?.[0]?.count || 0,
          }));
          setTenders(formatted);
        }
      } catch {
        // Fallback to sample tenders
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Filtering & Sorting Logic
  const filteredTenders = tenders.filter((t) => {
    const titleMatch = t.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const cityMatch = t.project?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const stateMatch = t.project?.state?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || cityMatch || stateMatch;

    const matchesCategory =
      selectedCategory === "ALL" || t.project?.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    if (selectedSort === "budget_high") {
      return (b.budget_max || 0) - (a.budget_max || 0);
    }
    if (selectedSort === "budget_low") {
      return (a.budget_max || 0) - (b.budget_max || 0);
    }
    if (selectedSort === "deadline") {
      return new Date(a.bid_deadline).getTime() - new Date(b.bid_deadline).getTime();
    }
    return new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime();
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-orange-500/10 via-background to-background py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400">
                <ShieldCheck className="h-4 w-4" /> Verified Construction Marketplace
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Build Better. <br />
                <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                  Find the Right Contractor.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                NIRMAN connects property owners with trusted contractors through a transparent construction tender marketplace.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link
                  href="/register?role=owner"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all"
                >
                  Post a Project
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#live-tenders"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  Explore Tenders
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-muted/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl font-bold text-foreground">100%</div>
                  <div className="text-xs text-muted-foreground">Admin Verified</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-600">₹50Cr+</div>
                  <div className="text-xs text-muted-foreground">Tender Value</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">0%</div>
                  <div className="text-xs text-muted-foreground">Worker Middlemen</div>
                </div>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl border bg-card p-3 shadow-2xl overflow-hidden">
                <div className="relative h-[360px] w-full rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80"
                    alt="NIRMAN Construction Platform"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-orange-400">
                      <span>Live Tender Activity</span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <div className="font-bold text-sm">Residential Duplex & Commercial Projects</div>
                    <p className="text-[11px] text-slate-300">Contractors submitting transparent BOQ bids daily.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Tenders Section */}
      <section id="live-tenders" className="container mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
              <Building2 className="h-4 w-4" /> Active Tender Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Live Construction Tenders
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Browse open tenders published by verified property owners across India.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing <span className="font-bold text-foreground">{sortedTenders.length}</span> active tenders
          </div>
        </div>

        {/* Search, Filter & Sort Component */}
        <TenderSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          categories={categories}
          onReset={() => {
            setSearchQuery("");
            setSelectedCategory("ALL");
            setSelectedSort("latest");
          }}
        />

        {/* Tenders Grid */}
        {sortedTenders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTenders.map((tender) => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center space-y-3">
            <HardHat className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No active tenders found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search criteria or category filter to discover more tenders.
            </p>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              How NIRMAN Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A transparent, admin-verified 4-step workflow connecting property owners with top contractors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border bg-card p-6 space-y-3 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 font-extrabold text-lg">
                1
              </div>
              <h3 className="font-bold text-base text-foreground">Post Project Tender</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Property owner posts construction specs, area, budget range, and uploads blueprints.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-3 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-extrabold text-lg">
                2
              </div>
              <h3 className="font-bold text-base text-foreground">Contractor Bidding</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Licensed contractors discover live tenders and submit itemized BOQ cost breakdowns.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-3 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 font-extrabold text-lg">
                3
              </div>
              <h3 className="font-bold text-base text-foreground">Compare & Award</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Owner compares bids side-by-side on quotation, timeline, experience, and accepts winning contractor.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-3 relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-extrabold text-lg">
                4
              </div>
              <h3 className="font-bold text-base text-foreground">Track & Complete</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track milestone updates, review site proof photos, release payouts, and rate contractor work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
