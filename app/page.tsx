"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowRight, Building2, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";
import { TenderCard } from "@/components/tender-card";
import { TenderSearch } from "@/components/tender-search";
import { ContactSection } from "@/components/contact-section";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [heroImgError, setHeroImgError] = useState(false);

  // Dynamic Live Stats
  const [liveStats, setLiveStats] = useState({
    totalTenderValueCr: 0,
    totalVerifiedContractors: 0,
    totalBidsSubmitted: 0,
    activeTendersCount: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadInitialData() {
      try {
        // 1. Fetch Categories
        const { data: catData } = await supabase
          .from("project_categories")
          .select("id, name")
          .eq("is_active", true);

        if (catData && catData.length > 0) {
          setCategories(catData);
        }

        // 2. Fetch Active Tenders from Database
        const { data: tenderData } = await supabase
          .from("tenders")
          .select(`
            id, title, budget_min, budget_max, bid_deadline, status, created_at,
            project:projects(city, state, property_type, area_sqft, estimated_budget, category:project_categories(name)),
            bids:bids(count),
            images:tender_images(image_url)
          `)
          .eq("status", "active")
          .gt("bid_deadline", new Date().toISOString())
          .order("created_at", { ascending: false });

        if (tenderData) {
          const formatted = tenderData.map((t: any) => ({
            ...t,
            bids_count: t.bids?.[0]?.count || 0,
          }));
          setTenders(formatted);
        }

        // 3. Fetch Real Database Statistics
        const { data: allTenders } = await supabase.from("tenders").select("budget_max");
        const { count: contractorCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "contractor");
        const { count: bidsCount } = await supabase.from("bids").select("*", { count: "exact", head: true });

        let sumBudget = 0;
        if (allTenders && allTenders.length > 0) {
          sumBudget = allTenders.reduce((acc, curr) => acc + (curr.budget_max || 0), 0);
        }

        const valueInCr = (sumBudget / 10000000).toFixed(1);

        setLiveStats({
          totalTenderValueCr: parseFloat(valueInCr),
          totalVerifiedContractors: contractorCount || 0,
          totalBidsSubmitted: bidsCount || 0,
          activeTendersCount: tenderData?.length || 0,
        });
      } catch (err) {
        console.error("Error loading landing page stats from database:", err);
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
    const matchesSearch = !searchQuery || titleMatch || cityMatch || stateMatch;

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
    <div className="pb-16 overflow-x-clip">
      {/* Mobile Sticky Hero Background Layer (PhonePe App Style) */}
      <div className="lg:hidden sticky top-16 z-0 w-full h-[240px] sm:h-[300px] overflow-hidden bg-slate-950">
        {!heroImgError ? (
          <Image
            src="/hero-construction.jpg"
            alt="NIRMAN Construction Platform"
            fill
            sizes="100vw"
            className="object-cover w-full h-full"
            priority
            onError={() => setHeroImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <NirmanLogo size="lg" />
            <div className="text-base font-bold text-white">NIRMAN Marketplace</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        
        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 text-white space-y-0.5 z-10">
          <div className="flex items-center justify-between text-[11px] font-semibold text-orange-400">
            <span>Live Marketplace Activity</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="font-bold text-xs">Real-time Construction Tenders</div>
          <p className="text-[10px] text-slate-300 line-clamp-1">Contractors submitting transparent BOQ bids directly.</p>
        </div>
      </div>

      {/* Main Content Layer - Scrolls Smoothly Over Hero Image on mobile, Standard 2-Col on Desktop */}
      <div className="relative z-10 bg-background rounded-t-3xl lg:rounded-none border-t border-border/40 lg:border-t-0 shadow-2xl lg:shadow-none -mt-4 lg:mt-0 pt-6 lg:pt-0 space-y-12 sm:space-y-16">
        {/* Hero Content Section */}
        <section className="relative lg:border-b lg:bg-gradient-to-b lg:from-orange-500/10 lg:via-background lg:to-background lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Content (Text & Trust Indicators) */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] sm:text-xs font-bold text-orange-600 dark:text-orange-400">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Verified Construction Marketplace
                </div>

                <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight sm:leading-[1.15]">
                  Build Better. <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                    Find the Right Contractor.
                  </span>
                </h1>

                <p className="hidden sm:block text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  NIRMAN connects property owners with trusted contractors through a transparent construction tender marketplace.
                </p>

                {/* Hero Action Buttons */}
                <div className="hidden sm:flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                  <Link
                    href="/register?role=owner"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-700/30 hover:bg-orange-800 transition-all"
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

                {/* Dynamic Live Database Trust Indicators */}
                <div className="pt-4 sm:pt-6 border-t border-muted/60 max-w-xl mx-auto lg:mx-0">
                  <div className="grid grid-cols-3 divide-x divide-border/60 rounded-2xl border bg-card/60 backdrop-blur-xs p-3 sm:p-3.5 text-center shadow-xs">
                    <div className="px-2 flex flex-col items-center justify-center">
                      <div className="text-base sm:text-xl font-black text-foreground tracking-tight">100%</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">Admin Verified</div>
                    </div>
                    <div className="px-2 flex flex-col items-center justify-center">
                      <div className="text-base sm:text-xl font-black text-orange-600 tracking-tight">₹{liveStats.totalTenderValueCr}Cr</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">Live Tenders</div>
                    </div>
                    <div className="px-2 flex flex-col items-center justify-center">
                      <div className="text-base sm:text-xl font-black text-foreground tracking-tight">{liveStats.totalVerifiedContractors}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">Contractors</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Visual Image Card (Rendered only on large screens) */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="relative mx-auto max-w-none rounded-3xl border border-border/60 bg-card p-3 shadow-2xl overflow-hidden">
                  <div className="relative h-[380px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-orange-950/60 to-slate-900">
                    {!heroImgError ? (
                      <Image
                        src="/hero-construction.jpg"
                        alt="NIRMAN Construction Platform"
                        fill
                        sizes="(max-width: 1200px) 50vw, 40vw"
                        className="object-cover w-full h-full"
                        priority
                        onError={() => setHeroImgError(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <NirmanLogo size="lg" />
                        <div className="text-lg font-bold text-white">NIRMAN Marketplace</div>
                        <p className="text-xs text-slate-300 max-w-xs">Connecting verified property owners with top-rated civil contractors.</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/65 backdrop-blur-md border border-white/10 text-white space-y-1 z-10">
                      <div className="flex items-center justify-between text-xs font-semibold text-orange-400">
                        <span>Live Marketplace Activity</span>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <div className="font-bold text-sm">Real-time Construction Tenders</div>
                      <p className="text-[11px] text-slate-300">Contractors submitting transparent BOQ bids directly.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      {/* Live Tenders Section */}
      <section id="live-tenders" className="container mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center justify-between gap-2 border-b pb-3 sm:pb-4">
          <div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
              <Building2 className="h-4 w-4" /> Active Tender Marketplace
            </div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-3xl font-extrabold text-foreground tracking-tight">
                Live Construction Tenders
              </h2>
              <span className="sm:hidden text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
                {sortedTenders.length} Active
              </span>
            </div>
            <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground mt-0.5">
              Browse open tenders published by verified property owners across India.
            </p>
          </div>

          <div className="hidden sm:block text-xs text-muted-foreground shrink-0">
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
          <div className="rounded-2xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
            <NirmanLogo size="lg" className="mx-auto" />
            <h3 className="font-bold text-base text-foreground">No active tenders in database yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Property owners can post a project to publish live tenders instantly for contractors.
            </p>
            <div className="pt-2">
              <Link
                href="/register?role=owner"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-800"
              >
                Post Your First Tender
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t bg-muted/30 py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 space-y-6 sm:space-y-12">
          <div className="text-center space-y-1 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              How NIRMAN Works
            </h2>
            <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
              A transparent, admin-verified 4-step workflow connecting property owners with top contractors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

        {/* Contact Us Section */}
        <ContactSection />
      </div>
    </div>
  );
}
