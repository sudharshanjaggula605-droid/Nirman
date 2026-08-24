"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitBidAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const tender_id = formData.get("tender_id") as string;
  const quotation_amount = parseFloat(formData.get("quotation_amount") as string);
  const estimated_completion_days = parseInt(formData.get("estimated_completion_days") as string, 10);
  const proposed_start_date = formData.get("proposed_start_date") as string || null;
  const proposal = formData.get("proposal") as string;
  const additional_notes = formData.get("additional_notes") as string || null;

  const material_cost = parseFloat(formData.get("material_cost") as string || "0");
  const labour_cost = parseFloat(formData.get("labour_cost") as string || "0");
  const equipment_cost = parseFloat(formData.get("equipment_cost") as string || "0");
  const other_cost = parseFloat(formData.get("other_cost") as string || "0");

  // 1. Insert Bid
  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .insert({
      tender_id,
      contractor_id: user.id,
      quotation_amount,
      estimated_completion_days,
      proposed_start_date,
      proposal,
      additional_notes,
      status: "pending",
    })
    .select()
    .single();

  if (bidError) {
    if (bidError.code === "23505") {
      return { error: "You have already submitted a bid for this tender." };
    }
    return { error: bidError.message };
  }

  // 2. Insert Cost Breakdown
  const total_cost = material_cost + labour_cost + equipment_cost + other_cost;
  await supabase.from("bid_cost_breakdowns").insert({
    bid_id: bid.id,
    material_cost,
    labour_cost,
    equipment_cost,
    other_cost,
    total_cost: total_cost > 0 ? total_cost : quotation_amount,
  });

  revalidatePath(`/tenders/${tender_id}`);
  revalidatePath("/contractor/bids");

  return { success: true, bid };
}

export async function acceptBidAction(bidId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  // Call the SECURITY DEFINER RPC function accept_bid
  const { error } = await supabase.rpc("accept_bid", {
    p_bid_id: bidId,
    p_owner_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/owner/tenders");
  revalidatePath("/owner/projects");

  return { success: true };
}
