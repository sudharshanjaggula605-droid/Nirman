"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  id: string;
  type: "tender" | "project" | "bid" | "contractor" | "document" | "message";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

export async function dashboardSearchAction(
  query: string
): Promise<{ results: SearchResult[]; error?: string }> {
  if (!query || query.trim().length < 2) {
    return { results: [] };
  }

  const q = query.trim().toLowerCase();
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { results: [], error: "Unauthenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const results: SearchResult[] = [];

    // ─── SHARED: Search Tenders ────────────────────────────────────────────
    const { data: tenders } = await supabase
      .from("tenders")
      .select("id, title, description, status, budget_min, budget_max, projects(city, location)")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(5);

    if (tenders) {
      for (const t of tenders) {
        const proj = Array.isArray(t.projects) ? t.projects[0] : t.projects as any;
        results.push({
          id: t.id,
          type: "tender",
          title: t.title,
          subtitle: proj?.city
            ? `${proj.city} · ₹${Math.round((t.budget_min + t.budget_max) / 2 / 100000)}L budget`
            : t.description?.slice(0, 60) + "..." || "View tender details",
          href: role === "contractor" ? `/contractor/tenders/${t.id}` : `/owner/tenders`,
          badge: t.status === "active" ? "Active" : t.status,
          badgeColor:
            t.status === "active"
              ? "emerald"
              : t.status === "closed"
              ? "slate"
              : "amber",
        });
      }
    }

    // ─── SHARED: Search Projects ────────────────────────────────────────────
    const projectQuery = supabase
      .from("projects")
      .select("id, title, description, status, city, location")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,location.ilike.%${q}%`)
      .limit(5);

    if (role === "owner") {
      projectQuery.eq("owner_id", user.id);
    }

    const { data: projects } = await projectQuery;

    if (projects) {
      for (const p of projects) {
        results.push({
          id: p.id,
          type: "project",
          title: p.title,
          subtitle: p.city || p.location || p.description?.slice(0, 60) || "View project",
          href:
            role === "owner"
              ? `/owner/projects/${p.id}`
              : `/contractor/projects`,
          badge: p.status,
          badgeColor:
            p.status === "active" || p.status === "in_progress"
              ? "emerald"
              : p.status === "completed"
              ? "blue"
              : "amber",
        });
      }
    }

    // ─── SHARED: Search Bids ───────────────────────────────────────────────
    const bidQueryBase = supabase
      .from("bids")
      .select("id, bid_amount, status, notes, tenders(title), created_at")
      .limit(5);

    if (role === "owner") {
      // Owner: search bids on their tenders
      const { data: bids } = await bidQueryBase.or(
        `notes.ilike.%${q}%`
      );
      if (bids) {
        for (const b of bids) {
          const tenderTitle = Array.isArray(b.tenders)
            ? (b.tenders[0] as any)?.title
            : (b.tenders as any)?.title;
          if (
            tenderTitle?.toLowerCase().includes(q) ||
            b.notes?.toLowerCase().includes(q) ||
            String(b.bid_amount).includes(q)
          ) {
            results.push({
              id: b.id,
              type: "bid",
              title: `Bid on: ${tenderTitle || "Tender"}`,
              subtitle: `₹${b.bid_amount?.toLocaleString("en-IN")} · ${b.status}`,
              href: `/owner/bids`,
              badge: b.status,
              badgeColor:
                b.status === "accepted"
                  ? "emerald"
                  : b.status === "rejected"
                  ? "rose"
                  : "amber",
            });
          }
        }
      }
    } else if (role === "contractor") {
      // Contractor: search their own bids
      const { data: bids } = await supabase
        .from("bids")
        .select("id, bid_amount, status, notes, tenders(title)")
        .eq("contractor_id", user.id)
        .limit(5);

      if (bids) {
        for (const b of bids) {
          const tenderTitle = Array.isArray(b.tenders)
            ? (b.tenders[0] as any)?.title
            : (b.tenders as any)?.title;
          if (
            !q ||
            tenderTitle?.toLowerCase().includes(q) ||
            b.notes?.toLowerCase().includes(q) ||
            String(b.bid_amount).includes(q)
          ) {
            results.push({
              id: b.id,
              type: "bid",
              title: `My Bid: ${tenderTitle || "Tender"}`,
              subtitle: `₹${b.bid_amount?.toLocaleString("en-IN")} · ${b.status}`,
              href: `/contractor/bids`,
              badge: b.status,
              badgeColor:
                b.status === "accepted"
                  ? "emerald"
                  : b.status === "rejected"
                  ? "rose"
                  : "amber",
            });
          }
        }
      }
    }

    // ─── OWNER: Search Contractors by name/company ─────────────────────────
    if (role === "owner") {
      const { data: contractors } = await supabase
        .from("contractors")
        .select("id, company_name, contact_person, city, years_of_experience, average_rating")
        .or(
          `company_name.ilike.%${q}%,contact_person.ilike.%${q}%,city.ilike.%${q}%`
        )
        .limit(4);

      if (contractors) {
        for (const c of contractors) {
          results.push({
            id: c.id,
            type: "contractor",
            title: c.company_name || c.contact_person,
            subtitle: `${c.city || "India"} · ${c.years_of_experience || 0} yrs exp${c.average_rating ? ` · ⭐ ${c.average_rating}` : ""}`,
            href: `/owner/bids`,
            badge: "Contractor",
            badgeColor: "blue",
          });
        }
      }
    }

    // ─── CONTRACTOR: Search Owners (public info only) ──────────────────────
    if (role === "contractor") {
      const { data: owners } = await supabase
        .from("owners")
        .select("id, full_name, city")
        .or(`full_name.ilike.%${q}%,city.ilike.%${q}%`)
        .limit(3);

      if (owners) {
        for (const o of owners) {
          results.push({
            id: o.id,
            type: "contractor",
            title: o.full_name || "Property Owner",
            subtitle: o.city || "India",
            href: `/contractor/tenders`,
            badge: "Owner",
            badgeColor: "orange",
          });
        }
      }
    }

    // ─── SHARED: Search Documents ──────────────────────────────────────────
    const { data: docs } = await supabase
      .from("project_documents")
      .select("id, file_name, file_type, projects(title, owner_id)")
      .ilike("file_name", `%${q}%`)
      .limit(3);

    if (docs) {
      for (const d of docs) {
        const proj = Array.isArray(d.projects) ? d.projects[0] : (d.projects as any);
        // Only show documents for the user's own projects
        if (role === "owner" && proj?.owner_id !== user.id) continue;
        results.push({
          id: d.id,
          type: "document",
          title: d.file_name,
          subtitle: `${proj?.title || "Project document"} · ${d.file_type?.toUpperCase() || "FILE"}`,
          href: role === "owner" ? `/owner/documents` : `/contractor/documents`,
          badge: d.file_type?.toUpperCase() || "DOC",
          badgeColor: "slate",
        });
      }
    }

    // De-duplicate by id+type and cap at 10 results
    const seen = new Set<string>();
    const deduped = results.filter((r) => {
      const key = `${r.type}:${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { results: deduped.slice(0, 10) };
  } catch (err: any) {
    console.error("dashboardSearchAction error:", err);
    return { results: [], error: err.message };
  }
}
