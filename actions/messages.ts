"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(receiverId: string, content: string, projectId?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };
  if (!content.trim()) return { error: "Message content cannot be empty" };

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      project_id: projectId || null,
      content,
      read: false,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/owner/messages");
  revalidatePath("/contractor/messages");

  return { success: true, message };
}
