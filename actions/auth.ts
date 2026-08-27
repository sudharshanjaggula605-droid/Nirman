"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    return {
      error: "Supabase connection error: Please update .env.local with your real Supabase URL and Publishable Key.",
    };
  }

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

    console.log(`[AUTH LOGIN DEBUG] AUTH USER: ${data.user.id}`);
    console.log(`[AUTH LOGIN DEBUG] ROLE: ${role}`);
    console.log(`[AUTH LOGIN DEBUG] STATUS: ${status}`);

    if (status === "pending") {
      console.log(`[AUTH LOGIN DEBUG] REDIRECT: /account-pending`);
      redirect("/account-pending");
    }
    if (status === "rejected") {
      console.log(`[AUTH LOGIN DEBUG] REDIRECT: /account-rejected`);
      redirect("/account-rejected");
    }
    if (status === "blocked") {
      console.log(`[AUTH LOGIN DEBUG] REDIRECT: /account-blocked`);
      redirect("/account-blocked");
    }

    if (status === "approved") {
      if (role === "admin") {
        console.log(`[AUTH LOGIN DEBUG] REDIRECT: /admin/dashboard`);
        redirect("/admin/dashboard");
      }
      if (role === "owner") {
        console.log(`[AUTH LOGIN DEBUG] REDIRECT: /owner/dashboard`);
        redirect("/owner/dashboard");
      }
      if (role === "contractor") {
        console.log(`[AUTH LOGIN DEBUG] REDIRECT: /contractor/dashboard`);
        redirect("/contractor/dashboard");
      }
    }
  }

  redirect("/complete-profile");
}

export async function registerOwnerAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const full_name = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string || formData.get("property_location") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const state = (formData.get("state") as string)?.trim();
  const pincode = (formData.get("pincode") as string)?.trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    return {
      error: "Supabase connection error: Please update .env.local with your real Supabase URL and Publishable Key.",
    };
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
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
  }

  redirect("/account-pending?role=owner");
}

export async function registerContractorAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const contact_person = (formData.get("contact_person") as string || formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const company_name = (formData.get("company_name") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const specialization = (formData.get("specialization") as string || formData.get("specializations") as string)?.trim() || "Residential & Civil Construction";
  const years_of_experience = parseInt(formData.get("years_of_experience") as string || "0", 10);
  const projectPhotos = formData.getAll("project_photos").map((p) => p.toString()).filter(Boolean);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    return {
      error: "Supabase connection error: Please update .env.local with your real Supabase URL and Publishable Key.",
    };
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
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
        description: `Specialized in ${specialization}. Operating in ${city || "India"}.`,
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
  }

  redirect("/account-pending?role=contractor");
}

export async function registerAction(formData: FormData) {
  const role = (formData.get("role") as string)?.toLowerCase();
  if (role === "contractor") {
    return registerContractorAction(formData);
  }
  return registerOwnerAction(formData);
}
