"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUserAction(targetUserId: string, reason?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase.rpc("approve_user", {
    p_target_user_id: targetUserId,
    p_admin_id: user.id,
    p_reason: reason || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/owners");
  revalidatePath("/admin/contractors");

  return { success: true };
}

export async function rejectUserAction(targetUserId: string, reason?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase.rpc("reject_user", {
    p_target_user_id: targetUserId,
    p_admin_id: user.id,
    p_reason: reason || "Account application was not approved.",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/approvals");

  return { success: true };
}
