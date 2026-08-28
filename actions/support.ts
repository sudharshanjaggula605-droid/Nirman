"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface SupportSubmissionResult {
  success: boolean;
  request_number?: string;
  error?: string;
}

export async function submitSupportRequestAction(
  formData: FormData
): Promise<SupportSubmissionResult> {
  try {
    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const phone = (formData.get("phone") as string || "").trim();
    const user_type = (formData.get("user_type") as string || "").trim();
    const issue_type = (formData.get("issue_type") as string || "").trim();
    const subject = (formData.get("subject") as string || "").trim();
    const message = (formData.get("message") as string || "").trim();
    const attachmentFile = formData.get("attachment") as File | null;

    // Validation
    if (!name) return { success: false, error: "Please enter your full name." };
    if (!email || !/\S+@\S+\.\S+/.test(email)) return { success: false, error: "Please enter a valid email address." };
    if (!user_type) return { success: false, error: "Please select your user type." };
    if (!issue_type) return { success: false, error: "Please select an issue type." };
    if (!subject) return { success: false, error: "Please enter a subject." };
    if (!message) return { success: false, error: "Please describe your issue." };

    const supabase = createClient();
    const adminClient = createAdminClient();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id || null;

    let attachment_url: string | null = null;

    // Handle File Attachment if present
    if (attachmentFile && attachmentFile.size > 0) {
      if (attachmentFile.size > 5 * 1024 * 1024) {
        return { success: false, error: "Attachment file size must be less than 5MB." };
      }

      const fileExt = attachmentFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `support/${fileName}`;

      const buffer = Buffer.from(await attachmentFile.arrayBuffer());
      const { error: uploadErr } = await adminClient.storage
        .from('support-attachments')
        .upload(filePath, buffer, {
          contentType: attachmentFile.type,
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = adminClient.storage
          .from('support-attachments')
          .getPublicUrl(filePath);
        attachment_url = publicUrlData?.publicUrl || null;
      } else {
        console.error("Storage upload warning:", uploadErr);
      }
    }

    // Insert into support_requests table
    // Using admin client to bypass potential public RLS restriction edge-cases while keeping secrets on server
    const { data: inserted, error: insertErr } = await adminClient
      .from("support_requests")
      .insert({
        user_id,
        name,
        email,
        phone: phone || null,
        user_type,
        issue_type,
        subject,
        message,
        attachment_url,
        status: "open",
      })
      .select("request_number")
      .single();

    if (insertErr) {
      console.error("Database error inserting support request:", insertErr);
      return { success: false, error: "Unable to submit your request. Please try again." };
    }

    const request_number = inserted?.request_number || "NIR-1001";

    // Insert into messages table as well so it appears in the chat option!
    if (user_id) {
      try {
        const { data: adminProfiles } = await adminClient
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1);

        const adminId = adminProfiles?.[0]?.id || "5b7ec4ee-e9e8-43a1-ba7e-56bfc3f71c05";

        await adminClient.from("messages").insert({
          sender_id: user_id,
          receiver_id: adminId,
          content: `[SUPPORT COMPLAINT ${request_number}] ${issue_type} - ${subject}\n\n${message}`,
          image_url: attachment_url || null,
          attachment_url: attachment_url || null,
          read: false,
        });
      } catch (chatMsgErr) {
        console.error("Failed to post support request into chat messages:", chatMsgErr);
      }
    }

    // Notify all admin users via notifications table
    try {
      const { data: adminProfiles } = await adminClient
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (adminProfiles && adminProfiles.length > 0) {
        const notificationsToInsert = adminProfiles.map((admin) => ({
          user_id: admin.id,
          title: "🔔 New Support Request",
          message: `${request_number} - ${issue_type} (${user_type}): ${subject}`,
          type: "support_request",
        }));
        await adminClient.from("notifications").insert(notificationsToInsert);
      }
    } catch (notifErr) {
      console.error("Failed to create admin notifications:", notifErr);
    }

    revalidatePath("/admin/support");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      request_number,
    };
  } catch (err: any) {
    console.error("Unexpected error in submitSupportRequestAction:", err);
    return { success: false, error: "Unable to submit your request. Please try again." };
  }
}

export async function updateSupportRequestAction(
  requestId: string,
  status: string,
  adminResponse?: string
) {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Admin access required." };
    }

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (typeof adminResponse === "string") {
      updatePayload.admin_response = adminResponse;
    }

    const { error } = await adminClient
      .from("support_requests")
      .update(updatePayload)
      .eq("id", requestId);

    if (error) {
      console.error("Failed to update support request:", error);
      return { success: false, error: "Failed to update support request." };
    }

    revalidatePath("/admin/support");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateSupportRequestAction:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
