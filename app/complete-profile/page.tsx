"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Building2, AlertCircle } from "lucide-react";
import { NirmanLogo } from "@/components/nirman-logo";
import { createClient } from "@/lib/supabase/client";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "contractor">("owner");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Insert into profiles
      const { error: profErr } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        email: user.email,
        phone: phone || null,
        role: role,
        status: "pending",
      }, { onConflict: "id" });

      if (profErr) throw new Error(profErr.message);

      // 2. Insert into role-specific table
      if (role === "owner") {
        const { error: ownerErr } = await supabase.from("owners").upsert({
          id: user.id,
          full_name: fullName,
          phone: phone || null,
          company_name: companyName || fullName,
        }, { onConflict: "id" });
        if (ownerErr) throw new Error(ownerErr.message);
      } else {
        const { error: contErr } = await supabase.from("contractors").upsert({
          id: user.id,
          company_name: companyName || fullName,
          contact_person: fullName,
          phone: phone || null,
          email: user.email,
        }, { onConflict: "id" });
        if (contErr) throw new Error(contErr.message);
      }

      router.push("/account-pending");
    } catch (err: any) {
      setError(err.message || "Unable to complete profile.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <NirmanLogo size="lg" priority />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-xs text-muted-foreground">
            Please provide your details to finish setting up your account.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1 border">
            <button
              type="button"
              onClick={() => setRole("owner")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                role === "owner" ? "bg-card text-orange-600 shadow-sm" : "text-muted-foreground"
              }`}
            >
              <UserCheck className="h-4 w-4" /> Property Owner
            </button>
            <button
              type="button"
              onClick={() => setRole("contractor")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                role === "contractor" ? "bg-card text-orange-600 shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" /> Contractor
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              {role === "contractor" ? "Company Name" : "Company / Organization (Optional)"}
            </label>
            <input
              type="text"
              required={role === "contractor"}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={role === "contractor" ? "BuildPro Pvt Ltd" : "Individual / Firm Name"}
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving Profile..." : "Save Profile & Submit for Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}
