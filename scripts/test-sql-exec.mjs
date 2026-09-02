import fs from "fs";
import path from "path";

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
});

const url = env["NEXT_PUBLIC_SUPABASE_URL"];
const key = env["SUPABASE_SERVICE_ROLE_KEY"];

async function testSqlExec() {
  console.log("Testing SQL endpoints on Supabase...");

  const sql = `
    CREATE TABLE IF NOT EXISTS public.admin_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
      user_management_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      tender_management_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      system_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 1. Test POST /rest/v1/rpc/exec_sql
  try {
    const res1 = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log("exec_sql response status:", res1.status, await res1.text());
  } catch (e) {
    console.log("exec_sql error:", e.message);
  }

  // 2. Test POST /pg/query
  try {
    const res2 = await fetch(`${url}/pg/query`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log("/pg/query response status:", res2.status, await res2.text());
  } catch (e) {
    console.log("/pg/query error:", e.message);
  }
}

testSqlExec();
