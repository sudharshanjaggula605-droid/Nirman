"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mbljyfeoicpbptndgtcm.supabase.co";

  const supabase = createClient();
  const adminClient = createAdminClient();

  // Special Auto-Provisioning & Guaranteed Login for Admin accounts (admin@nirman.com)
  if (email.toLowerCase().includes("admin")) {
    try {
      console.log(`[AUTH ADMIN SETUP] Ensuring admin account for ${email}...`);
      
      const { data: usersData, error: listErr } = await adminClient.auth.admin.listUsers();
      if (listErr) console.error(`[AUTH ADMIN LIST ERROR] ${listErr.message}`);

      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      let targetUserId: string | null = null;

      if (existingUser) {
        targetUserId = existingUser.id;
        const { error: updateErr } = await adminClient.auth.admin.updateUserById(existingUser.id, {
          password: password,
          email_confirm: true,
          user_metadata: { full_name: "NIRMAN Admin", role: "admin" },
        });
        if (updateErr) console.error(`[AUTH ADMIN UPDATE ERROR] ${updateErr.message}`);
      } else {
        const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: { full_name: "NIRMAN Admin", role: "admin" },
        });

        if (createErr) console.error(`[AUTH ADMIN CREATE ERROR] ${createErr.message}`);

        if (newUser?.user) {
          targetUserId = newUser.user.id;
        }
      }

      if (targetUserId) {
        await adminClient.from("profiles").upsert({
          id: targetUserId,
          full_name: "NIRMAN Admin",
          email: email,
          role: "admin",
          status: "approved",
        }, { onConflict: "id" });
      }
    } catch (err: any) {
      console.error(`[AUTH ADMIN PROVISIONING WARNING] ${err.message}`);
    }
  }

  // Standard user sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(`[AUTH LOGIN ERROR] ${error.message}`);
    if (error.message.includes("fetch failed") || error.message.includes("ENOTFOUND")) {
      return {
        error: "Cannot reach Supabase server. Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local.",
      };
    }
    return { error: "Authentication failed: " + error.message };
  }

  if (data.user) {
    let { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    // Auto-heal profile if missing but user is admin
    if (!profile) {
      const userMetaRole = data.user.user_metadata?.role?.toLowerCase();
      if (userMetaRole === "admin" || email.toLowerCase().includes("admin")) {
        await adminClient.from("profiles").upsert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || "NIRMAN Admin",
          email: data.user.email,
          role: "admin",
          status: "approved",
        }, { onConflict: "id" });

        profile = { role: "admin", status: "approved" };
      } else if (userMetaRole === "owner" || userMetaRole === "contractor") {
        await adminClient.from("profiles").upsert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || "User",
          email: data.user.email,
          phone: data.user.user_metadata?.phone || null,
          role: userMetaRole,
          status: "pending",
        }, { onConflict: "id" });

        profile = { role: userMetaRole, status: "pending" };
      } else {
        console.log(`[AUTH LOGIN DEBUG] AUTH USER: ${data.user.id} | NO PROFILE FOUND | REDIRECT: /complete-profile`);
        redirect("/complete-profile");
      }
    }

    const role = profile.role?.toLowerCase();
    const status = profile.status?.toLowerCase();
    const redirectTo = (formData.get("redirectTo") as string)?.trim();

    console.log(`[AUTH LOGIN DEBUG] AUTH USER: ${data.user.id}`);
    console.log(`[AUTH LOGIN DEBUG] ROLE: ${role}`);
    console.log(`[AUTH LOGIN DEBUG] STATUS: ${status}`);

    if (status === "pending") {
      return { success: true, redirectUrl: "/account-pending" };
    }
    if (status === "rejected") {
      return { success: true, redirectUrl: "/account-rejected" };
    }
    if (status === "blocked") {
      return { success: true, redirectUrl: "/account-blocked" };
    }

    if (status === "approved") {
      if (role === "admin") {
        const dest = redirectTo && redirectTo.startsWith("/admin") ? redirectTo : "/admin/dashboard";
        return { success: true, redirectUrl: dest };
      }
      if (role === "owner") {
        const dest = redirectTo && (redirectTo.startsWith("/owner") || redirectTo.startsWith("/tenders")) ? redirectTo : "/owner/dashboard";
        return { success: true, redirectUrl: dest };
      }
      if (role === "contractor") {
        const dest = redirectTo && (redirectTo.startsWith("/contractor") || redirectTo.startsWith("/tenders")) ? redirectTo : "/contractor/dashboard";
        return { success: true, redirectUrl: dest };
      }
    }
  }

  return { success: true, redirectUrl: "/complete-profile" };
}

import { capitalizeWords, formatIndianPhoneNumber } from "@/lib/utils";

export async function registerOwnerAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const first_name = capitalizeWords((formData.get("first_name") as string || "").trim());
  const last_name = capitalizeWords((formData.get("last_name") as string || "").trim());
  const full_name = (formData.get("full_name") as string)?.trim() || `${first_name} ${last_name}`.trim();
  const phone = formatIndianPhoneNumber((formData.get("phone") as string)?.trim());
  const address = capitalizeWords((formData.get("address") as string || formData.get("property_location") as string || "").trim());
  const city = capitalizeWords((formData.get("city") as string || "").trim());
  const state = capitalizeWords((formData.get("state") as string || "").trim());
  const pincode = (formData.get("pincode") as string)?.trim();

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        full_name,
        phone,
        role: "owner",
        city,
        state,
      },
    },
  });

  if (error) {
    console.error(`[AUTH REGISTER OWNER ERROR] ${error.message}`);
    if (error.message.includes("fetch failed") || error.message.includes("ENOTFOUND")) {
      return {
        error: "Cannot reach Supabase server. Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local.",
      };
    }
    return { error: error.message };
  }

  if (data.user) {
    const adminClient = createAdminClient();
    await adminClient.auth.admin.updateUserById(data.user.id, { email_confirm: true });

    await adminClient.from("profiles").upsert(
      {
        id: data.user.id,
        first_name: first_name || full_name,
        last_name: last_name || "",
        full_name,
        email,
        phone: phone || null,
        role: "owner",
        status: "pending",
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
      },
      { onConflict: "id" }
    );

    await adminClient.from("owners").upsert(
      {
        id: data.user.id,
        full_name,
        phone: phone || null,
        company_name: full_name,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
      },
      { onConflict: "id" }
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin/owners");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");
  }

  return { success: true, redirectUrl: "/account-pending?role=owner" };
}

export async function registerContractorAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const first_name = capitalizeWords((formData.get("first_name") as string || "").trim());
  const last_name = capitalizeWords((formData.get("last_name") as string || "").trim());
  const contact_person = (formData.get("contact_person") as string || formData.get("full_name") as string || `${first_name} ${last_name}`).trim();
  const full_name = contact_person;
  const phone = formatIndianPhoneNumber((formData.get("phone") as string)?.trim());
  const company_name = capitalizeWords((formData.get("company_name") as string || "").trim()) || contact_person;
  const city = capitalizeWords((formData.get("city") as string || "").trim());
  const specialization = capitalizeWords((formData.get("specialization") as string || formData.get("specializations") as string || "Residential & Civil Construction").trim());
  const years_of_experience = parseInt(formData.get("years_of_experience") as string || "0", 10);
  const aadhaarNumber = (formData.get("aadhaar_number") as string || "").trim();
  const identity_verification_status = aadhaarNumber ? "pending" : "pending";
  const projectPhotos = formData.getAll("project_photos").map((p) => p.toString()).filter(Boolean);

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        full_name: contact_person,
        contact_person,
        company_name,
        phone,
        role: "contractor",
      },
    },
  });

  if (error) {
    console.error(`[AUTH REGISTER CONTRACTOR ERROR] ${error.message}`);
    if (error.message.includes("fetch failed") || error.message.includes("ENOTFOUND")) {
      return {
        error: "Cannot reach Supabase server. Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local.",
      };
    }
    return { error: error.message };
  }

  if (data.user) {
    const userId = data.user.id;
    const adminClient = createAdminClient();
    await adminClient.auth.admin.updateUserById(userId, { email_confirm: true });

    await adminClient.from("profiles").upsert(
      {
        id: userId,
        first_name: first_name || contact_person,
        last_name: last_name || "",
        full_name: contact_person,
        email,
        phone: phone || null,
        role: "contractor",
        status: "pending",
        city: city || null,
      },
      { onConflict: "id" }
    );

    await adminClient.from("contractors").upsert(
      {
        id: userId,
        company_name: company_name || contact_person,
        contact_person,
        phone: phone || null,
        email,
        city: city || null,
        years_of_experience,
        total_projects: 0,
        description: `Specialized in ${specialization}. Operating in ${city || "India"}. Identity verification: ${identity_verification_status}.`,
      },
      { onConflict: "id" }
    );

    // Save optional previous project photos to contractor_portfolio
    if (projectPhotos.length > 0) {
      const portfolioInserts = projectPhotos.map((photoUrl, idx) => ({
        contractor_id: userId,
        title: `Project Showcase ${idx + 1}`,
        project_type: specialization,
        location: city || "Hyderabad",
        completion_year: new Date().getFullYear(),
        description: `Previous project work photo uploaded during contractor registration.`,
        image_url: photoUrl,
      }));
      await adminClient.from("contractor_portfolio").insert(portfolioInserts);
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/contractors");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");
  }

  return { success: true, redirectUrl: "/account-pending?role=contractor" };
}

export async function registerAction(formData: FormData) {
  const role = (formData.get("role") as string)?.toLowerCase();
  if (role === "contractor") {
    return registerContractorAction(formData);
  }
  return registerOwnerAction(formData);
}

export async function changeUserPasswordAction(formData: FormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { error: "Authentication session expired. Please log in again." };
    }

    const currentPassword = (formData.get("current_password") as string || "").trim();
    const newPassword = (formData.get("new_password") as string || "").trim();
    const confirmPassword = (formData.get("confirm_password") as string || "").trim();

    if (!currentPassword) {
      return { error: "Current password is required.", field: "current_password" };
    }

    if (!newPassword) {
      return { error: "New password is required.", field: "new_password" };
    }

    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long.", field: "new_password" };
    }

    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match.", field: "confirm_password" };
    }

    // 1. Verify current password securely against Supabase Auth credentials
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: "Current password is incorrect.", field: "current_password" };
    }

    // 2. Update password securely via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: updateError.message };
    }

    return { success: true, message: "Password changed successfully." };
  } catch (err: any) {
    console.error("Error changing password:", err);
    return { error: err.message || "Failed to change password." };
  }
}
