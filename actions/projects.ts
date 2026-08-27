"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProjectAndPublishTender(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const rawCategoryId = formData.get("category_id") as string;
  const categoryName = formData.get("category_name") as string;
  const property_type = formData.get("property_type") as string;
  const area_sqft = parseFloat(formData.get("area_sqft") as string || "0");
  const estimated_budget = parseFloat(formData.get("estimated_budget") as string || "0");
  const location = formData.get("location") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const pincode = formData.get("pincode") as string;
  const start_date = formData.get("start_date") as string || null;
  const expected_completion_date = formData.get("expected_completion_date") as string || null;
  const bid_deadline = formData.get("bid_deadline") as string;
  const actionType = formData.get("actionType") as string; // "draft" or "publish"

  const isPublishing = actionType === "publish";

  // Validate UUID or resolve category ID from project_categories table
  const isValidUUID = (id?: string | null) =>
    Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

  let category_id: string | null = isValidUUID(rawCategoryId) ? rawCategoryId : null;

  if (!category_id && categoryName) {
    const { data: catData } = await supabase
      .from("project_categories")
      .select("id")
      .ilike("name", `%${categoryName}%`)
      .limit(1)
      .maybeSingle();

    if (catData?.id) {
      category_id = catData.id;
    }
  }

  // 1. Insert Project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      category_id: category_id,
      title,
      description,
      property_type,
      area_sqft,
      estimated_budget,
      location,
      city,
      state,
      pincode,
      start_date,
      expected_completion_date,
      status: isPublishing ? "tender" : "draft",
    })
    .select()
    .single();

  if (projectError) {
    return { error: projectError.message };
  }

  // 2. Insert Tender
  const { data: tender, error: tenderError } = await supabase
    .from("tenders")
    .insert({
      project_id: project.id,
      owner_id: user.id,
      title: `Tender for ${title}`,
      description,
      budget_min: estimated_budget * 0.9,
      budget_max: estimated_budget * 1.1,
      bid_deadline: new Date(bid_deadline).toISOString(),
      status: isPublishing ? "active" : "draft",
      published_at: isPublishing ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (tenderError) {
    return { error: tenderError.message };
  }

  // 3. Insert Project Documents / Attachments (if uploaded)
  const attachmentsRaw = formData.get("attachments") as string;
  if (attachmentsRaw) {
    try {
      const attachments = JSON.parse(attachmentsRaw);
      if (Array.isArray(attachments) && attachments.length > 0) {
        const docsToInsert = attachments.map((att: any) => ({
          project_id: project.id,
          file_name: att.name || att.file_name || "Blueprint Attachment",
          file_url: att.url || att.file_url || "#",
          storage_path: att.storage_path || `projects/${project.id}/${att.name}`,
          file_type: att.type || att.file_type || "pdf",
          file_size: att.size || att.file_size || 0,
          uploaded_by: user.id,
        }));

        await supabase.from("project_documents").insert(docsToInsert);
      }
    } catch (docErr) {
      console.error("Error inserting project documents:", docErr);
    }
  }

  revalidatePath("/");
  revalidatePath("/owner/tenders");
  revalidatePath("/owner/projects");

  return { success: true, project, tender };
}
