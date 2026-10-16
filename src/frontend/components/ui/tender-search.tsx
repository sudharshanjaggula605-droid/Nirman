"use client";

import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from "lucide-react";

interface TenderSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedSort: string;
  setSelectedSort: (val: string) => void;
  categories: { id: string; name: string }[];
  onReset: () => void;
}

export function TenderSearch({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  categories,
  onReset,
}: TenderSearchProps) {
  const isFiltered = searchQuery || selectedCategory !== "ALL" || selectedSort !== "latest";

  return (
    <div className="w-full rounded-2xl border bg-card p-3 sm:p-4 shadow-sm space-y-3 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 w-full">
        {/* Search Bar Input */}
        <div className="relative flex-1 w-full min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by tender title, location, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tenders by title, location, city, or state"
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-medium"
          />
        </div>

        {/* Category Filter Dropdown & Sort Selector */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:w-44 md:w-48 min-w-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter tenders by category"
              className="w-full pl-3 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 truncate font-semibold cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none shrink-0" />
          </div>

          {/* Sort Selector */}
          <div className="relative flex-1 sm:w-44 md:w-48 min-w-0">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label="Sort tenders by"
              className="w-full pl-3 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 truncate font-semibold cursor-pointer"
            >
              <option value="latest">Sort: Latest First</option>
              <option value="budget_high">Budget: High to Low</option>
              <option value="budget_low">Budget: Low to High</option>
              <option value="deadline">Closing Soonest</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none shrink-0" />
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="p-2.5 rounded-xl border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Reset Filters"
              aria-label="Reset all search filters"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
