"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * 1. Edit Published Tender (Owner)
 */
export async function editTenderAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated. Please log in as Property Owner." };

  const adminClient = createAdminClient();

  const tender_id = formData.get("tender_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const budget_min = parseFloat((formData.get("budget_min") as string) || "0");
  const budget_max = parseFloat((formData.get("budget_max") as string) || "0");
  const bid_deadline = formData.get("bid_deadline") as string;

  if (!tender_id || !title.trim()) {
    return { error: "Tender title and ID are required." };
  }

  // 1. Verify Tender ownership
  const { data: tender, error: fetchErr } = await adminClient
    .from("tenders")
    .select("*, project:projects(*)")
    .eq("id", tender_id)
    .single();

  if (fetchErr || !tender) {
    return { error: "Tender not found." };
  }

  if (tender.owner_id !== user.id) {
    return { error: "Unauthorized: You can only edit your own tenders." };
  }

  if (tender.status === "awarded" || tender.status === "completed") {
    return { error: "Cannot edit this tender because a contractor has already been awarded." };
  }

  // 2. Update Tender
  const { data: updatedTender, error: updateErr } = await adminClient
    .from("tenders")
    .update({
      title: title.trim(),
      description: description?.trim() || "",
      budget_min: budget_min > 0 ? budget_min : tender.budget_min,
      budget_max: budget_max > 0 ? budget_max : tender.budget_max,
      bid_deadline: bid_deadline ? new Date(bid_deadline).toISOString() : tender.bid_deadline,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tender_id)
    .select()
    .single();

  if (updateErr) {
    return { error: updateErr.message };
  }

  // Also update project title if associated
  if (tender.project_id) {
    await adminClient
      .from("projects")
      .update({
        title: title.trim().replace(/^Tender for\s+/i, ""),
        description: description?.trim() || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tender.project_id);
  }

  revalidatePath("/");
  revalidatePath("/owner/tenders");
  revalidatePath(`/owner/tenders/${tender_id}/bids`);
  revalidatePath(`/tenders/${tender_id}`);
  revalidatePath("/contractor/tenders");

  return { success: true, tender: updatedTender };
}

/**
 * 2. Delete Published Tender (Owner)
 */
export async function deleteTenderAction(tenderId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated. Please log in as Property Owner." };

  const adminClient = createAdminClient();

  // 1. Verify Tender ownership
  const { data: tender, error: fetchErr } = await adminClient
    .from("tenders")
    .select("*, bids:bids(id, status)")
    .eq("id", tenderId)
    .single();

  if (fetchErr || !tender) {
    return { error: "Tender not found." };
  }

  if (tender.owner_id !== user.id) {
    return { error: "Unauthorized: You can only delete your own tenders." };
  }

  if (tender.status === "awarded" || tender.status === "completed") {
    return { error: "Cannot delete this tender because a contractor has already been awarded." };
  }

  // Check if any bid is accepted
  const hasAcceptedBid = tender.bids?.some((b: any) => b.status === "accepted");
  if (hasAcceptedBid) {
    return { error: "Cannot delete tender with an accepted contractor bid." };
  }

  // 2. Delete associated bids and cost breakdowns safely
  const bidIds = (tender.bids || []).map((b: any) => b.id);
  if (bidIds.length > 0) {
    await adminClient.from("bid_cost_breakdowns").delete().in("bid_id", bidIds);
    await adminClient.from("bids").delete().eq("tender_id", tenderId);
  }

  // 3. Delete tender record
  const { error: deleteErr } = await adminClient.from("tenders").delete().eq("id", tenderId);

  if (deleteErr) {
    return { error: deleteErr.message };
  }

  revalidatePath("/");
  revalidatePath("/owner/tenders");
  revalidatePath("/contractor/tenders");
  revalidatePath("/contractor/bids");

  return { success: true, message: "Tender deleted successfully." };
}

/**
 * 3. Fetch Owner's Tenders with Live Bids Count
 */
export async function getOwnerTendersAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated", tenders: [] };

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("tenders")
    .select("*, project:projects(title, location, city), bids:bids(*)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, tenders: [] };
  }

  const formatted = (data || []).map((t) => ({
    ...t,
    bids_count: t.bids?.length || 0,
    has_accepted_bid: t.bids?.some((b: any) => b.status === "accepted") || t.status === "awarded",
  }));

  return { success: true, tenders: formatted };
}
