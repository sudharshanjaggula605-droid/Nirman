"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * 1. Submit Bid (Contractor)
 */
export async function submitBidAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated. Please log in as a Contractor." };

  const adminClient = createAdminClient();

  const tender_id = formData.get("tender_id") as string;
  const quotation_amount = parseFloat(formData.get("quotation_amount") as string);
  const estimated_completion_days = parseInt(formData.get("estimated_completion_days") as string, 10);
  const proposed_start_date = (formData.get("proposed_start_date") as string) || null;
  const proposal = formData.get("proposal") as string;
  const additional_notes = (formData.get("additional_notes") as string) || null;

  const material_cost = parseFloat((formData.get("material_cost") as string) || "0");
  const labour_cost = parseFloat((formData.get("labour_cost") as string) || "0");
  const equipment_cost = parseFloat((formData.get("equipment_cost") as string) || "0");
  const other_cost = parseFloat((formData.get("other_cost") as string) || "0");

  // Verify Tender is Open/Active
  const { data: tender, error: tenderErr } = await adminClient
    .from("tenders")
    .select("id, status, owner_id, title")
    .eq("id", tender_id)
    .single();

  if (tenderErr || !tender) {
    return { error: "Tender not found." };
  }

  if (tender.status !== "active" && tender.status !== "draft") {
    return { error: "This tender is already closed or awarded to another contractor." };
  }

  // 1. Insert Bid
  const { data: bid, error: bidError } = await adminClient
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
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (bidError) {
    if (bidError.code === "23505") {
      return { error: "You have already submitted a bid for this tender. You can edit your existing bid instead." };
    }
    return { error: bidError.message };
  }

  // 2. Insert Cost Breakdown
  const total_cost = material_cost + labour_cost + equipment_cost + other_cost;
  try {
    await adminClient.from("bid_cost_breakdowns").insert({
      bid_id: bid.id,
      material_cost,
      labour_cost,
      equipment_cost,
      other_cost,
      total_cost: total_cost > 0 ? total_cost : quotation_amount,
    });
  } catch (cbErr) {
    console.warn("Cost breakdown notice:", cbErr);
  }

  // 3. Notify Owner
  try {
    const { data: contractor } = await adminClient
      .from("contractors")
      .select("company_name, contact_person")
      .eq("id", user.id)
      .maybeSingle();

    const contractorName = contractor?.company_name || contractor?.contact_person || "A licensed contractor";

    await adminClient.from("notifications").insert({
      user_id: tender.owner_id,
      title: "New Bid Received! 📋",
      message: `${contractorName} submitted a quotation of ₹${quotation_amount.toLocaleString("en-IN")} for tender: ${tender.title}`,
      type: "new_bid",
      reference_id: tender_id,
      created_at: new Date().toISOString(),
    });
  } catch {}

  revalidatePath(`/tenders/${tender_id}`);
  revalidatePath("/contractor/bids");
  revalidatePath(`/owner/tenders/${tender_id}/bids`);

  return { success: true, bid };
}

/**
 * 2. Edit Submitted Bid (Contractor)
 */
export async function editBidAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated. Please log in as a Contractor." };

  const adminClient = createAdminClient();

  const bid_id = formData.get("bid_id") as string;
  const quotation_amount = parseFloat(formData.get("quotation_amount") as string);
  const estimated_completion_days = parseInt(formData.get("estimated_completion_days") as string, 10);
  const proposed_start_date = (formData.get("proposed_start_date") as string) || null;
  const proposal = formData.get("proposal") as string;
  const additional_notes = (formData.get("additional_notes") as string) || null;

  const material_cost = parseFloat((formData.get("material_cost") as string) || "0");
  const labour_cost = parseFloat((formData.get("labour_cost") as string) || "0");
  const equipment_cost = parseFloat((formData.get("equipment_cost") as string) || "0");
  const other_cost = parseFloat((formData.get("other_cost") as string) || "0");

  // 1. Verify Bid exists and belongs to contractor
  const { data: existingBid, error: bidFetchErr } = await adminClient
    .from("bids")
    .select("*, tender:tenders(*)")
    .eq("id", bid_id)
    .single();

  if (bidFetchErr || !existingBid) {
    return { error: "Bid not found." };
  }

  if (existingBid.contractor_id !== user.id) {
    return { error: "Unauthorized: You can only edit your own bids." };
  }

  if (existingBid.status === "accepted") {
    return { error: "Cannot edit this bid because it has already been accepted by the owner." };
  }

  // 2. Update Bid record
  const { data: updatedBid, error: updateErr } = await adminClient
    .from("bids")
    .update({
      quotation_amount,
      estimated_completion_days,
      proposed_start_date,
      proposal,
      additional_notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bid_id)
    .select()
    .single();

  if (updateErr) {
    return { error: updateErr.message };
  }

  // 3. Upsert Cost Breakdown
  const total_cost = material_cost + labour_cost + equipment_cost + other_cost;
  try {
    const { data: existingBreakdown } = await adminClient
      .from("bid_cost_breakdowns")
      .select("id")
      .eq("bid_id", bid_id)
      .maybeSingle();

    if (existingBreakdown?.id) {
      await adminClient
        .from("bid_cost_breakdowns")
        .update({
          material_cost,
          labour_cost,
          equipment_cost,
          other_cost,
          total_cost: total_cost > 0 ? total_cost : quotation_amount,
        })
        .eq("id", existingBreakdown.id);
    } else {
      await adminClient.from("bid_cost_breakdowns").insert({
        bid_id,
        material_cost,
        labour_cost,
        equipment_cost,
        other_cost,
        total_cost: total_cost > 0 ? total_cost : quotation_amount,
      });
    }
  } catch (cbErr) {
    console.warn("Cost breakdown update note:", cbErr);
  }

  revalidatePath("/contractor/bids");
  revalidatePath(`/owner/tenders/${existingBid.tender_id}/bids`);
  revalidatePath(`/owner/tenders/${existingBid.tender_id}/compare`);

  return { success: true, bid: updatedBid };
}

/**
 * 3. Delete Submitted Bid (Contractor)
 */
export async function deleteBidAction(bidId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated. Please log in as a Contractor." };

  const adminClient = createAdminClient();

  // 1. Verify Bid exists and belongs to contractor
  const { data: existingBid, error: bidFetchErr } = await adminClient
    .from("bids")
    .select("*, tender:tenders(title)")
    .eq("id", bidId)
    .single();

  if (bidFetchErr || !existingBid) {
    return { error: "Bid not found." };
  }

  if (existingBid.contractor_id !== user.id) {
    return { error: "Unauthorized: You can only delete your own bids." };
  }

  if (existingBid.status === "accepted") {
    return { error: "Cannot delete this bid because it has already been accepted and awarded." };
  }

  // 2. Delete cost breakdown first
  try {
    await adminClient.from("bid_cost_breakdowns").delete().eq("bid_id", bidId);
  } catch {}

  // 3. Delete bid record from database
  const { error: deleteErr } = await adminClient.from("bids").delete().eq("id", bidId);

  if (deleteErr) {
    return { error: deleteErr.message };
  }

  revalidatePath("/contractor/bids");
  revalidatePath(`/owner/tenders/${existingBid.tender_id}/bids`);
  revalidatePath(`/owner/tenders/${existingBid.tender_id}/compare`);

  return { success: true, message: "Bid deleted successfully." };
}

/**
 * 4. Reject Bid (Owner)
 */
export async function rejectBidAction(bidId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated. Please log in as Property Owner." };

  const adminClient = createAdminClient();

  // 1. Verify Bid and Owner Permission
  const { data: bid, error: bidErr } = await adminClient
    .from("bids")
    .select("*, tender:tenders(*)")
    .eq("id", bidId)
    .single();

  if (bidErr || !bid) {
    return { error: "Bid not found." };
  }

  if (bid.tender?.owner_id !== user.id) {
    return { error: "Unauthorized: You do not own this tender." };
  }

  if (bid.status === "accepted") {
    return { error: "Cannot reject a bid that has already been accepted." };
  }

  // 2. Update Bid status to 'rejected'
  const { error: updateErr } = await adminClient
    .from("bids")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bidId);

  if (updateErr) {
    return { error: updateErr.message };
  }

  // 3. Notify Contractor
  try {
    await adminClient.from("notifications").insert({
      user_id: bid.contractor_id,
      title: "Bid Status Update",
      message: `Your quotation for tender "${bid.tender?.title || "Project"}" was reviewed and rejected by the property owner.`,
      type: "bid_rejected",
      reference_id: bid.tender_id,
      created_at: new Date().toISOString(),
    });
  } catch {}

  revalidatePath(`/owner/tenders/${bid.tender_id}/bids`);
  revalidatePath(`/owner/tenders/${bid.tender_id}/compare`);
  revalidatePath("/owner/bids");
  revalidatePath("/contractor/bids");

  return { success: true };
}

/**
 * 5. Accept Bid (Owner Direct or Finalized Selection)
 */
export async function acceptBidAction(bidId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated. Please log in as Property Owner." };

  const adminClient = createAdminClient();

  // 1. Verify Bid and Tender Ownership
  const { data: bid, error: bidErr } = await adminClient
    .from("bids")
    .select("*, tender:tenders(*, project:projects(*)), contractor:contractors(*)")
    .eq("id", bidId)
    .single();

  if (bidErr || !bid) return { error: "Bid not found." };

  const tender = bid.tender;
  if (!tender || tender.owner_id !== user.id) {
    return { error: "Unauthorized: You do not own this tender." };
  }

  if (tender.status === "awarded" || tender.status === "completed") {
    return { error: "A contractor has already been accepted for this tender." };
  }

  if (bid.status === "accepted") {
    return { error: "This bid is already accepted." };
  }

  const projectId = tender.project_id || tender.project?.id;
  const contractorId = bid.contractor_id;
  const contractorName =
    bid.contractor?.company_name || bid.contractor?.contact_person || "Awarded Contractor";
  const now = new Date().toISOString();

  // 2. Transactional Updates: Accept selected bid, reject other bids for this tender
  await Promise.all([
    adminClient.from("bids").update({ status: "accepted", updated_at: now }).eq("id", bidId),
    adminClient
      .from("bids")
      .update({ status: "rejected", updated_at: now })
      .eq("tender_id", tender.id)
      .neq("id", bidId),
    adminClient.from("tenders").update({ status: "awarded", updated_at: now }).eq("id", tender.id),
    adminClient
      .from("projects")
      .update({
        status: "active",
        contractor_id: contractorId,
        contractor_name: contractorName,
        updated_at: now,
      })
      .eq("id", projectId),
  ]);

  // 3. Increment Contractor total awarded projects
  try {
    const { data: cRecord } = await adminClient
      .from("contractors")
      .select("total_projects")
      .eq("id", contractorId)
      .single();
    if (cRecord) {
      await adminClient
        .from("contractors")
        .update({
          total_projects: (cRecord.total_projects || 0) + 1,
          updated_at: now,
        })
        .eq("id", contractorId);
    }
  } catch {}

  // 4. Log Admin Action for Connection History
  try {
    await adminClient.from("admin_actions").insert({
      admin_id: user.id,
      target_user_id: contractorId,
      action: "contractor_awarded",
      reason: `Owner accepted contractor ${contractorName} for tender ${tender.title} (Amount: ₹${bid.quotation_amount})`,
    });
  } catch {}

  // 5. Dispatch in-app notifications
  try {
    await adminClient.from("notifications").insert([
      {
        user_id: user.id,
        title: "Contractor Appointed! ✓",
        message: `You have successfully accepted ${contractorName} for project: ${tender.title}. Project status is now ACTIVE.`,
        type: "bid_accepted",
        reference_id: projectId,
        created_at: now,
      },
      {
        user_id: contractorId,
        title: "Congratulations! Project Awarded 🏗️",
        message: `Your bid of ₹${bid.quotation_amount.toLocaleString("en-IN")} has been accepted by the property owner! Project status is now ACTIVE.`,
        type: "bid_accepted",
        reference_id: projectId,
        created_at: now,
      },
    ]);

    // Notify all Admins
    const { data: admins } = await adminClient.from("profiles").select("id").eq("role", "admin");
    if (admins && admins.length > 0) {
      await adminClient.from("notifications").insert(
        admins.map((adm) => ({
          user_id: adm.id,
          title: "New Owner–Contractor Connection Formed 🤝",
          message: `Owner accepted ${contractorName} for ${tender.title} (Quotation: ₹${bid.quotation_amount.toLocaleString("en-IN")}).`,
          type: "connection_created",
          reference_id: projectId,
          created_at: now,
        }))
      );
    }
  } catch {}

  revalidatePath("/");
  revalidatePath("/owner/tenders");
  revalidatePath(`/owner/tenders/${tender.id}/bids`);
  revalidatePath(`/owner/tenders/${tender.id}/compare`);
  revalidatePath("/owner/projects");
  revalidatePath("/contractor/projects");
  revalidatePath("/contractor/bids");
  revalidatePath("/admin/connections");
  revalidatePath("/admin/dashboard");

  return { success: true, projectId };
}
