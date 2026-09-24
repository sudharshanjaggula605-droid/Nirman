import { createBrowserClient } from "@supabase/ssr";

export function getSanitizedSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mbljyfeoicpbptndgtcm.supabase.co";
  return url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function createClient() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibGp5ZmVvaWNwYnB0bmRndGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NTg0OTYsImV4cCI6MjEwMzEzNDQ5Nn0.RRMry_4R98GEZFJ0W4VUZF7buUlGSI30BrAmLtKa7OU";

  return createBrowserClient(getSanitizedSupabaseUrl(), key);
}
