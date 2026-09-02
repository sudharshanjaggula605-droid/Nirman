import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
});

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("=== SUPABASE LIVE DATABASE VERIFICATION ===");
  console.log("Target Project URL:", supabaseUrl);

  const tables = [
    "profiles",
    "owners",
    "contractors",
    "tenders",
    "bids",
    "bid_cost_breakdowns",
    "projects",
    "project_documents",
    "payments",
    "admin_settings",
    "admin_actions",
    "notifications",
    "support_requests",
    "direct_messages",
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await admin
        .from(table)
        .select("*", { count: "exact", head: false })
        .limit(1);

      if (error) {
        console.log(`❌ Table [${table}]: ERROR - ${error.message} (Code: ${error.code})`);
      } else {
        const sampleCols = data && data.length > 0 ? Object.keys(data[0]).join(", ") : "(Empty table, but exists and queryable)";
        console.log(`✅ Table [${table}]: EXISTS (${count ?? 0} rows) | Schema/Sample cols: ${sampleCols}`);
      }
    } catch (err) {
      console.log(`❌ Table [${table}]: EXCEPTION -`, err.message);
    }
  }

  // Verify admin_settings keys
  console.log("\n=== Checking admin_settings rows in live Supabase ===");
  const { data: settings } = await admin.from("admin_settings").select("*");
  console.log("Existing setting keys:", settings?.map((s) => s.key));

  // Verify payments table columns
  console.log("\n=== Checking payments table in live Supabase ===");
  const { data: payments } = await admin.from("payments").select("*").limit(2);
  console.log("Payments count in DB:", payments?.length);
  if (payments && payments[0]) {
    console.log("Payments columns:", Object.keys(payments[0]));
  }
}

main().catch(console.error);
