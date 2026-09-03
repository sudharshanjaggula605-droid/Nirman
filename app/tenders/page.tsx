"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Building2,
  ArrowUpDown,
  X,
  RefreshCw,
} from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";
import { TenderCard } from "@/components/tender-card";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/language-context";

const POPULAR_CITIES = [
  "All",
  "Hyderabad",
  "Kadapa",
  "Bangalore",
  "Vijayawada",
  "Visakhapatnam",
  "Chennai",
  "Mumbai",
  "Pune",
];

export default function ExploreTendersPage() {
  const { t } = useLanguage();
  const [tenders, setTenders] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("All");
  const [sortBy, setSortBy] = useState<"latest" | "budget_high" | "budget_low" | "deadline">("latest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createClient();

  // 1. Fetch Real Database Tenders
  const fetchActiveTenders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch active categories
      const { data: catData } = await supabase
        .from("project_categories")
        .select("id, name")
        .eq("is_active", true);

      if (catData && catData.length > 0) {
        setCategories(catData);
      }

      // Fetch active/open Owner-posted tenders
      const { data: tenderData, error } = await supabase
        .from("tenders")
        .select(`
          id, title, description, budget_min, budget_max, bid_deadline, status, created_at,
          project:projects(city, state, location, address, property_type, area_sqft, estimated_budget, category:project_categories(name)),
          bids:bids(count),
          images:tender_images(image_url)
        `)
        .eq("status", "active")
        .gt("bid_deadline", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching active tenders:", error);
      } else if (tenderData) {
        const formatted = tenderData.map((item: any) => ({
          ...item,
          bids_count: item.bids?.[0]?.count || 0,
        }));
        setTenders(formatted);
      }
    } catch (err) {
      console.error("Unexpected error fetching explore tenders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveTenders();
  }, []);

  // 2. Real-time City/Location & Category Filtering
  const filteredTenders = useMemo(() => {
    return tenders.filter((item) => {
      const query = searchLocation.trim().toLowerCase();
      const city = (item.project?.city || "").toLowerCase();
      const state = (item.project?.state || "").toLowerCase();
      const location = (item.project?.location || "").toLowerCase();
      const address = (item.project?.address || "").toLowerCase();
      const title = (item.title || "").toLowerCase();
      const description = (item.description || "").toLowerCase();

      // Location / Keyword search match
      const matchesSearch =
        !query ||
        city.includes(query) ||
        state.includes(query) ||
        location.includes(query) ||
        address.includes(query) ||
        title.includes(query) ||
        description.includes(query);

      // Quick City pill match
      const matchesCityPill =
        selectedCity === "All" ||
        city.includes(selectedCity.toLowerCase()) ||
        state.includes(selectedCity.toLowerCase()) ||
        location.includes(selectedCity.toLowerCase());

      // Category match
      const itemCategory = item.project?.category?.name?.toLowerCase() || "";
      const matchesCategory =
        selectedCategory === "ALL" ||
        itemCategory === selectedCategory.toLowerCase();

      return matchesSearch && matchesCityPill && matchesCategory;
    });
  }, [tenders, searchLocation, selectedCity, selectedCategory]);

  // 3. Sorting
  const sortedTenders = useMemo(() => {
    const list = [...filteredTenders];
    if (sortBy === "latest") {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "budget_high") {
      list.sort((a, b) => (b.budget_max || 0) - (a.budget_max || 0));
    } else if (sortBy === "budget_low") {
      list.sort((a, b) => (a.budget_max || 0) - (b.budget_max || 0));
    } else if (sortBy === "deadline") {
      list.sort((a, b) => new Date(a.bid_deadline).getTime() - new Date(b.bid_deadline).getTime());
    }
    return list;
  }, [filteredTenders, sortBy]);

  const handleCityPillClick = (city: string) => {
    setSelectedCity(city);
    if (city !== "All") {
      setSearchLocation(city);
    } else {
      setSearchLocation("");
    }
  };

  const handleClearFilters = () => {
    setSearchLocation("");
    setSelectedCity("All");
    setSelectedCategory("ALL");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 container mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4 pb-28">
        {/* ========================================================================= */}
        {/* 1. COMPACT HEADER */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-2 border-b pb-2 sm:pb-3">
          <div className="flex items-center gap-2">
            <NirmanLogo size="sm" className="hidden sm:flex" />
            <div>
              <h1 className="text-base sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                <span>Explore Tenders</span>
              </h1>
              <p className="hidden sm:block text-xs text-muted-foreground">
                Search verified live tenders posted by property owners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] sm:text-xs font-bold text-orange-600">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
              {tenders.length} Live
            </span>
            <button
              type="button"
              onClick={() => fetchActiveTenders(true)}
              disabled={refreshing}
              className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-xl border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Refresh Tenders"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? "animate-spin text-orange-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH TENDERS BY CITY / LOCATION */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          <div className="relative flex items-center w-full rounded-2xl border-2 border-orange-500/30 bg-card shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all overflow-hidden">
            <div className="pl-3.5 text-orange-600 shrink-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => {
                setSearchLocation(e.target.value);
                if (selectedCity !== "All" && e.target.value !== selectedCity) {
                  setSelectedCity("All");
                }
              }}
              placeholder="Search tenders by city or location (e.g. Kadapa, Hyderabad)..."
              aria-label="Search tenders by city or location"
              className="w-full bg-transparent px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchLocation && (
              <button
                type="button"
                onClick={() => {
                  setSearchLocation("");
                  setSelectedCity("All");
                }}
                className="p-2 mr-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear location search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick City Filter Pills (Single scroll row, no ugly scrollbar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0 pr-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-orange-600" /> City:
            </span>
            {POPULAR_CITIES.map((city) => {
              const isSelected =
                selectedCity === city ||
                (city !== "All" && searchLocation.toLowerCase() === city.toLowerCase());
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCityPillClick(city)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-700 text-white shadow-xs font-bold scale-105"
                      : "bg-card border border-border text-muted-foreground hover:border-orange-500/40 hover:text-foreground active:scale-95"
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>

          {/* Compact Category + Sort Controls */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Desktop Category Pills */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-muted text-foreground border border-foreground/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? "bg-muted text-foreground border border-foreground/20"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Mobile Category Select Dropdown */}
            <div className="md:hidden flex-1 max-w-[170px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter category"
                className="w-full bg-card border rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 ml-auto">
              <ArrowUpDown className="h-3.5 w-3.5 text-orange-600 hidden xs:block" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                aria-label="Sort tenders"
                className="bg-card border rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="budget_high">Budget: High to Low</option>
                <option value="budget_low">Budget: Low to High</option>
                <option value="deadline">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. OWNER'S ACTIVE TENDERS FEED */}
        {/* ========================================================================= */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b pb-1.5">
            <h2 className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-orange-600" />
              Owner&apos;s Active Tenders
              {searchLocation && (
                <span className="text-[11px] font-normal text-muted-foreground">
                  in &ldquo;<strong className="text-orange-600">{searchLocation}</strong>&rdquo;
                </span>
              )}
            </h2>
            <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              {sortedTenders.length} tenders
            </span>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl border bg-card p-4 space-y-4 animate-pulse">
                  <div className="h-44 w-full bg-muted rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                  <div className="h-10 w-full bg-muted rounded-xl" />
                </div>
              ))}
            </div>
          ) : sortedTenders.length > 0 ? (
            /* Tender Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedTenders.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>
          ) : (
            /* No Tenders Found State */
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border bg-card/50 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-xs">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                  No Tenders Found {searchLocation ? `in "${searchLocation}"` : ""}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {searchLocation
                    ? `We couldn't find any active tenders matching "${searchLocation}". Try searching for another city like Hyderabad, Kadapa, Bangalore, or view all available tenders.`
                    : "There are currently no active tenders available. Please check back soon or post a new project."}
                </p>
              </div>

              {(searchLocation || selectedCategory !== "ALL" || selectedCity !== "All") && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-orange-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-800 transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  View All Active Tenders
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
