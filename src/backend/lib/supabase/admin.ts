import { createClient } from "@supabase/supabase-js";

export function getSanitizedSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mbljyfeoicpbptndgtcm.supabase.co";
  return url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function createAdminClient() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibGp5ZmVvaWNwYnB0bmRndGNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU1ODQ5NiwiZXhwIjoyMTAzMTM0NDk2fQ.5_S-c6hTtr9573WkcXsq9eOPHiNIZAi-MCLGQaNY0U0";

  return createClient(
    getSanitizedSupabaseUrl(),
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
