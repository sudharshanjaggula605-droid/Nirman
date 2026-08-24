"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (profile) {
      if (profile.status === "pending") redirect("/approval-waiting");
      if (profile.status === "rejected") redirect("/rejected");
      if (profile.status === "blocked") redirect("/blocked");

      if (profile.role === "admin") redirect("/admin/dashboard");
      if (profile.role === "owner") redirect("/owner/dashboard");
      if (profile.role === "contractor") redirect("/contractor/dashboard");
    }
  }

  redirect("/");
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as "owner" | "contractor";
  const company_name = formData.get("company_name") as string;
  const contact_person = formData.get("contact_person") as string;

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        phone,
        role,
        company_name: company_name || full_name,
        contact_person: contact_person || full_name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/approval-waiting");
}
