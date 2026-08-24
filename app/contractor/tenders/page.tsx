"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Building, Filter, ArrowUpRight, Clock, Layers } from "lucide-react";
import { TenderCard } from "@/components/tender-card";

const SAMPLE_PROJECTS = [
  {
    id: "sample-1",
    title: "Modern Duplex Villa Construction",
    description: "Looking for an experienced civil contractor for turn-key construction of a 2,400 sq.ft modern duplex villa with premium elevation and smart structural wiring.",
    budget_min: 3000000,
    budget_max: 3500000,
    bid_deadline: "2026-09-15T00:00:00.000Z",
    status: "active",
    bids_count: 12,
    images: [{ image_url: "/tender-residential.jpg" }],
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
    bid_deadline: "2026-09-20T00:00:00.000Z",
    status: "active",
    bids_count: 8,
    images: [{ image_url: "/tender-commercial.jpg" }],
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
    title: "Luxury Apartment Complex Facade Renovation",
    description: "Structural strengthening and external facade facelift for a 4-story luxury residential apartment building.",
    budget_min: 7500000,
    budget_max: 8500000,
    bid_deadline: "2026-09-10T00:00:00.000Z",
    status: "active",
    bids_count: 15,
    images: [{ image_url: "/tender-apartment.jpg" }],
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

export default function ContractorBrowseProjectsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState("ALL");

  const filteredProjects = SAMPLE_PROJECTS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.project.city.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "ALL" || p.project.category.name === category;
    const matchesLocation = location === "ALL" || p.project.city === location;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Browse Construction Tenders</h1>
          <p className="text-xs text-muted-foreground">Find open construction opportunities & submit competitive BOQ proposals</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border bg-card shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tender title or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <option value="ALL">All Categories</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Renovation">Renovation</option>
        </select>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <option value="ALL">All Cities</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Mumbai">Mumbai</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((tender) => (
          <TenderCard key={tender.id} tender={tender} />
        ))}
      </div>
    </div>
  );
}
