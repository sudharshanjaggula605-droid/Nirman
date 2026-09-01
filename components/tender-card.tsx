"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Building, Layers, ArrowUpRight, HardHat } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TenderCardProps {
  tender: {
    id: string;
    title: string;
    description?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    bid_deadline: string;
    status: string;
    project?: {
      city?: string | null;
      state?: string | null;
      property_type?: string | null;
      area_sqft?: number | null;
      estimated_budget?: number | null;
      category?: {
        name: string;
      } | null;
    } | null;
    bids_count?: number;
    images?: { image_url: string }[];
  };
}

export function TenderCard({ tender }: TenderCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl =
    tender.images && tender.images.length > 0
      ? tender.images[0].image_url
      : "/tender-residential.jpg";

  const budget = tender.budget_max || tender.project?.estimated_budget || 0;
  const categoryName = tender.project?.category?.name || "General Construction";
  const cityLocation = tender.project?.city
    ? `${tender.project.city}${tender.project?.state ? `, ${tender.project.state}` : ""}`
    : "India";

  return (
    <div className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-500/40 overflow-hidden">
      {/* Image Header with Category Badge */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
        {!imgError ? (
          <Image
            src={imageUrl}
            alt={tender.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-orange-950/40 to-slate-900 flex items-center justify-center">
            <HardHat className="h-16 w-16 text-orange-500/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white border border-white/20">
            <Building className="h-3 w-3 text-orange-400" />
            {categoryName}
          </span>
        </div>

        {/* Bids Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center rounded-md bg-orange-700 px-2.5 py-1 text-xs font-bold text-white shadow-md">
            {tender.bids_count || 0} Bids Submitted
          </span>
        </div>

        {/* Title overlay at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-lg leading-snug text-white line-clamp-1 drop-shadow-sm">
            {tender.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-200 mt-0.5">
            <MapPin className="h-3.5 w-3.5 text-orange-400" />
            <span>{cityLocation}</span>
          </div>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="flex flex-1 flex-col p-4 space-y-4">
        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-1 bg-muted/40 rounded-lg p-2.5 border border-muted">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Area</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Layers className="h-3 w-3 text-orange-500" />
              {tender.project?.area_sqft ? `${tender.project.area_sqft.toLocaleString()} Sq.ft` : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Property Type</span>
            <span className="font-semibold text-foreground truncate block">
              {tender.project?.property_type || "Residential"}
            </span>
          </div>
        </div>

        {/* Budget & Deadline Row */}
        <div className="flex items-center justify-between border-t border-b py-2.5">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Estimated Budget</span>
            <span className="text-base font-extrabold text-orange-600 dark:text-orange-400">
              {formatCurrency(budget)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Bid Deadline</span>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1 justify-end">
              <Calendar className="h-3 w-3 text-orange-500" />
              {formatDate(tender.bid_deadline)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/tenders/${tender.id}`}
            className="flex items-center justify-center gap-1 rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            View Specs
          </Link>
          <Link
            href={`/tenders/${tender.id}/bid`}
            className="flex items-center justify-center gap-1 rounded-lg bg-orange-700 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-orange-700/30 transition-all hover:bg-orange-800"
          >
            Submit Bid
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
