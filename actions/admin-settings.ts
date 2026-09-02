"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { type PaymentSettingsConfig } from "@/types";

export interface NotificationPreferences {
  new_owner_registration: boolean;
  new_contractor_registration: boolean;
  new_tender: boolean;
  new_support_request: boolean;
  new_issue_report: boolean;
  new_bid_activity: boolean;
}

export interface UserManagementSettings {
  owner_approval: "manual" | "auto";
  contractor_approval: "manual" | "auto";
  account_status: "active" | "suspended";
}

export interface TenderManagementSettings {
  tender_approval: boolean;
  tender_moderation: boolean;
  reported_tender_handling: boolean;
}

export interface SystemSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  maintenance_mode: boolean;
  system_status: "operational" | "maintenance" | "degraded";
}

export interface AdminProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  role: string;
  status: string;
}

const DEFAULT_SETTINGS = {
  notification_preferences: {
    new_owner_registration: true,
    new_contractor_registration: true,
    new_tender: true,
    new_support_request: true,
    new_issue_report: false,
    new_bid_activity: true,
  },
  user_management_settings: {
    owner_approval: "manual" as const,
    contractor_approval: "manual" as const,
    account_status: "active" as const,
  },
  tender_management_settings: {
    tender_approval: true,
    tender_moderation: true,
    reported_tender_handling: true,
  },
  system_settings: {
    platform_name: "NIRMAN",
    support_email: "support@nirman.com",
    support_phone: "+91 98765 43210",
    maintenance_mode: false,
    system_status: "operational" as const,
  },
  payment_settings: {
    razorpay_enabled: true,
    static_qr_enabled: true,
    static_qr_image: "/images/static_upi_qr.png",
    upi_id: "nirman@upi",
    display_name: "NIRMAN Technologies Pvt Ltd",
    payment_instructions: "Scan using GPay, PhonePe, Paytm, or BHIM UPI app to pay ₹199.",
  },
};

// Helper to verify caller is admin
async function verifyAdminCaller() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated", user: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden: Admin access required", user: null };
  }

  return { error: null, user };
}

export async function getAdminFullSettingsAction(): Promise<{
  success: boolean;
  profile?: AdminProfileData;
  notifications: NotificationPreferences;
  userManagement: UserManagementSettings;
  tenderManagement: TenderManagementSettings;
  systemSettings: SystemSettings;
  paymentSettings: PaymentSettingsConfig;
  error?: string;
}> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) {
      return {
        success: false,
        error: authError || "Unauthorized",
        notifications: DEFAULT_SETTINGS.notification_preferences,
        userManagement: DEFAULT_SETTINGS.user_management_settings,
        tenderManagement: DEFAULT_SETTINGS.tender_management_settings,
        systemSettings: DEFAULT_SETTINGS.system_settings,
        paymentSettings: DEFAULT_SETTINGS.payment_settings,
      };
    }

    const adminClient = createAdminClient();

    // 1. Fetch Admin Profile
    const { data: profileData } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile: AdminProfileData = {
      id: user.id,
      full_name: profileData?.full_name || "NIRMAN Admin",
      email: profileData?.email || user.email || "admin@nirman.com",
      phone: profileData?.phone || "",
      avatar_url: profileData?.avatar_url || null,
      role: profileData?.role || "admin",
      status: profileData?.status || "approved",
    };

    // 2. Fetch admin_settings from database table if exists
    let notifications = { ...DEFAULT_SETTINGS.notification_preferences };
    let userManagement = { ...DEFAULT_SETTINGS.user_management_settings };
    let tenderManagement = { ...DEFAULT_SETTINGS.tender_management_settings };
    let systemSettings = { ...DEFAULT_SETTINGS.system_settings };
    let paymentSettings = { ...DEFAULT_SETTINGS.payment_settings };

    try {
      const { data: settingsRow } = await adminClient
        .from("admin_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (settingsRow) {
        if (settingsRow.notification_preferences) {
          notifications = { ...notifications, ...settingsRow.notification_preferences };
        }
        if (settingsRow.user_management_settings) {
          userManagement = { ...userManagement, ...settingsRow.user_management_settings };
        }
        if (settingsRow.tender_management_settings) {
          tenderManagement = { ...tenderManagement, ...settingsRow.tender_management_settings };
        }
        if (settingsRow.system_settings) {
          systemSettings = { ...systemSettings, ...settingsRow.system_settings };
          if (settingsRow.system_settings.payment_settings) {
            paymentSettings = { ...paymentSettings, ...settingsRow.system_settings.payment_settings };
          }
        }
      }
    } catch (dbErr) {
      console.warn("admin_settings table query note:", dbErr);
    }

    return {
      success: true,
      profile,
      notifications,
      userManagement,
      tenderManagement,
      systemSettings,
      paymentSettings,
    };
  } catch (err: any) {
    console.error("Error in getAdminFullSettingsAction:", err);
    return {
      success: false,
      error: "Unable to load settings.",
      notifications: DEFAULT_SETTINGS.notification_preferences,
      userManagement: DEFAULT_SETTINGS.user_management_settings,
      tenderManagement: DEFAULT_SETTINGS.tender_management_settings,
      systemSettings: DEFAULT_SETTINGS.system_settings,
      paymentSettings: DEFAULT_SETTINGS.payment_settings,
    };
  }
}

export async function updateAdminProfileAction(formData: FormData): Promise<{
  success: boolean;
  avatar_url?: string | null;
  error?: string;
}> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, error: authError || "Unauthorized" };

    const fullName = ((formData.get("full_name") as string) || "").trim();
    const phone = ((formData.get("phone") as string) || "").trim();
    const avatarFile = formData.get("avatar") as File | null;

    if (!fullName) {
      return { success: false, error: "Please enter your full name." };
    }

    const adminClient = createAdminClient();
    let avatar_url: string | undefined = undefined;

    // Handle avatar upload if provided
    if (avatarFile && avatarFile.size > 0) {
      if (avatarFile.size > 3 * 1024 * 1024) {
        return { success: false, error: "Profile photo must be less than 3MB." };
      }

      const fileExt = avatarFile.name.split(".").pop() || "jpg";
      const fileName = `admin_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const { error: uploadErr } = await adminClient.storage
        .from("avatars")
        .upload(filePath, buffer, {
          contentType: avatarFile.type,
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = adminClient.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatar_url = publicUrlData?.publicUrl;
      } else {
        console.warn("Avatar upload fallback note:", uploadErr);
      }
    }

    const updatePayload: any = {
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    };

    if (avatar_url) {
      updatePayload.avatar_url = avatar_url;
    }

    const { error: updateErr } = await adminClient
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (updateErr) {
      return { success: false, error: "Unable to update profile. Please try again." };
    }

    // Also update auth user metadata
    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        full_name: fullName,
        phone: phone,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/profile");
    revalidatePath("/admin/dashboard");

    return { success: true, avatar_url };
  } catch (err: any) {
    console.error("Error in updateAdminProfileAction:", err);
    return { success: false, error: "Unable to update profile. Please try again." };
  }
}

export async function updateAdminNotificationSettingsAction(
  notifications: NotificationPreferences
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, error: authError || "Unauthorized" };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("admin_settings").upsert({
      id: "default",
      admin_id: user.id,
      notification_preferences: notifications,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating notification settings:", error);
      return { success: false, error: "Unable to save notification preferences." };
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    console.error("Error in updateAdminNotificationSettingsAction:", err);
    return { success: false, error: "Unable to save notification preferences." };
  }
}

export async function updateAdminUserManagementSettingsAction(
  userManagement: UserManagementSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, error: authError || "Unauthorized" };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("admin_settings").upsert({
      id: "default",
      admin_id: user.id,
      user_management_settings: userManagement,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating user management settings:", error);
      return { success: false, error: "Unable to save user management settings." };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    console.error("Error in updateAdminUserManagementSettingsAction:", err);
    return { success: false, error: "Unable to save user management settings." };
  }
}

export async function updateAdminTenderManagementSettingsAction(
  tenderManagement: TenderManagementSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, error: authError || "Unauthorized" };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("admin_settings").upsert({
      id: "default",
      admin_id: user.id,
      tender_management_settings: tenderManagement,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating tender management settings:", error);
      return { success: false, error: "Unable to save tender management settings." };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/tenders");
    return { success: true };
  } catch (err: any) {
    console.error("Error in updateAdminTenderManagementSettingsAction:", err);
    return { success: false, error: "Unable to save tender management settings." };
  }
}

export async function updateAdminSystemSettingsAction(
  systemSettings: SystemSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, error: authError || "Unauthorized" };

    // Validation
    if (!systemSettings.platform_name?.trim()) {
      return { success: false, error: "Please enter a valid platform name." };
    }
    if (
      !systemSettings.support_email?.trim() ||
      !/\S+@\S+\.\S+/.test(systemSettings.support_email)
    ) {
      return { success: false, error: "Please enter a valid support email address." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("admin_settings").upsert({
      id: "default",
      admin_id: user.id,
      system_settings: {
        ...systemSettings,
        system_status: systemSettings.maintenance_mode ? "maintenance" : "operational",
      },
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating system settings:", error);
      return { success: false, error: "Unable to save system settings." };
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    console.error("Error in updateAdminSystemSettingsAction:", err);
    return { success: false, error: "Unable to save system settings." };
  }
}

export async function updateAdminPasswordAction(newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, error: authError || "Unauthorized" };

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message || "Failed to update password." };
    }

    // Log admin action for audit
    await adminClient.from("admin_actions").insert({
      admin_id: user.id,
      action: "password_changed",
      reason: "Administrator updated account password from security settings",
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateAdminPasswordAction:", err);
    return { success: false, error: "Unable to update password. Please try again." };
  }
}

export async function getAdminSecurityAuditAction(): Promise<{
  success: boolean;
  logs: any[];
  error?: string;
}> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, logs: [] };

    const adminClient = createAdminClient();
    const { data: logs } = await adminClient
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    return { success: true, logs: logs || [] };
  } catch (err: any) {
    console.error("Error in getAdminSecurityAuditAction:", err);
    return { success: false, logs: [] };
  }
}

export async function updateAdminPaymentSettingsAction(
  paymentSettings: PaymentSettingsConfig
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error: authError, user } = await verifyAdminCaller();
    if (authError || !user) return { success: false, error: authError || "Unauthorized" };

    if (!paymentSettings.upi_id?.trim()) {
      return { success: false, error: "Please provide a valid UPI ID (e.g., nirman@upi)." };
    }

    const adminClient = createAdminClient();

    // Fetch existing system_settings
    const { data: existing } = await adminClient
      .from("admin_settings")
      .select("system_settings")
      .eq("id", "default")
      .maybeSingle();

    const currentSystem = existing?.system_settings || {};
    const updatedSystem = {
      ...currentSystem,
      payment_settings: paymentSettings,
    };

    const { error } = await adminClient.from("admin_settings").upsert({
      id: "default",
      admin_id: user.id,
      system_settings: updatedSystem,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating payment settings:", error);
      return { success: false, error: "Unable to save payment settings." };
    }

    // Log admin action
    await adminClient.from("admin_actions").insert({
      admin_id: user.id,
      action: "payment_settings_updated",
      reason: `Admin updated payment configuration (Razorpay: ${paymentSettings.razorpay_enabled}, Static QR: ${paymentSettings.static_qr_enabled})`,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err: any) {
    console.error("Error in updateAdminPaymentSettingsAction:", err);
    return { success: false, error: "Unable to save payment settings." };
  }
}
