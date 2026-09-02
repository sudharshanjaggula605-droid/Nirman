"use client";

import { useState, useEffect } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function OwnerReviewsPage() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch owner reviews from database
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*, contractor:contractors(company_name)")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (reviewsData) setReviewsList(reviewsData);

        // Fetch contractors list for dropdown
        const { data: contData } = await supabase.from("contractors").select("id, company_name");
        if (contData && contData.length > 0) {
          setContractors(contData);
          setSelectedContractorId(contData[0].id);
        }
      } catch (err) {
        console.error("Error loading owner reviews:", err);
      }
    }
    loadReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newReview = {
        owner_id: user.id,
        contractor_id: selectedContractorId || null,
        rating,
        comment: reviewText,
        created_at: new Date().toISOString(),
      };

      const { data } = await supabase.from("reviews").insert(newReview).select("*, contractor:contractors(company_name)").single();
      if (data) setReviewsList([data, ...reviewsList]);

      setSubmitted(true);
      setReviewText("");
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Contractor Reviews & Ratings</h1>
        <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">Rate completed milestone performance and review verified contractor quality.</p>
      </div>

      {/* Review Submission Box */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-foreground border-b pb-3">Submit Contractor Review</h2>

        {submitted ? (
          <div className="rounded-xl bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Thank you! Your verified contractor review has been recorded in the database.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {contractors.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Select Contractor</label>
                <select
                  value={selectedContractorId}
                  onChange={(e) => setSelectedContractorId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                >
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-500 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        (hoverRating || rating) >= star ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-foreground ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Your Review & Quality Feedback</label>
              <textarea
                rows={3}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience regarding build quality, material transparency, and schedule adherence..."
                className="w-full rounded-xl border bg-background/60 p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition-all"
              >
                <Send className="h-3.5 w-3.5" /> Submit Review
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Past Reviews List */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-foreground border-b pb-3">My Submitted Reviews</h2>

        {reviewsList.length > 0 ? (
          <div className="space-y-3">
            {reviewsList.map((r) => (
              <div key={r.id} className="rounded-xl border p-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-foreground">{r.contractor?.company_name || "Contractor Partner"}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {r.rating} / 5
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">"{r.comment}"</p>
                <div className="text-[10px] text-muted-foreground pt-1">Reviewed on {new Date(r.created_at || Date.now()).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-muted/20">
            <Star className="h-8 w-8 text-muted-foreground mx-auto" />
            <div className="text-xs font-bold text-foreground">No Reviews Submitted Yet</div>
            <p className="text-[11px] text-muted-foreground">Submit your quality feedback for contractors upon milestone delivery.</p>
          </div>
        )}
      </div>
    </div>
  );
}
