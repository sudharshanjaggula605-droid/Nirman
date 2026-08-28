"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Get exact count of unread notifications from database for logged in user
 */
export async function getUnreadNotificationCountAction() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { count: 0 };

    const { count, error } = await adminClient
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread notification count:", error);
      return { count: 0 };
    }

    return { count: count || 0 };
  } catch (err) {
    console.error("Unexpected error in getUnreadNotificationCountAction:", err);
    return { count: 0 };
  }
}

/**
 * Mark all unread notifications as read for logged in user
 */
export async function markNotificationsAsReadAction() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await adminClient
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking notifications as read:", error);
    }

    revalidatePath("/owner/notifications");
    revalidatePath("/contractor/notifications");
    revalidatePath("/admin/notifications");

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in markNotificationsAsReadAction:", err);
    return { success: false };
  }
}
