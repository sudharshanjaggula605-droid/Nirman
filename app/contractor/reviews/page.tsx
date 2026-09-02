"use client";

import { useState, useEffect } from "react";
import { Star, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContractorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadContractorReviews() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("reviews")
          .select("*, owner:owners(full_name)")
          .eq("contractor_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setReviews(data);
          if (data.length > 0) {
            const sum = data.reduce((acc, r) => acc + (r.rating || 5), 0);
            setAvgRating(sum / data.length);
          }
        }
      } catch (err) {
        console.error("Error loading contractor reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContractorReviews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="border-b pb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Client Ratings & Reviews</h1>
          <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">Feedback and star ratings received from verified Property Owners on NIRMAN.</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 rounded-2xl border bg-card px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm shrink-0">
          <div className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-amber-500">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-500" /> {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
          </div>
          <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold">({reviews.length})</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-foreground border-b pb-3">Verified Client Feedback</h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border p-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-foreground">{r.owner?.full_name || "Property Owner"}</div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {r.rating} / 5.0
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">"{r.comment}"</p>
                <div className="text-[10px] text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Date: {new Date(r.created_at || Date.now()).toLocaleDateString()}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified Owner Review
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
            <Star className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="text-xs font-bold text-foreground">No Reviews Received Yet</div>
            <p className="text-[11px] text-muted-foreground">Property owners will submit verified quality reviews once milestones are completed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
