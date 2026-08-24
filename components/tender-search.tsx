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
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by tender title, location, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[180px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="latest">Sort: Latest First</option>
              <option value="budget_high">Budget: High to Low</option>
              <option value="budget_low">Budget: Low to High</option>
              <option value="deadline">Closing Soonest</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedCategory !== "ALL" || selectedSort !== "latest") && (
            <button
              onClick={onReset}
              className="p-2.5 rounded-lg border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
