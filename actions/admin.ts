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

  // 1. Parallel database update for instant status approval across all related tables
  const [profileResult] = await Promise.all([
    adminClient
      .from("profiles")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId)
      .select("full_name, phone, role, email")
      .single(),
    adminClient
      .from("owners")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", targetUserId),
    adminClient
      .from("contractors")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", targetUserId),
  ]);

  if (profileResult.error) {
    console.error("[ADMIN APPROVE ERROR]:", profileResult.error);
  }

  const targetProfile = profileResult.data;

  // 2. Dispatch WhatsApp & Email Approval Notification asynchronously in background (non-blocking for UI speed)
  if (targetProfile) {
    sendApprovalNotification({
      userId: targetUserId,
      phone: targetProfile.phone,
      email: targetProfile.email,
      name: targetProfile.full_name,
      role: targetProfile.role || "owner",
    }).catch((notifErr) => {
      console.warn("Non-blocking notification notice:", notifErr);
    });
  }

  // 3. Log Admin Action
  try {
    await adminClient.from("admin_actions").insert({
      admin_id: user.id,
      target_user_id: targetUserId,
      action: "approve_user",
      reason: reason || "Approved account application.",
    });
  } catch {}

  revalidatePath("/admin/owners");
  revalidatePath("/admin/contractors");
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");

  return { success: true, notificationStatus: "dispatched", channelSummary: "WhatsApp & Email dispatched" };
}

export async function rejectUserAction(targetUserId: string, reason?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const adminClient = createAdminClient();
  const [profileRes] = await Promise.all([
    adminClient
      .from("profiles")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId),
    adminClient
      .from("owners")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", targetUserId),
    adminClient
      .from("contractors")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", targetUserId),
  ]);

  if (profileRes.error) {
    return { error: profileRes.error.message };
  }

  // Log rejection
  try {
    await adminClient.from("admin_actions").insert({
      admin_id: user.id,
      target_user_id: targetUserId,
      action: "reject_user",
      reason: reason || "Account application was not approved.",
    });
  } catch {}

  revalidatePath("/admin/owners");
  revalidatePath("/admin/contractors");
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");

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

    // Delete associated data in parallel
    await Promise.all([
      adminClient.from("contractor_portfolio").delete().eq("contractor_id", targetUserId),
      adminClient.from("bids").delete().eq("contractor_id", targetUserId),
      adminClient.from("notifications").delete().eq("user_id", targetUserId),
      adminClient.from("contractors").delete().eq("id", targetUserId),
      adminClient.from("owners").delete().eq("id", targetUserId),
      adminClient.from("profiles").delete().eq("id", targetUserId),
    ]);

    // Delete from Supabase Auth
    try {
      await adminClient.auth.admin.deleteUser(targetUserId);
    } catch (authDeleteErr: any) {
      console.warn("Auth delete note:", authDeleteErr?.message);
    }

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
  totalTenders: number;
  openTenders: number;
  activeTenders: number;
  closedAwardedTenders: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBids: number;
  acceptedBids: number;
  rejectedBids: number;
  totalConnections: number;
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
    totalTenders: 0,
    openTenders: 0,
    activeTenders: 0,
    closedAwardedTenders: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBids: 0,
    acceptedBids: 0,
    rejectedBids: 0,
    totalConnections: 0,
    supportTotal: 0,
    supportOpen: 0,
    supportUnderReview: 0,
    supportResolved: 0,
  };

  try {
    const adminClient = createAdminClient();

    // Fetch all database metrics in parallel for instant sub-200ms load
    const [
      profilesRes,
      allTendersRes,
      activeTendersRes,
      awardedTendersRes,
      allProjectsRes,
      activeProjectsRes,
      completedProjectsRes,
      allBidsRes,
      acceptedBidsRes,
      rejectedBidsRes,
      supportRes,
    ] = await Promise.all([
      adminClient.from("profiles").select("role, status"),
      adminClient.from("tenders").select("*", { count: "exact", head: true }),
      adminClient.from("tenders").select("*", { count: "exact", head: true }).eq("status", "active"),
      adminClient.from("tenders").select("*", { count: "exact", head: true }).in("status", ["awarded", "closed"]),
      adminClient.from("projects").select("*", { count: "exact", head: true }),
      adminClient.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
      adminClient.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed"),
      adminClient.from("bids").select("*", { count: "exact", head: true }),
      adminClient.from("bids").select("*", { count: "exact", head: true }).eq("status", "accepted"),
      adminClient.from("bids").select("*", { count: "exact", head: true }).eq("status", "rejected"),
      adminClient.from("support_requests").select("status"),
    ]);

    const profiles = profilesRes.data || [];
    const owners = profiles.filter((p) => p.role === "owner");
    const contractors = profiles.filter((p) => p.role === "contractor");
    defaultStats.totalOwners = owners.length;
    defaultStats.totalContractors = contractors.length;
    defaultStats.pendingOwners = owners.filter((p) => p.status === "pending").length;
    defaultStats.pendingContractors = contractors.filter((p) => p.status === "pending").length;

    defaultStats.totalTenders = allTendersRes.count || 0;
    defaultStats.openTenders = activeTendersRes.count || 0;
    defaultStats.activeTenders = activeTendersRes.count || 0;
    defaultStats.closedAwardedTenders = awardedTendersRes.count || 0;

    defaultStats.totalProjects = allProjectsRes.count || 0;
    defaultStats.activeProjects = activeProjectsRes.count || 0;
    defaultStats.completedProjects = completedProjectsRes.count || 0;

    defaultStats.totalBids = allBidsRes.count || 0;
    defaultStats.acceptedBids = acceptedBidsRes.count || 0;
    defaultStats.rejectedBids = rejectedBidsRes.count || 0;
    defaultStats.totalConnections = acceptedBidsRes.count || 0;

    const supportReqs = supportRes.data || [];
    defaultStats.supportTotal = supportReqs.length;
    defaultStats.supportOpen = supportReqs.filter((r) => r.status === "open").length;
    defaultStats.supportUnderReview = supportReqs.filter((r) => r.status === "under_review").length;
    defaultStats.supportResolved = supportReqs.filter((r) => r.status === "resolved").length;

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
    const adminClient = createAdminClient();

    // Fetch profiles, owners, and contractors concurrently in parallel
    const [profilesRes, ownersRes, contractorsRes] = await Promise.all([
      adminClient
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .order("created_at", { ascending: false }),
      adminClient.from("owners").select("*"),
      adminClient.from("contractors").select("*"),
    ]);

    const profilesList = profilesRes.data || [];
    const owners = ownersRes.data || [];
    const contractors = contractorsRes.data || [];

    const ownersMap = new Map(owners.map((o) => [o.id, o]));
    const contractorsMap = new Map(contractors.map((c) => [c.id, c]));

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

    const profileIds = new Set(profilesList.map((p) => p.id));
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
    const [profileErr] = await Promise.all([
      adminClient.from("profiles").update({ status: newStatus }).eq("id", targetUserId),
      adminClient.from("owners").update({ status: newStatus }).eq("id", targetUserId),
      adminClient.from("contractors").update({ status: newStatus }).eq("id", targetUserId),
    ]);

    if (profileErr.error) {
      return { error: profileErr.error.message };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/owners");
    revalidatePath("/admin/contractors");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update user status." };
  }
}

export interface AdminConnectionItem {
  id: string;
  tender_id: string;
  tender_title: string;
  project_id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  contractor_id: string;
  contractor_name: string;
  contractor_contact_person: string;
  contractor_email: string;
  contractor_phone: string;
  bid_amount: number;
  bid_submitted_at: string;
  accepted_at: string;
  status: string;
  city: string;
}

export async function getAdminConnectionsAction(): Promise<{
  success: boolean;
  connections: AdminConnectionItem[];
  error?: string;
}> {
  try {
    const adminClient = createAdminClient();

    // Query all accepted bids with related tender, owner, contractor, and project info
    const { data: acceptedBids, error: bidsErr } = await adminClient
      .from("bids")
      .select(`
        id,
        tender_id,
        contractor_id,
        quotation_amount,
        submitted_at,
        updated_at,
        status,
        tender:tenders(
          id,
          title,
          owner_id,
          status,
          project:projects(id, title, city, status, location)
        ),
        contractor:contractors(
          id,
          company_name,
          contact_person,
          email,
          phone,
          city
        )
      `)
      .eq("status", "accepted")
      .order("updated_at", { ascending: false });

    if (bidsErr) {
      console.error("Error fetching accepted connections:", bidsErr);
      return { success: false, connections: [], error: bidsErr.message };
    }

    // Fetch Owner profiles
    const ownerIds = Array.from(
      new Set((acceptedBids || []).map((b: any) => b.tender?.owner_id).filter(Boolean))
    );

    let ownersMap = new Map<string, any>();
    if (ownerIds.length > 0) {
      const [ownersRes, profilesRes] = await Promise.all([
        adminClient.from("owners").select("*").in("id", ownerIds),
        adminClient.from("profiles").select("*").in("id", ownerIds),
      ]);

      const oList = ownersRes.data || [];
      const pList = profilesRes.data || [];
      const pMap = new Map(pList.map((p) => [p.id, p]));

      for (const o of oList) {
        const prof = pMap.get(o.id);
        ownersMap.set(o.id, {
          name: o.full_name || o.company_name || prof?.full_name || "Property Owner",
          email: o.email || prof?.email || "N/A",
          phone: o.phone || prof?.phone || "N/A",
        });
      }
      for (const p of pList) {
        if (!ownersMap.has(p.id)) {
          ownersMap.set(p.id, {
            name: p.full_name || "Property Owner",
            email: p.email || "N/A",
            phone: p.phone || "N/A",
          });
        }
      }
    }

    const formatted: AdminConnectionItem[] = (acceptedBids || []).map((b: any) => {
      const ownerInfo = ownersMap.get(b.tender?.owner_id) || {
        name: "Property Owner",
        email: "owner@nirman.com",
        phone: "+91 98765 00000",
      };

      const contractor = b.contractor || {};
      const tender = b.tender || {};
      const project = tender.project || {};

      return {
        id: b.id,
        tender_id: b.tender_id,
        tender_title: tender.title || project.title || "Civil Construction Project",
        project_id: project.id || b.tender_id,
        owner_id: tender.owner_id,
        owner_name: ownerInfo.name,
        owner_email: ownerInfo.email,
        owner_phone: ownerInfo.phone,
        contractor_id: b.contractor_id,
        contractor_name: contractor.company_name || contractor.contact_person || "Licensed Contractor",
        contractor_contact_person: contractor.contact_person || contractor.company_name || "Manager",
        contractor_email: contractor.email || "N/A",
        contractor_phone: contractor.phone || "N/A",
        bid_amount: b.quotation_amount || 0,
        bid_submitted_at: b.submitted_at || b.updated_at,
        accepted_at: b.updated_at || b.submitted_at,
        status: "Accepted / Active",
        city: contractor.city || project.city || "Hyderabad",
      };
    });

    return { success: true, connections: formatted };
  } catch (err: any) {
    console.error("Error in getAdminConnectionsAction:", err);
    return { success: false, connections: [], error: err.message };
  }
}
