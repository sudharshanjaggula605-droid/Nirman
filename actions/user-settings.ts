"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sanitizeUserFacingError } from "@/lib/errors";

export interface OwnerProfilePayload {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  google_maps_url?: string;
  about_me?: string;
}

export interface ContractorProfilePayload {
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  years_of_experience?: number;
  total_projects?: number;
  specializations?: string;
  gst_number?: string;
  license_number?: string;
  description?: string;
}

/**
 * Verify that the caller is authenticated and matches the requested role.
 */
async function verifyUserCaller(expectedRole?: "owner" | "contractor") {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated. Please log in to continue.", user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (expectedRole && profile?.role !== expectedRole && profile?.role !== "admin") {
    return {
      error: `Forbidden: Access requires ${expectedRole} privileges.`,
      user: null,
      profile: null,
    };
  }

  return { error: null, user, profile };
}

/**
 * Update Owner Profile and Email Credentials.
 * When email is changed:
 * - Validates format and checks for conflicts across auth.users and profiles
 * - Updates Supabase Auth credentials via admin client (with auto-confirm)
 * - Updates profiles table and owners table
 * - Purges any stale/duplicate auth entries with the old email so it cannot be logged in
 * - Revalidates all relevant dashboard paths
 */
export async function updateOwnerProfileAction(payload: OwnerProfilePayload): Promise<{
  success: boolean;
  email?: string;
  message?: string;
  error?: string;
}> {
  try {
    const { error: authError, user } = await verifyUserCaller("owner");
    if (authError || !user) {
      return { success: false, error: authError || "Unauthorized" };
    }

    const fullName = (payload.full_name || "").trim();
    const newEmail = (payload.email || "").trim().toLowerCase();
    const phone = (payload.phone || "").trim();

    if (!fullName) {
      return { success: false, error: "Please enter your full name." };
    }

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const adminClient = createAdminClient();

    // Fetch fresh user record from Supabase Auth to get the exact current auth email
    const { data: authUserData } = await adminClient.auth.admin.getUserById(user.id);
    const currentEmail = (authUserData?.user?.email || user.email || "").toLowerCase();
    const emailChanged = Boolean(newEmail && newEmail !== currentEmail);

    if (emailChanged) {
      // 1. Conflict check: make sure new email is not in use by another user
      try {
        const { data: allUsers } = await adminClient.auth.admin.listUsers();
        const conflictUser = allUsers?.users?.find(
          (u) => u.email?.toLowerCase() === newEmail && u.id !== user.id
        );

        if (conflictUser) {
          return {
            success: false,
            error: `The email address "${newEmail}" is already registered to another account.`,
          };
        }

        const { data: conflictProfile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("email", newEmail)
          .neq("id", user.id)
          .maybeSingle();

        if (conflictProfile) {
          return {
            success: false,
            error: `The email address "${newEmail}" is already registered to another account.`,
          };
        }
      } catch (checkErr) {
        console.warn("User email conflict check notice:", checkErr);
      }

      // 2. Update Supabase Auth user record (email and auto-confirm)
      const { error: authUpdateErr } = await adminClient.auth.admin.updateUserById(
        user.id,
        {
          email: newEmail,
          email_confirm: true,
          user_metadata: {
            ...(user.user_metadata || {}),
            full_name: fullName,
            phone: phone || null,
            role: "owner",
          },
        }
      );

      if (authUpdateErr) {
        console.error("Error updating owner auth user:", authUpdateErr);
        if (
          authUpdateErr.message.includes("already registered") ||
          authUpdateErr.message.includes("unique") ||
          authUpdateErr.message.includes("already exists")
        ) {
          return {
            success: false,
            error: `The email address "${newEmail}" is already in use by another account.`,
          };
        }
        return {
          success: false,
          error: authUpdateErr.message || "Failed to update authentication credentials.",
        };
      }

      // 3. Purge any stale/duplicate accounts with the old email so it can NEVER log in
      if (currentEmail) {
        try {
          const { data: allUsers } = await adminClient.auth.admin.listUsers();
          const staleUsers = allUsers?.users?.filter(
            (u) => u.email?.toLowerCase() === currentEmail && u.id !== user.id
          );
          if (staleUsers && staleUsers.length > 0) {
            for (const stale of staleUsers) {
              await adminClient.auth.admin.deleteUser(stale.id);
              await adminClient.from("profiles").delete().eq("id", stale.id);
            }
          }
        } catch (cleanErr) {
          console.warn("Clean stale old email accounts notice:", cleanErr);
        }

        // 4. Record audit log
        try {
          await adminClient.from("admin_actions").insert({
            admin_id: user.id,
            action: "owner_email_changed",
            reason: `Owner updated account email from ${currentEmail} to ${newEmail}`,
          });
        } catch {}
      }
    } else {
      // Just update metadata in auth if email didn't change
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          full_name: fullName,
          phone: phone || null,
          role: "owner",
        },
      });
    }

    // Update profiles table
    const profileUpdateData: any = {
      full_name: fullName,
      phone: phone || null,
      address: (payload.address || "").trim() || null,
      city: (payload.city || "").trim() || null,
      state: (payload.state || "").trim() || null,
      pincode: (payload.pincode || "").trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (emailChanged) {
      profileUpdateData.email = newEmail;
    }

    const { error: profileErr } = await adminClient
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", user.id);

    if (profileErr) {
      console.error("Error updating profile in DB:", profileErr);
    }

    // Update owners table
    const ownerUpdateData: any = {
      id: user.id,
      full_name: fullName,
      phone: phone || null,
      address: (payload.address || "").trim() || null,
      city: (payload.city || "").trim() || null,
      state: (payload.state || "").trim() || null,
      pincode: (payload.pincode || "").trim() || null,
      google_maps_url: (payload.google_maps_url || "").trim() || null,
      about_me: (payload.about_me || "").trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: ownerErr } = await adminClient
      .from("owners")
      .upsert(ownerUpdateData, { onConflict: "id" });

    if (ownerErr) {
      console.error("Error updating owners table in DB:", ownerErr);
    }

    revalidatePath("/owner/profile");
    revalidatePath("/owner/settings");
    revalidatePath("/owner/dashboard");
    revalidatePath("/admin/owners");
    revalidatePath("/admin/users");

    const message = emailChanged
      ? `Profile and login email updated successfully! You must now use "${newEmail}" and your current password to sign in.`
      : "Owner profile updated successfully!";

    return {
      success: true,
      email: newEmail,
      message,
    };
  } catch (err: any) {
    return { success: false, error: sanitizeUserFacingError(err, "Failed to update profile. Please try again later.") };
  }
}

/**
 * Update Contractor Profile and Email Credentials.
 * When email is changed:
 * - Validates format and checks for conflicts across auth.users and profiles
 * - Updates Supabase Auth credentials via admin client (with auto-confirm)
 * - Updates profiles table and contractors table
 * - Purges any stale/duplicate auth entries with the old email so it cannot be logged in
 * - Revalidates all relevant dashboard paths
 */
export async function updateContractorProfileAction(payload: ContractorProfilePayload): Promise<{
  success: boolean;
  email?: string;
  message?: string;
  error?: string;
}> {
  try {
    const { error: authError, user } = await verifyUserCaller("contractor");
    if (authError || !user) {
      return { success: false, error: authError || "Unauthorized" };
    }

    const companyName = (payload.company_name || "").trim();
    const contactPerson = (payload.contact_person || "").trim() || companyName;
    const newEmail = (payload.email || "").trim().toLowerCase();
    const phone = (payload.phone || "").trim();

    if (!companyName && !contactPerson) {
      return { success: false, error: "Please enter your company or contact person name." };
    }

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const adminClient = createAdminClient();

    // Fetch fresh user record from Supabase Auth
    const { data: authUserData } = await adminClient.auth.admin.getUserById(user.id);
    const currentEmail = (authUserData?.user?.email || user.email || "").toLowerCase();
    const emailChanged = Boolean(newEmail && newEmail !== currentEmail);

    if (emailChanged) {
      // 1. Conflict check
      try {
        const { data: allUsers } = await adminClient.auth.admin.listUsers();
        const conflictUser = allUsers?.users?.find(
          (u) => u.email?.toLowerCase() === newEmail && u.id !== user.id
        );

        if (conflictUser) {
          return {
            success: false,
            error: `The email address "${newEmail}" is already registered to another account.`,
          };
        }

        const { data: conflictProfile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("email", newEmail)
          .neq("id", user.id)
          .maybeSingle();

        if (conflictProfile) {
          return {
            success: false,
            error: `The email address "${newEmail}" is already registered to another account.`,
          };
        }
      } catch (checkErr) {
        console.warn("User email conflict check notice:", checkErr);
      }

      // 2. Update Supabase Auth user record (email and auto-confirm)
      const { error: authUpdateErr } = await adminClient.auth.admin.updateUserById(
        user.id,
        {
          email: newEmail,
          email_confirm: true,
          user_metadata: {
            ...(user.user_metadata || {}),
            full_name: contactPerson,
            company_name: companyName,
            contact_person: contactPerson,
            phone: phone || null,
            role: "contractor",
          },
        }
      );

      if (authUpdateErr) {
        console.error("Error updating contractor auth user:", authUpdateErr);
        if (
          authUpdateErr.message.includes("already registered") ||
          authUpdateErr.message.includes("unique") ||
          authUpdateErr.message.includes("already exists")
        ) {
          return {
            success: false,
            error: `The email address "${newEmail}" is already in use by another account.`,
          };
        }
        return {
          success: false,
          error: authUpdateErr.message || "Failed to update authentication credentials.",
        };
      }

      // 3. Purge any stale/duplicate accounts with the old email so it can NEVER log in
      if (currentEmail) {
        try {
          const { data: allUsers } = await adminClient.auth.admin.listUsers();
          const staleUsers = allUsers?.users?.filter(
            (u) => u.email?.toLowerCase() === currentEmail && u.id !== user.id
          );
          if (staleUsers && staleUsers.length > 0) {
            for (const stale of staleUsers) {
              await adminClient.auth.admin.deleteUser(stale.id);
              await adminClient.from("profiles").delete().eq("id", stale.id);
            }
          }
        } catch (cleanErr) {
          console.warn("Clean stale old email accounts notice:", cleanErr);
        }

        // 4. Record audit log
        try {
          await adminClient.from("admin_actions").insert({
            admin_id: user.id,
            action: "contractor_email_changed",
            reason: `Contractor updated account email from ${currentEmail} to ${newEmail}`,
          });
        } catch {}
      }
    } else {
      // Just update metadata in auth if email didn't change
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          full_name: contactPerson,
          company_name: companyName,
          contact_person: contactPerson,
          phone: phone || null,
          role: "contractor",
        },
      });
    }

    // Update profiles table
    const profileUpdateData: any = {
      full_name: contactPerson,
      phone: phone || null,
      city: (payload.city || "").trim() || null,
      state: (payload.state || "").trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (emailChanged) {
      profileUpdateData.email = newEmail;
    }

    const { error: profileErr } = await adminClient
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", user.id);

    if (profileErr) {
      console.error("Error updating profile in DB:", profileErr);
    }

    // Update contractors table
    const contractorUpdateData: any = {
      id: user.id,
      company_name: companyName,
      contact_person: contactPerson,
      phone: phone || null,
      email: newEmail,
      city: (payload.city || "").trim() || null,
      state: (payload.state || "").trim() || null,
      years_of_experience: typeof payload.years_of_experience === "number" ? payload.years_of_experience : 0,
      total_projects: typeof payload.total_projects === "number" ? payload.total_projects : 0,
      gst_number: (payload.gst_number || "").trim() || null,
      license_number: (payload.license_number || "").trim() || null,
      description: (payload.description || payload.specializations || "").trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: contractorErr } = await adminClient
      .from("contractors")
      .upsert(contractorUpdateData, { onConflict: "id" });

    if (contractorErr) {
      console.error("Error updating contractors table in DB:", contractorErr);
    }

    revalidatePath("/contractor/profile");
    revalidatePath("/contractor/settings");
    revalidatePath("/contractor/dashboard");
    revalidatePath("/admin/contractors");
    revalidatePath("/admin/users");

    const message = emailChanged
      ? `Profile and login email updated successfully! You must now use "${newEmail}" and your current password to sign in.`
      : "Contractor profile updated successfully!";

    return {
      success: true,
      email: newEmail,
      message,
    };
  } catch (err: any) {
    return { success: false, error: sanitizeUserFacingError(err, "Failed to update profile. Please try again later.") };
  }
}
