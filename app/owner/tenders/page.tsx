"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, PlusCircle, Eye, Edit, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function OwnerTendersPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchTenders() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("tenders")
          .select("*, project:projects(title, location), bids:bids(count)")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (data) setTenders(data);
      } catch (err) {
        console.error("Error fetching tenders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Published Tenders</h1>
          <p className="text-xs text-muted-foreground">Monitor tender bidding deadlines and received contractor quotations.</p>
        </div>

        <Link
          href="/owner/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Create New Tender
        </Link>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm overflow-hidden">
        {tenders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-extrabold text-foreground">
                  <th className="p-3.5">Tender / Project Title</th>
                  <th className="p-3.5">Budget Range</th>
                  <th className="p-3.5">Bids Received</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {tenders.map((t) => {
                  const bidsCount = t.bids?.[0]?.count ?? 0;
                  const statusUpper = (t.status || "ACTIVE").toUpperCase();

                  return (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{t.title}</div>
                        <div className="text-[11px] text-muted-foreground">{t.project?.location || "Hyderabad"}</div>
                      </td>
                      <td className="p-3.5 font-extrabold text-foreground">
                        ₹{(t.budget_min / 100000).toFixed(1)}L - ₹{(t.budget_max / 100000).toFixed(1)}L
                      </td>
                      <td className="p-3.5 font-bold text-orange-600">
                        {bidsCount} Bids
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(t.bid_deadline).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          statusUpper === "ACTIVE" || statusUpper === "LIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : statusUpper === "DRAFT"
                            ? "bg-muted text-muted-foreground border"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        }`}>
                          {statusUpper === "ACTIVE" ? "LIVE" : statusUpper}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href="/owner/bids"
                            className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-orange-700"
                          >
                            <Users className="h-3.5 w-3.5" /> View Bids
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center space-y-3 bg-muted/20">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base text-foreground">No Published Tenders</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create a construction project to publish live tenders for licensed contractor bidding.
            </p>
            <div className="pt-2">
              <Link
                href="/owner/projects/new"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
              >
                <PlusCircle className="h-4 w-4" /> Create Tender
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
