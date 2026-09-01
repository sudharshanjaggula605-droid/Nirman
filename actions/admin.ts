"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

import { sendApprovalNotification } from "@/lib/notifications/service";

export async function approveUserAction(targetUserId: string, reason?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const adminClient = createAdminClient();

  // 1. Direct admin client update for guaranteed status approval
  const { data: targetProfile, error: profileErr } = await adminClient
    .from("profiles")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId)
    .select("full_name, phone, role, email")
    .single();

  // Try RPC as fallback
  await adminClient.rpc("approve_user", {
    p_target_user_id: targetUserId,
    p_admin_id: user.id,
    p_reason: reason || null,
  });

  // 2. Dispatch WhatsApp & Email Approval Notification to registered contact details
  let notificationStatus = "logged";
  let channelSummary = "";
  if (targetProfile) {
    try {
      const notifRes = await sendApprovalNotification({
        userId: targetUserId,
        phone: targetProfile.phone,
        email: targetProfile.email,
        name: targetProfile.full_name,
        role: targetProfile.role || "owner",
      });
      notificationStatus = notifRes.status;
      channelSummary = `WhatsApp: ${notifRes.channels.whatsapp}, Email: ${notifRes.channels.email}`;
    } catch (notifErr) {
      console.warn("Approval notification notice:", notifErr);
      channelSummary = "Notification dispatch encountered non-blocking error.";
    }
  }

  // 3. Log Admin Action with notification details
  await adminClient.from("admin_actions").insert({
    admin_id: user.id,
    target_user_id: targetUserId,
    action: "approve_user",
    reason: reason || `Approved account. Delivery: ${channelSummary || notificationStatus}`,
  });

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/owners");
  revalidatePath("/admin/contractors");
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");

  return { success: true, notificationStatus, channelSummary };
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
  revalidatePath("/admin/owners");
  revalidatePath("/admin/contractors");

  return { success: true };
}

export async function deleteUserAction(targetUserId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { error: "Forbidden: Admin privileges required." };
    }

    if (targetUserId === user.id) {
      return { error: "Cannot delete your own admin account." };
    }

    const adminClient = createAdminClient();

    // 1. Delete associated data
    await adminClient.from("contractor_portfolio").delete().eq("contractor_id", targetUserId);
    await adminClient.from("bids").delete().eq("contractor_id", targetUserId);
    await adminClient.from("notifications").delete().eq("user_id", targetUserId);
    await adminClient.from("contractors").delete().eq("id", targetUserId);
    await adminClient.from("owners").delete().eq("id", targetUserId);
    await adminClient.from("profiles").delete().eq("id", targetUserId);

    // 2. Delete from Supabase Auth
    const { error: authDeleteErr } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (authDeleteErr) {
      console.warn("Auth delete note:", authDeleteErr.message);
    }

    revalidatePath("/admin/approvals");
    revalidatePath("/admin/owners");
    revalidatePath("/admin/contractors");
    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteUserAction:", err);
    return { error: err.message || "Failed to delete user account." };
  }
}

export interface AdminDashboardStats {
  totalOwners: number;
  totalContractors: number;
  pendingOwners: number;
  pendingContractors: number;
  activeTenders: number;
  activeProjects: number;
  completedProjects: number;
  totalBids: number;
  supportTotal: number;
  supportOpen: number;
  supportUnderReview: number;
  supportResolved: number;
}

export async function getAdminDashboardStatsAction(): Promise<{
  success: boolean;
  stats: AdminDashboardStats;
}> {
  const defaultStats: AdminDashboardStats = {
    totalOwners: 0,
    totalContractors: 0,
    pendingOwners: 0,
    pendingContractors: 0,
    activeTenders: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBids: 0,
    supportTotal: 0,
    supportOpen: 0,
    supportUnderReview: 0,
    supportResolved: 0,
  };

  try {
    const adminClient = createAdminClient();

    // 1. Fetch profiles
    const { data: profiles } = await adminClient.from("profiles").select("role, status");
    if (profiles) {
      const owners = profiles.filter((p) => p.role === "owner");
      const contractors = profiles.filter((p) => p.role === "contractor");
      defaultStats.totalOwners = owners.length;
      defaultStats.totalContractors = contractors.length;
      defaultStats.pendingOwners = owners.filter((p) => p.status === "pending").length;
      defaultStats.pendingContractors = contractors.filter((p) => p.status === "pending").length;
    }

    // 2. Fetch counts
    const { count: tendersCount } = await adminClient
      .from("tenders")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    defaultStats.activeTenders = tendersCount || 0;

    const { count: activeProjCount } = await adminClient
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    defaultStats.activeProjects = activeProjCount || 0;

    const { count: completedProjCount } = await adminClient
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");
    defaultStats.completedProjects = completedProjCount || 0;

    const { count: bidsCount } = await adminClient
      .from("bids")
      .select("*", { count: "exact", head: true });
    defaultStats.totalBids = bidsCount || 0;

    // 3. Fetch Support requests
    const { data: supportReqs } = await adminClient
      .from("support_requests")
      .select("status");
    if (supportReqs) {
      defaultStats.supportTotal = supportReqs.length;
      defaultStats.supportOpen = supportReqs.filter((r) => r.status === "open").length;
      defaultStats.supportUnderReview = supportReqs.filter((r) => r.status === "under_review").length;
      defaultStats.supportResolved = supportReqs.filter((r) => r.status === "resolved").length;
    }

    return { success: true, stats: defaultStats };
  } catch (err) {
    console.error("Error fetching admin stats in server action:", err);
    return { success: false, stats: defaultStats };
  }
}

export async function getAllAdminUsersAction(): Promise<{
  success: boolean;
  users: any[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, users: [], error: "Unauthenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, users: [], error: "Forbidden: Admin privileges required." };
    }

    const adminClient = createAdminClient();

    // 1. Fetch all profiles using admin client (bypasses RLS)
    let profilesList: any[] = [];
    const { data: profiles, error: pErr } = await adminClient
      .from("profiles")
      .select("*")
      .neq("role", "admin")
      .order("created_at", { ascending: false });

    if (pErr) {
      console.warn("Direct profiles fetch warning:", pErr.message);
    } else if (profiles) {
      profilesList = profiles;
    }

    // 2. Fetch owners & contractors tables to enrich metadata
    const { data: owners } = await adminClient.from("owners").select("*");
    const { data: contractors } = await adminClient.from("contractors").select("*");

    const ownersMap = new Map((owners || []).map((o) => [o.id, o]));
    const contractorsMap = new Map((contractors || []).map((c) => [c.id, c]));

    // 3. Merge profiles with owners and contractors
    const combinedUsers = profilesList.map((p) => {
      const ownerInfo = ownersMap.get(p.id);
      const contractorInfo = contractorsMap.get(p.id);
      return {
        ...p,
        owner: ownerInfo || null,
        contractor: contractorInfo || null,
        phone: p.phone || ownerInfo?.phone || contractorInfo?.phone || "",
        company_name: contractorInfo?.company_name || ownerInfo?.company_name || p.full_name || "",
        city: p.city || ownerInfo?.city || contractorInfo?.city || "",
        state: p.state || ownerInfo?.state || "",
      };
    });

    // 4. Fallback for any owners/contractors rows missing from profiles table
    const profileIds = new Set(profilesList.map((p) => p.id));
    if (owners) {
      for (const o of owners) {
        if (!profileIds.has(o.id)) {
          combinedUsers.push({
            id: o.id,
            full_name: o.full_name || o.company_name || "Property Owner",
            email: o.email || "",
            phone: o.phone || "",
            role: "owner",
            status: o.status || "pending",
            created_at: o.created_at || new Date().toISOString(),
            owner: o,
            contractor: null,
            city: o.city || "",
            state: o.state || "",
          });
          profileIds.add(o.id);
        }
      }
    }

    if (contractors) {
      for (const c of contractors) {
        if (!profileIds.has(c.id)) {
          combinedUsers.push({
            id: c.id,
            full_name: c.contact_person || c.company_name || "Civil Contractor",
            email: c.email || "",
            phone: c.phone || "",
            role: "contractor",
            status: c.status || "pending",
            created_at: c.created_at || new Date().toISOString(),
            owner: null,
            contractor: c,
            city: c.city || "",
            company_name: c.company_name || "",
          });
          profileIds.add(c.id);
        }
      }
    }

    // Sort by newest first
    combinedUsers.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    return { success: true, users: combinedUsers };
  } catch (err: any) {
    console.error("Unexpected error in getAllAdminUsersAction:", err);
    return { success: false, users: [], error: err.message };
  }
}

export async function setUserStatusAction(targetUserId: string, newStatus: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { error: "Forbidden: Admin privileges required." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", targetUserId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/owners");
    revalidatePath("/admin/contractors");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update user status." };
  }
}
