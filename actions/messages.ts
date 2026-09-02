"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Get or create a conversation between two users in public.conversations & public.conversation_participants
 */
export async function getOrCreateConversationId(userA: string, userB: string): Promise<string | null> {
  try {
    const adminClient = createAdminClient();

    // 1. Find existing conversation shared by both userA and userB
    const { data: partA } = await adminClient
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userA);

    if (partA && partA.length > 0) {
      const convIds = partA.map((p) => p.conversation_id);

      const { data: partB } = await adminClient
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userB)
        .in("conversation_id", convIds)
        .limit(1);

      if (partB && partB.length > 0) {
        return partB[0].conversation_id;
      }
    }

    // 2. Create new conversation if none exists
    const { data: newConv, error: convErr } = await adminClient
      .from("conversations")
      .insert({})
      .select("id")
      .single();

    if (convErr || !newConv) {
      console.error("Error creating conversation:", convErr);
      return null;
    }

    const convId = newConv.id;

    // Add both users to conversation_participants
    await adminClient.from("conversation_participants").insert([
      { conversation_id: convId, user_id: userA },
      { conversation_id: convId, user_id: userB },
    ]);

    return convId;
  } catch (err) {
    console.error("Unexpected error in getOrCreateConversationId:", err);
    return null;
  }
}

/**
 * Send a message using exact database column names (conversation_id, sender_id, receiver_id, message, attachment_url)
 */
export async function sendMessageAction(
  receiverId: string,
  content: string,
  imageUrl?: string,
  projectId?: string
) {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthenticated" };
    if (!content.trim() && !imageUrl) return { error: "Message content cannot be empty" };

    const messageText = content.trim();

    // Get or create conversation ID
    const convId = await getOrCreateConversationId(user.id, receiverId);

    if (!convId) {
      return { error: "Unable to establish conversation link with recipient." };
    }

    // Payload populating both conversation_id AND receiver_id for 100% database compatibility
    const insertPayload: any = {
      conversation_id: convId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: messageText || "Attachment Photo",
      attachment_url: imageUrl || null,
      attachment_type: imageUrl ? "image" : null,
      is_read: false,
    };

    const { data: insertedMsg, error: insertErr } = await adminClient
      .from("messages")
      .insert(insertPayload)
      .select()
      .single();

    if (insertErr) {
      console.error("Error inserting chat message:", insertErr);
      return { error: insertErr.message };
    }

    return {
      success: true,
      message: {
        id: insertedMsg.id,
        conversation_id: insertedMsg.conversation_id,
        sender_id: insertedMsg.sender_id,
        receiver_id: insertedMsg.receiver_id,
        content: insertedMsg.message || "",
        image_url: insertedMsg.attachment_url || null,
        created_at: insertedMsg.created_at,
      },
    };
  } catch (err: any) {
    console.error("Unexpected error in sendMessageAction:", err);
    return { error: err.message || "Failed to send message" };
  }
}

/**
 * Fetch all available chat contacts with true UUIDs from Supabase profiles
 */
export async function getChatContactsAction() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthenticated", contacts: [] };

    // Fetch all profiles across platform using adminClient
    const { data: profiles, error } = await adminClient
      .from("profiles")
      .select("*, contractor:contractors(*), owner:owners(*)")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching chat profiles:", error);
      return { error: error.message, contacts: [] };
    }

    return { success: true, currentUserId: user.id, contacts: profiles || [] };
  } catch (err: any) {
    console.error("Unexpected error in getChatContactsAction:", err);
    return { error: err.message, contacts: [] };
  }
}

/**
 * Fetch 1-on-1 direct conversation messages via conversation_id AND mark as read
 */
export async function getConversationMessagesAction(otherUserId: string) {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !otherUserId) return { error: "Unauthenticated", messages: [] };

    // Find conversation ID
    const convId = await getOrCreateConversationId(user.id, otherUserId);

    if (!convId) {
      return { success: true, messages: [] };
    }

    const { data: chatMessages, error } = await adminClient
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching conversation messages:", error);
      return { error: error.message, messages: [] };
    }

    // Automatically mark all incoming unread messages from this contact as read in DB
    await markMessagesAsReadAction(otherUserId);

    // Standardize message properties for UI consumption
    const formattedMessages = (chatMessages || []).map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      content: m.message || "",
      image_url: m.attachment_url || null,
      created_at: m.created_at,
      is_read: true, // Marked as read upon viewing
    }));

    return { success: true, messages: formattedMessages };
  } catch (err: any) {
    console.error("Unexpected error in getConversationMessagesAction:", err);
    return { error: err.message, messages: [] };
  }
}

/**
 * Admin Audit Action: Fetch messages involving a specific user, pair, or all platform messages
 */
export async function getAdminMessagesAction(params: {
  viewMode: "USER_AUDIT" | "ALL_PLATFORM" | "PAIR_MONITOR";
  selectedUserId?: string;
  ownerId?: string;
  contractorId?: string;
}) {
  try {
    const adminClient = createAdminClient();
    let chatMessages: any[] = [];

    if (params.viewMode === "USER_AUDIT" && params.selectedUserId) {
      // Find all conversations where selectedUserId is a participant
      const { data: participantConvs } = await adminClient
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", params.selectedUserId);

      if (participantConvs && participantConvs.length > 0) {
        const convIds = participantConvs.map((p) => p.conversation_id);
        const { data: msgs } = await adminClient
          .from("messages")
          .select("*")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: true });
        chatMessages = msgs || [];
      }
    } else if (params.viewMode === "PAIR_MONITOR" && params.ownerId && params.contractorId) {
      const convId = await getOrCreateConversationId(params.ownerId, params.contractorId);
      if (convId) {
        const { data: msgs } = await adminClient
          .from("messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });
        chatMessages = msgs || [];
      }
    } else {
      // ALL_PLATFORM feed
      const { data: msgs } = await adminClient
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(300);
      chatMessages = msgs || [];
    }

    const formattedMessages = chatMessages.map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      content: m.message || "",
      image_url: m.attachment_url || null,
      created_at: m.created_at,
      is_read: m.is_read,
    }));

    return { success: true, messages: formattedMessages };
  } catch (err: any) {
    console.error("Unexpected error in getAdminMessagesAction:", err);
    return { error: err.message, messages: [] };
  }
}

/**
 * Fetch exact unread chat message count for the authenticated logged-in user
 * Strictly counts messages where: recipient = logged-in user AND is_read = false
 */
export async function getUnreadMessageCountAction() {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { count: 0 };

    const unreadIds = new Set<string>();

    // 1. Direct receiver_id match
    const { data: directUnread } = await adminClient
      .from("messages")
      .select("id")
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (directUnread) {
      directUnread.forEach((m) => unreadIds.add(m.id));
    }

    // 2. Conversation participants match (messages sent by OTHER participants in user's conversations)
    const { data: userConvs } = await adminClient
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (userConvs && userConvs.length > 0) {
      const convIds = userConvs.map((c) => c.conversation_id);
      const { data: convUnread } = await adminClient
        .from("messages")
        .select("id")
        .in("conversation_id", convIds)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      if (convUnread) {
        convUnread.forEach((m) => unreadIds.add(m.id));
      }
    }

    return { count: unreadIds.size };
  } catch (err: any) {
    console.error("Unexpected error in getUnreadMessageCountAction:", err);
    return { count: 0 };
  }
}

/**
 * Explicitly mark all incoming unread messages from a contact as read in database
 */
export async function markMessagesAsReadAction(otherUserId: string) {
  try {
    const supabase = createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !otherUserId) return { success: false };

    // 1. Mark as read by conversation_id
    const convId = await getOrCreateConversationId(user.id, otherUserId);
    if (convId) {
      await adminClient
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", convId)
        .neq("sender_id", user.id);
    }

    // 2. Mark as read by direct receiver_id & sender_id
    await adminClient
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", otherUserId)
      .eq("receiver_id", user.id);

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in markMessagesAsReadAction:", err);
    return { success: false };
  }
}
